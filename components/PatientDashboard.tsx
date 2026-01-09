import React, { useState, useEffect, useRef } from 'react';
import { Activity, Plus, TrendingUp, AlertCircle, Heart, Calendar, LayoutDashboard, FileText, MessageSquare, Settings, Bell, Stethoscope, ChevronRight, LogOut, ArrowLeft, Info, CheckCircle, AlertTriangle, AlertOctagon, Mail, Video, MapPin, Clock, X, Star, Smile, Frown, Meh, ThumbsUp, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { analyzeVitalsWithGemini } from '../services/gemini';
import { VitalLog, AIAnalysisResult, Patient } from '../types';
import AIChat from './AIChat';
import PatientProfileModal from './PatientProfileModal';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

// Alert Box Component
const AIAlertBox: React.FC<{ alert: AIAnalysisResult }> = ({ alert }) => {
    const getAlertConfig = (riskLevel: string) => {
        switch (riskLevel) {
          case 'Normal':
            return {
              bg: 'bg-emerald-50',
              border: 'border-emerald-200',
              iconBg: 'bg-emerald-100',
              iconColor: 'text-emerald-600',
              titleColor: 'text-emerald-800',
              Icon: CheckCircle
            };
          case 'Elevated':
            return {
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-600',
              titleColor: 'text-amber-800',
              Icon: AlertTriangle
            };
          case 'High':
          case 'Critical':
            return {
              bg: 'bg-red-50',
              border: 'border-red-200',
              iconBg: 'bg-red-100',
              iconColor: 'text-red-600',
              titleColor: 'text-red-800',
              Icon: AlertOctagon
            };
          default:
            return {
              bg: 'bg-slate-50',
              border: 'border-slate-200',
              iconBg: 'bg-slate-100',
              iconColor: 'text-slate-600',
              titleColor: 'text-slate-800',
              Icon: Info
            };
        }
    };

    const config = getAlertConfig(alert.riskLevel);
    const AlertIcon = config.Icon;

    return (
        <div className={`rounded-2xl p-6 animate-in slide-in-from-top-4 duration-500 border shadow-sm ${config.bg} ${config.border}`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${config.iconBg} ${config.iconColor}`}>
                <AlertIcon size={28} />
                </div>
                <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${config.titleColor}`}>
                    Analysis Complete: {alert.riskLevel} Risk
                </h3>

                {/* Enhanced Patient Advice */}
                <div className="bg-white/70 rounded-xl p-4 border border-white/60 mb-4 shadow-sm relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.iconColor.replace('text-', 'bg-')}`}></div>
                    <div className="flex gap-3">
                        <MessageSquare className={`shrink-0 mt-0.5 ${config.iconColor}`} size={18} />
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CareCoach Advice</div>
                            <p className="text-slate-800 font-medium leading-relaxed italic">
                                "{alert.patientAdvice}"
                            </p>
                        </div>
                    </div>
                </div>
                
                {alert.actionPlan && (
                    <div className="bg-white/60 rounded-xl p-4 text-sm mb-4">
                    <strong className="block mb-2 text-slate-900">Recommended Actions:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {alert.actionPlan.map((step, i) => (
                        <li key={i}>{step}</li>
                        ))}
                    </ul>
                    </div>
                )}

                {/* Clinical Context / Doctor Alert Section */}
                <div className="mb-4 p-3 bg-white/40 rounded-lg border border-slate-200/50">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText size={12} /> Clinical Context (AI)
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                        "{alert.doctorAlert}"
                    </p>
                </div>

                {/* Doctor Action Section */}
                <div className="bg-white/80 rounded-xl p-4 border border-white/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Clinical Protocol</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-100 text-sky-700 rounded-lg text-xs font-bold">
                        <Activity size={12} />
                        AI Agent Active
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                        <Stethoscope size={20} />
                        </div>
                        <div className="flex-1">
                        <div className="text-sm text-slate-500">Suggested Doctor Action:</div>
                        <div className="font-bold text-slate-800">{alert.recommendedClinicalAction || "Monitor Vitals"}</div>
                        </div>
                        <button className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1">
                        Notify <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                </div>
            </div>
        </div>
    );
};

const BookingModal: React.FC<{ isOpen: boolean; onClose: () => void; patientId: string; patientName: string }> = ({ isOpen, onClose, patientId, patientName }) => {
    const { bookAppointment, appointments } = useData();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [type, setType] = useState<'video' | 'in-person'>('video');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Availability Data - 3 days out
    const today = new Date();
    const dates = Array.from({length: 3}, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i + 1);
        return d;
    });

    const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:15 PM'];

    // Check availability against actual confirmed appointments
    const isSlotAvailable = (dateStr: string, slot: string) => {
        return !appointments.some(a => {
            if (a.status === 'cancelled') return false;
            // Compare date string
            const apptDateStr = a.date.toDateString();
            if (apptDateStr !== dateStr) return false;

            // Compare time string (Enforcing en-US to match timeSlots format)
            const apptTimeStr = a.date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
            return apptTimeStr === slot;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        setTimeout(() => {
            const dateObj = new Date(selectedDate);
            // Parse time roughly for mock
            const [time, modifier] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
            dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));

            bookAppointment({
                patientId,
                patientName,
                doctorName: 'Dr. Carter',
                date: dateObj,
                type,
                reason: reason || 'General Consultation'
            });
            setIsSubmitting(false);
            onClose();
            // Reset form
            setSelectedDate('');
            setSelectedTime('');
            setReason('');
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><Calendar size={20}/> Book Consultation</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label>
                        <div className="grid grid-cols-3 gap-2">
                            {dates.map(d => {
                                const dateStr = d.toDateString();
                                return (
                                    <button
                                        key={dateStr}
                                        type="button"
                                        onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                                        className={`p-2 rounded-xl border text-sm transition-all ${
                                            selectedDate === dateStr 
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                                                : 'border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                                        }`}
                                    >
                                        <div className="text-xs opacity-80">{d.toLocaleDateString([], {weekday: 'short'})}</div>
                                        <div className="font-bold">{d.getDate()}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="animate-in slide-in-from-top-2 fade-in">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Time</label>
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map(time => {
                                    const available = isSlotAvailable(selectedDate, time);
                                    return (
                                        <button
                                            key={time}
                                            type="button"
                                            disabled={!available}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-2 rounded-xl border text-sm transition-all ${
                                                selectedTime === time 
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                                                    : available 
                                                        ? 'border-slate-200 hover:border-emerald-500 hover:text-emerald-600' 
                                                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed decoration-slice'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Consultation Type</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType('video')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${type === 'video' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Video size={16} /> Video Call
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('in-person')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${type === 'in-person' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <MapPin size={16} /> In-Person
                            </button>
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reason (Optional)</label>
                         <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly describe your symptoms or questions..."
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20"
                         />
                    </div>

                    <button 
                        type="submit"
                        disabled={!selectedDate || !selectedTime || isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const FeedbackModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { addFeedback, currentUser } = useData();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComment('');
            setSubmitted(false);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        
        addFeedback({
            userId: currentUser?.id || 'anonymous',
            userName: currentUser?.name || 'Anonymous',
            rating,
            comment
        });
        setSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Star size={18} className="text-amber-500 fill-amber-500"/> Rate Experience</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                
                <div className="p-6">
                    {submitted ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <ThumbsUp size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h3>
                            <p className="text-slate-500">Your feedback helps us improve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">How was your session?</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star 
                                                size={32} 
                                                className={`${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'} transition-colors`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="h-5 text-sm font-medium text-emerald-600">
                                    {rating === 1 && "Not helpful"}
                                    {rating === 2 && "Could be better"}
                                    {rating === 3 && "It was okay"}
                                    {rating === 4 && "Good"}
                                    {rating === 5 && "Excellent!"}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comments (Optional)</label>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what you liked or what we can improve..."
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={rating === 0}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Feedback
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, addVitalLog, updatePatient, patients, markMessagesRead, appointments } = useData();
  
  // Find full patient object from context based on logged in user
  const patientData = patients.find(p => p.id === currentUser?.id);

  // Loading state if patient data isn't ready
  if (!currentUser || !patientData) {
      return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-emerald-600"><Activity size={40}/></div></div>;
  }

  // Local State
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [glucose, setGlucose] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Computed Stats
  const latestLog = patientData.logs.length > 0 
    ? patientData.logs.reduce((prev, current) => (prev.timestamp > current.timestamp) ? prev : current)
    : null;
  
  const sortedLogs = [...patientData.logs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const unreadMessages = patientData.messages ? patientData.messages.filter(m => !m.isRead).length : 0;
  
  // Filter appointments for this patient
  const myAppointments = appointments.filter(a => a.patientId === patientData.id && a.status !== 'cancelled');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic || !diastolic || !glucose) return;
    
    setAiAnalyzing(true);
    setAnalysisResult(null);

    // 1. AI Analysis via Gemini Service
    const result = await analyzeVitalsWithGemini(Number(systolic), Number(diastolic), Number(glucose));
    
    // 2. Add Log to Context
    const newLog: VitalLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      glucose: Number(glucose),
      status: result.riskLevel
    };
    
    addVitalLog(patientData.id, newLog);
    setAnalysisResult(result);
    setAiAnalyzing(false);
    
    // Reset Form
    setSystolic('');
    setDiastolic('');
    setGlucose('');
  };

  const handleUpdateProfile = (updated: Patient) => {
    updatePatient(updated);
    setShowProfileModal(false);
  };

  const NavItem = ({ id, icon: Icon, label, badge }: { id: string, icon: any, label: string, badge?: number }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        activeTab === id 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
          : 'text-slate-500 hover:bg-white hover:shadow-md'
      }`}
    >
      <Icon size={20} className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-semibold">{label}</span>
      {badge ? (
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-50/80 backdrop-blur-xl border-r border-slate-200 p-6 flex flex-col transition-transform duration-300 ease-out md:translate-x-0 md:static ${
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Care<span className="text-emerald-600">Planner</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="history" icon={FileText} label="History" />
          <NavItem id="messages" icon={Mail} label="Messages" badge={unreadMessages} />
          <NavItem id="appointments" icon={Calendar} label="Appointments" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200 space-y-2">
            <button 
                onClick={() => setShowFeedbackModal(true)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-white hover:shadow-md hover:text-amber-500 transition-all duration-300"
            >
                <Star size={20} />
                <span className="font-semibold">Rate App</span>
            </button>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 hover:shadow-md transition-all duration-300"
            >
                <LogOut size={20} />
                <span className="font-semibold">Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 px-6 md:px-10 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              <LayoutDashboard size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {activeTab === 'overview' && 'Health Overview'}
              {activeTab === 'history' && 'Vitals History'}
              {activeTab === 'messages' && 'Doctor Messages'}
              {activeTab === 'appointments' && 'Consultations'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowBookingModal(true)}
                className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95"
             >
                <Plus size={16} /> Book Appt
             </button>
             <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
             <div 
                className="flex items-center gap-3 pl-2 cursor-pointer group"
                onClick={() => setShowProfileModal(true)}
             >
                <div className="text-right hidden sm:block">
                   <div className="text-sm font-bold text-slate-800">{patientData.name}</div>
                   <div className="text-xs text-slate-500">{patientData.age} yrs • ID: #{patientData.id}</div>
                </div>
                <div className="relative">
                    <img 
                        src={patientData.avatar || "https://picsum.photos/200"} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* Risk Score Card */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                      <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">Current Risk Score</h3>
                      <div className="relative flex items-center justify-center mb-2">
                         <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                            <circle 
                                cx="64" cy="64" r="56" stroke={patientData.riskScore > 50 ? '#ef4444' : '#10b981'} strokeWidth="12" fill="none" 
                                strokeDasharray="351.86" strokeDashoffset={351.86 - (351.86 * patientData.riskScore) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-800">{patientData.riskScore}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
                         </div>
                      </div>
                      <p className={`text-sm font-bold px-3 py-1 rounded-full ${patientData.riskScore > 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {patientData.riskScore > 50 ? 'Attention Needed' : 'Stable Condition'}
                      </p>
                   </div>

                   {/* Latest BP */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-emerald-200 transition-colors">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Blood Pressure</h3>
                            <div className="mt-2 text-3xl font-bold text-slate-800">
                               {latestLog ? `${latestLog.systolic}/${latestLog.diastolic}` : '--/--'}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">mmHg</div>
                         </div>
                         <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity size={20} />
                         </div>
                      </div>
                      <div className="mt-6">
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 w-[70%] rounded-full"></div>
                         </div>
                         <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                            <span>Normal Range</span>
                            <span className="text-sky-600">Within Limits</span>
                         </div>
                      </div>
                   </div>

                   {/* Latest Glucose */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-amber-200 transition-colors">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Glucose Level</h3>
                            <div className="mt-2 text-3xl font-bold text-slate-800">
                               {latestLog ? latestLog.glucose : '--'}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">mg/dL</div>
                         </div>
                         <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity size={20} />
                         </div>
                      </div>
                      <div className="mt-6">
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[45%] rounded-full"></div>
                         </div>
                         <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                            <span>Fasting Target</span>
                            <span className="text-amber-600">Optimal</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Vitals Input & AI Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                            <Plus size={24} />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-slate-800">Log New Vitals</h3>
                            <p className="text-xs text-slate-500">Update your health metrics daily</p>
                         </div>
                      </div>

                      <form onSubmit={handleLogVitals} className="space-y-5">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Systolic (Top)</label>
                               <input 
                                 type="number" 
                                 required
                                 placeholder="120" 
                                 value={systolic}
                                 onChange={(e) => setSystolic(e.target.value)}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Diastolic (Bot)</label>
                               <input 
                                 type="number" 
                                 required
                                 placeholder="80" 
                                 value={diastolic}
                                 onChange={(e) => setDiastolic(e.target.value)}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Glucose (mg/dL)</label>
                            <input 
                              type="number" 
                              required
                              placeholder="95" 
                              value={glucose}
                              onChange={(e) => setGlucose(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                            />
                         </div>
                         
                         <button 
                           type="submit" 
                           disabled={aiAnalyzing}
                           className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                         >
                            {aiAnalyzing ? (
                               <>
                                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                 Running AI Analysis...
                               </>
                            ) : (
                               <>
                                 <span>Save & Analyze</span>
                                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                               </>
                            )}
                         </button>
                      </form>
                   </div>

                   {/* AI Feedback Panel */}
                   <div className="flex flex-col gap-6">
                      {analysisResult ? (
                          <AIAlertBox alert={analysisResult} />
                      ) : (
                          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                  <Activity className="text-slate-300" size={32} />
                              </div>
                              <h3 className="text-slate-500 font-bold mb-2">No Analysis Yet</h3>
                              <p className="text-sm text-slate-400 max-w-xs">Log your vitals to receive instant, AI-powered health insights and clinical recommendations.</p>
                          </div>
                      )}
                   </div>
                </div>

                {/* Charts Area */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Health Trends</h3>
                            <p className="text-xs text-slate-500">Last 7 days visual history</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        {sortedLogs.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sortedLogs}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        tickFormatter={(t) => new Date(t).toLocaleDateString([], {day:'2-digit', month:'2-digit'})} 
                                        stroke="#94a3b8" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10}/>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleString()}
                                    />
                                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                                    <Line type="monotone" name="Systolic BP" dataKey="systolic" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke:'#fff'}} activeDot={{r: 6}} />
                                    <Line type="monotone" name="Diastolic BP" dataKey="diastolic" stroke="#34d399" strokeWidth={3} dot={{r: 4, fill: '#34d399', strokeWidth: 2, stroke:'#fff'}} activeDot={{r: 6}} />
                                    <Line type="monotone" name="Glucose" dataKey="glucose" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke:'#fff'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                <TrendingUp size={48} className="mb-4 opacity-50"/>
                                <p className="font-medium">No trend data available yet</p>
                            </div>
                        )}
                    </div>
                </div>

              </div>
            )}

            {activeTab === 'appointments' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Your Consultations</h2>
                        <button 
                            onClick={() => setShowBookingModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
                        >
                            + New Booking
                        </button>
                    </div>
                    
                    {myAppointments.length > 0 ? (
                        <div className="grid gap-4">
                            {myAppointments.map(appt => (
                                <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-sky-50 text-sky-700 rounded-2xl border border-sky-100">
                                            <span className="text-xs font-bold uppercase">{appt.date.toLocaleDateString([], {weekday:'short'})}</span>
                                            <span className="text-2xl font-bold">{appt.date.getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{appt.doctorName}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                                <Clock size={14} />
                                                <span>{appt.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                                                    {appt.type === 'video' ? <Video size={12}/> : <MapPin size={12}/>} 
                                                    {appt.type === 'video' ? 'Video Call' : 'In-Person'}
                                                </span>
                                            </div>
                                            {appt.reason && <p className="text-sm text-slate-400 mt-2 italic">"{appt.reason}"</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Reschedule</button>
                                        <button className="flex-1 md:flex-none px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-100">
                                            {appt.type === 'video' ? 'Join Call' : 'View Details'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                 <Calendar size={32} className="text-slate-300"/>
                             </div>
                             <h3 className="text-lg font-bold text-slate-800 mb-2">No Appointments Scheduled</h3>
                             <p className="text-slate-500 mb-6 max-w-sm mx-auto">Book a consultation with Dr. Carter to review your progress and adjust your care plan.</p>
                             <button 
                                onClick={() => setShowBookingModal(true)}
                                className="text-emerald-600 font-bold hover:underline"
                             >
                                Schedule Now
                             </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-slate-800">Messages from Dr. Carter</h2>
                     {unreadMessages > 0 && (
                         <button 
                             onClick={() => markMessagesRead(patientData.id)}
                             className="text-sm font-bold text-sky-600 hover:text-sky-700 underline decoration-2 underline-offset-4"
                         >
                             Mark all as read
                         </button>
                     )}
                 </div>
                 
                 <div className="space-y-4">
                     {patientData.messages && patientData.messages.length > 0 ? (
                         patientData.messages.sort((a,b) => b.date.getTime() - a.date.getTime()).map((msg) => (
                             <div key={msg.id} className={`bg-white p-6 rounded-3xl border transition-all ${!msg.isRead ? 'border-sky-200 shadow-md ring-1 ring-sky-100' : 'border-slate-100 shadow-sm'}`}>
                                 <div className="flex items-start gap-4">
                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                         msg.type === 'prescription' ? 'bg-emerald-100 text-emerald-600' : 
                                         msg.type === 'alert' ? 'bg-red-100 text-red-600' : 
                                         'bg-sky-100 text-sky-600'
                                     }`}>
                                         {msg.type === 'prescription' ? <FileText size={20}/> : msg.type === 'alert' ? <AlertTriangle size={20}/> : <MessageSquare size={20}/>}
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-2">
                                             <div>
                                                 <h4 className="font-bold text-slate-800">{msg.doctorName}</h4>
                                                 <p className="text-xs text-slate-500">{msg.date.toLocaleDateString()} • {msg.date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                             </div>
                                             {!msg.isRead && (
                                                 <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                                             )}
                                         </div>
                                         <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                             {msg.text}
                                         </p>
                                         {msg.type === 'prescription' && (
                                             <div className="mt-3 flex gap-2">
                                                 <button className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                                                     View Prescription
                                                 </button>
                                                 <button className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                                                     Pharmacy Finder
                                                 </button>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         ))
                     ) : (
                         <div className="text-center py-12 text-slate-400">
                             <Mail size={48} className="mx-auto mb-4 opacity-20"/>
                             <p>No messages yet.</p>
                         </div>
                     )}
                 </div>
               </div>
            )}
            
            {activeTab === 'history' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-lg text-slate-800">Detailed Vitals Log</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Blood Pressure</th>
                                    <th className="px-6 py-4">Glucose</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {sortedLogs.length > 0 ? (
                                    sortedLogs.reverse().map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="font-bold text-slate-800">{log.timestamp.toLocaleDateString()}</div>
                                                <div className="text-xs">{log.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">{log.systolic}/{log.diastolic}</span> <span className="text-xs text-slate-400">mmHg</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">{log.glucose}</span> <span className="text-xs text-slate-400">mg/dL</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    log.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                                                    log.status === 'Elevated' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No logs recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
          </div>
        </div>

      </main>

      {/* Profile Modal */}
      <PatientProfileModal 
         isOpen={showProfileModal} 
         onClose={() => setShowProfileModal(false)}
         patient={patientData}
         onUpdate={handleUpdateProfile}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        patientId={patientData.id}
        patientName={patientData.name}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* AI Chat Bot */}
      <AIChat isOpen={true} />
    </div>
  );
};

export default PatientDashboard;