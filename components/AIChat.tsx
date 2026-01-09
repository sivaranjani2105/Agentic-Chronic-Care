import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Trash2, Maximize2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { getChatResponseStream } from '../services/gemini';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';
import { useData } from '../contexts/DataContext';

interface AIChatProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  largeTrigger?: boolean;
}

const CHAT_STORAGE_KEY = 'careplanner_chat_history';

const AIChat: React.FC<AIChatProps> = ({ isOpen: controlledIsOpen, onToggle: controlledOnToggle, largeTrigger = false }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { currentUser, patients } = useData();
  
  // Find current patient data if logged in
  const currentPatient = patients.find(p => p.id === currentUser?.id);
  
  // Initialize messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Revive Date objects from strings
          return parsed.map((m: any) => ({
             ...m,
             timestamp: new Date(m.timestamp)
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse chat history", e);
    }
    // Default welcome message
    return [{
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm CareCoach. How are you feeling today? I can help you understand your vitals or give healthy lifestyle tips.",
      timestamp: new Date()
    }];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = (newState: boolean) => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
        console.error("Failed to save chat history", e);
    }
  }, [messages]);

  const handleClearChat = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to clear the conversation history?")) {
        const welcomeMsg: ChatMessage = {
            id: 'welcome',
            role: 'model',
            text: "Hello! I'm CareCoach. How are you feeling today? I can help you understand your vitals or give healthy lifestyle tips.",
            timestamp: new Date()
        };
        setMessages([welcomeMsg]);
        localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  const handleFeedback = (messageId: string, type: 'helpful' | 'unhelpful') => {
      setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
              // Toggle off if clicking same type, otherwise set type
              const newFeedback = msg.feedback === type ? undefined : type;
              return { ...msg, feedback: newFeedback };
          }
          return msg;
      }));
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Prepare placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '', // Start empty for streaming
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMsg]);

    try {
      // Convert internal message format to Gemini history format
      // Filter out the 'welcome' message for clean context, but include previous turns
      const historyMessages = messages.filter(m => m.id !== 'welcome');
      
      const history = historyMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      // Construct Enhanced Patient Context
      let patientContext = '';
      if (currentPatient) {
          // 1. Sort and Format Vitals (Last 10 entries for better trend analysis)
          const sortedLogs = [...currentPatient.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          const recentLogs = sortedLogs.slice(0, 10).map(l => 
              `- ${l.timestamp.toLocaleDateString()} ${l.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: BP ${l.systolic}/${l.diastolic} mmHg, Glucose ${l.glucose} mg/dL (${l.status})`
          ).join('\n');

          // 2. Format Recent Doctor Messages
          const recentMessages = (currentPatient.messages || [])
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 3)
            .map(m => `- [${m.date.toLocaleDateString()}] Dr. ${m.doctorName} (${m.type}): "${m.text}"`)
            .join('\n');

          // 3. Construct Context String with Summary
          const conditionList = currentPatient.condition.length > 0 ? currentPatient.condition.join(', ') : 'no chronic conditions';
          const patientSummary = `Patient is a ${currentPatient.age}-year-old individual managing ${conditionList}.`;

          patientContext = `
PATIENT SUMMARY: ${patientSummary}

DETAILED PROFILE:
Name: ${currentPatient.name}
Age: ${currentPatient.age}
Conditions: ${conditionList}
Current Risk Score: ${currentPatient.riskScore} (Scale 0-100)

RECENT VITALS HISTORY (Newest First):
${recentLogs || "No vitals recorded yet."}

DOCTOR'S RECENT INSTRUCTIONS:
${recentMessages || "No recent messages from the care team."}

INSTRUCTIONS FOR AI:
- Tailor advice to the patient's age (${currentPatient.age}) and specific conditions (${conditionList}).
- Use the vitals history to identify trends (e.g., "I noticed your blood pressure is trending down").
- Reference doctor instructions if relevant to the user's question.
- Keep responses encouraging but clinically grounded.
`;
      }

      const stream = await getChatResponseStream(history, userMsg.text, patientContext);
      
      let fullText = '';
      for await (const chunk of stream) {
          const contentResponse = chunk as GenerateContentResponse;
          const chunkText = contentResponse.text || '';
          fullText += chunkText;
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
          ));
      }

    } catch (err) {
      console.error(err);
      // Update the placeholder with error message if empty, or append error if partial
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
            ? { ...msg, text: msg.text + (msg.text ? "\n\n" : "") + "[Connection Error: Please try again]" } 
            : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine container classes based on state
  const containerClasses = isOpen 
    ? "fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    : "fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none";

  return (
    <div className={containerClasses} onClick={() => isOpen && handleToggle(false)}>
      
      {/* Chat Window (Centered Modal when Open) */}
      {isOpen && (
        <div 
            onClick={(e) => e.stopPropagation()} // Prevent backdrop click
            className="w-full max-w-lg h-[80vh] max-h-[700px] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 relative"
        >
            {/* Header */}
            <div className="bg-emerald-600 p-5 flex justify-between items-center text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    CareCoach AI
                    {isLoading && <Loader2 size={16} className="animate-spin text-emerald-200" />}
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium opacity-90">
                    {currentPatient ? `Assisting ${currentPatient.name.split(' ')[0]}` : "Personal Health Assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearChat}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors text-emerald-100 hover:text-white"
                  title="Clear Conversation"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => handleToggle(false)}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
              {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                const isGenerating = isLoading && isLastMessage;

                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                      msg.role === 'user' ? 'bg-sky-100 text-sky-600 border-sky-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                    }`}>
                      {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-sky-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                      }`}>
                          {/* If message is empty and loading, show bouncing dots inside bubble */}
                          {msg.role === 'model' && !msg.text && isGenerating ? (
                              <div className="flex space-x-1 h-5 items-center px-1">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                              </div>
                          ) : (
                              <>
                                  {msg.text.split('\n').map((line, i) => (
                                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                  ))}
                                  
                                  {/* Blinking Cursor for AI generation */}
                                  {isGenerating && msg.role === 'model' && (
                                      <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-emerald-500 rounded-sm animate-pulse"></span>
                                  )}
                              </>
                          )}
                      </div>
                      
                      {/* Metadata & Feedback */}
                      <div className="flex items-center gap-2 mt-1 px-1 min-h-[20px]">
                          <span className="text-[10px] text-slate-400">
                             {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {/* Typing Indicator in Metadata */}
                          {msg.role === 'model' && isGenerating && msg.text.length > 0 && (
                               <span className="text-[10px] text-emerald-500 font-medium animate-pulse ml-2">
                                  typing...
                               </span>
                          )}

                          {msg.role === 'model' && msg.id !== 'welcome' && !isGenerating && (
                              <div className={`flex items-center gap-1 ml-2 transition-opacity duration-200 ${msg.feedback ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                  <button 
                                      onClick={() => handleFeedback(msg.id, 'helpful')}
                                      className={`p-1 rounded-full transition-colors ${msg.feedback === 'helpful' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                      title="Helpful"
                                  >
                                      <ThumbsUp size={12} />
                                  </button>
                                  <button 
                                      onClick={() => handleFeedback(msg.id, 'unhelpful')}
                                      className={`p-1 rounded-full transition-colors ${msg.feedback === 'unhelpful' ? 'bg-red-100 text-red-500' : 'hover:bg-slate-100 text-slate-400'}`}
                                      title="Not Helpful"
                                  >
                                      <ThumbsDown size={12} />
                                  </button>
                              </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 bg-white border-t border-slate-100">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your diet, symptoms, or logs..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:bg-white transition-all disabled:opacity-50"
                  disabled={isLoading}
                  autoFocus
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>

              {/* Progress/Processing Indicator */}
              {isLoading && (
                <div className="mt-3 flex items-center gap-3 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/50 w-full animate-pulse origin-left"></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                         <Sparkles size={12} className="text-emerald-500 animate-pulse" />
                         <span className="text-[10px] text-emerald-600 font-medium animate-pulse">Analyzing...</span>
                    </div>
                </div>
              )}

              <p className="text-center text-[10px] text-slate-400 mt-2">
                 AI responses are for informational purposes only. Consult a doctor for medical advice.
              </p>
            </div>
        </div>
      )}

      {/* Floating Button (Only visible when CLOSED) */}
      {!isOpen && (
        <button 
          onClick={(e) => { e.stopPropagation(); handleToggle(true); }}
          className={`pointer-events-auto group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 ${
              largeTrigger 
                ? "px-8 py-6 rounded-2xl shadow-2xl hover:shadow-emerald-400/50 ring-4 ring-emerald-100" 
                : "px-6 py-4 rounded-full shadow-lg hover:shadow-2xl hover:shadow-emerald-300/50"
          }`}
        >
          <div className="relative">
            <MessageCircle size={largeTrigger ? 32 : 24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-emerald-600"></span>
            </span>
          </div>
          <div className="flex flex-col items-start">
             <span className={`${largeTrigger ? "text-lg" : "text-sm"} font-bold`}>Ask AI Coach</span>
             <span className={`${largeTrigger ? "text-sm" : "text-[10px]"} text-emerald-100 font-medium`}>Always Online</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default AIChat;