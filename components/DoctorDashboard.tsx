import React, { useState } from 'react';
import { 
  Users, AlertTriangle, FileText, CheckCircle2, Activity, LayoutGrid, Calendar, 
  MessageSquare, Bell, Search, LogOut, Send, X, Menu, ChevronRight, ChevronLeft,
  Video, MapPin, Clock, Plus, HelpCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useData } from '../contexts/DataContext';
import { Patient } from '../types';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { patients, currentUser, logout, sendDoctorMessage, appointments, cancelAppointment, addPatient } = useData();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'schedule' | 'inbox'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop toggle

  // Modal State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'note' | 'prescription'>('note');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Add Patient Modal State
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientConditions, setNewPatientConditions] = useState('');

  // Filter patients based on search
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.condition.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to determine status based on last log
  const getPatientStatus = (patient: Patient) => {
    if (!patient.logs || patient.logs.length === 0) {
        return { 
            label: 'New / No Data', 
            color: 'bg-slate-100 text-slate-600 border border-slate-200',
            icon: HelpCircle 
        };
    }
    
    // Sort to guarantee latest log
    const sortedLogs = [...patient.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const lastLog = sortedLogs[0];
    
    if (lastLog.status === 'Critical' || lastLog.status === 'High') {
        return { 
            label: 'Critical', 
            color: 'bg-red-50 text-red-700 border border-red-200 animate-pulse', 
            icon: AlertTriangle 
        };
    } else if (lastLog.status === 'Elevated') {
        return { 
            label: 'Review Needed', 
            color: 'bg-amber-50 text-amber-700 border border-amber-200', 
            icon: AlertTriangle 
        };
    } else {
        return { 
            label: 'Stable', 
            color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 
            icon: CheckCircle2 
        };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openPrescribeModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setMessageType('prescription');
    setMessageText('');
  };

  const sendMessage = () => {
    if (selectedPatient && messageText.trim()) {
      sendDoctorMessage(selectedPatient.id, messageText, messageType);
      setSelectedPatient(null);
      setMessageText('');
      alert('Plan sent successfully!');
    }
  };

  const handleAddPatient = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPatientName && newPatientAge) {
          addPatient({
              name: newPatientName,
              age: parseInt(newPatientAge),
              condition: newPatientConditions.split(',').map(c => c.trim()).filter(c => c.length > 0)
          });
          setIsAddPatientOpen(false);
          setNewPatientName('');
          setNewPatientAge('');
          setNewPatientConditions('');
      }
  };

  // Sort appointments
  const upcomingAppointments = appointments
    .filter(a => a.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Navigation Items Config
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
  ] as const;

  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard':
            return (
                <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Patient Overview</h2>
                        <p className="text-slate-500">{patients.filter(p => {
                            const s = getPatientStatus(p).label;
                            return s === 'Critical' || s === 'Review Needed';
                        }).length} patients require attention today based on AI analysis.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddPatientOpen(true)}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-sky-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Plus size={18} /> New Patient
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        <input 
                            type="text" 
                            placeholder="Filter by name or condition..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all shadow-sm" 
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
    
                {filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map(p => {
                        const statusConfig = getPatientStatus(p);
                        const StatusIcon = statusConfig.icon;
                        
                        // Get last 5 logs for sparklines (sorted newest first for accessing lastLog, then reversed for chart)
                        const sortedLogs = [...(p.logs || [])].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                        const lastLog = sortedLogs[0];
                        
                        // Take up to 5 logs and reverse them so they are chronological (Left -> Right)
                        const sparklineData = sortedLogs.slice(0, 5).reverse();
                        
                        return (
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden border border-slate-200">
                                            <img src={`https://ui-avatars.com/api/?name=${p.name.replace(' ', '+')}&background=random`} alt={p.name} className="w-full h-full" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{p.name}</h3>
                                            <p className="text-xs text-slate-500">{p.age} yrs • {p.condition.join(', ')}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${statusConfig.color}`}>
                                        <StatusIcon size={14} />
                                        {statusConfig.label}
                                    </span>
                                </div>
        
                                {/* Vitals & Sparklines */}
                                <div className="space-y-3 mb-6">
                                    
                                    {/* Blood Pressure Section */}
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-end justify-between mb-1">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-0.5">
                                                    <Activity size={10} /> Blood Pressure
                                                </div>
                                                <div className="text-lg font-bold text-slate-800 leading-none">
                                                    {lastLog ? `${lastLog.systolic}/${lastLog.diastolic}` : '--/--'}
                                                </div>
                                            </div>
                                            {/* BP Sparkline */}
                                            <div className="h-8 w-24">
                                                {sparklineData.length > 1 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={sparklineData}>
                                                            <Line type="monotone" dataKey="systolic" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                                            <Line type="monotone" dataKey="diastolic" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full flex items-center justify-end text-[9px] text-slate-300 italic">No Trend</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
        
                                    {/* Glucose Section */}
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-end justify-between mb-1">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-0.5">
                                                    <Activity size={10} /> Glucose
                                                </div>
                                                <div className="text-lg font-bold text-slate-800 leading-none">
                                                    {lastLog ? lastLog.glucose : '--'} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                                                </div>
                                            </div>
                                            {/* Glucose Sparkline */}
                                            <div className="h-8 w-24">
                                                {sparklineData.length > 1 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={sparklineData}>
                                                            <Line type="monotone" dataKey="glucose" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full flex items-center justify-end text-[9px] text-slate-300 italic">No Trend</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
        
                                </div>
        
                                {statusConfig.label === 'Critical' && (
                                    <div className="mb-4 bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-700 flex gap-2">
                                        <AlertTriangle size={16} className="shrink-0" />
                                        <div>
                                        <strong>AI Alert:</strong> Recent vitals indicate instability. Immediate review recommended.
                                        </div>
                                    </div>
                                )}
        
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openPrescribeModal(p)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FileText size={16} /> Prescribe Plan
                                    </button>
                                    <button className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                                        View Log
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="opacity-40" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No patients found</h3>
                        <p>No results match "{searchQuery}"</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-sky-600 font-bold hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </>
            );
          case 'schedule':
            return (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Upcoming Appointments</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {upcomingAppointments.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-medium">No appointments scheduled</h3>
                                <p>Enjoy your free time, Doctor.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {upcomingAppointments.map(appt => (
                                    <div key={appt.id} className={`p-6 flex items-center justify-between transition-colors ${appt.status === 'cancelled' ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border ${appt.status === 'cancelled' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                                                <span className="text-xs font-bold uppercase">{appt.date.toLocaleDateString([], {weekday: 'short'})}</span>
                                                <span className="text-xl font-bold">{appt.date.getDate()}</span>
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${appt.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{appt.patientName}</h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={14}/> {appt.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                                        {appt.type === 'video' ? <Video size={12}/> : <MapPin size={12}/>} 
                                                        {appt.type === 'video' ? 'Video Call' : 'In-Person'}
                                                    </span>
                                                </div>
                                                {appt.reason && <p className="text-sm text-slate-600 mt-2 italic">"{appt.reason}"</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => cancelAppointment(appt.id)}
                                                disabled={appt.status === 'cancelled'}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                    appt.status === 'cancelled' 
                                                    ? 'text-slate-400 bg-slate-100 cursor-not-allowed' 
                                                    : 'text-red-600 hover:bg-red-50'
                                                }`}
                                            >
                                                {appt.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                                            </button>
                                            {appt.status !== 'cancelled' && (
                                                <button className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors">Details</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
          default:
            return (
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 mb-1">Coming Soon</h3>
                    <p>The {navItems.find(i => i.id === activeTab)?.label} module is under development.</p>
                    <button onClick={() => setActiveTab('dashboard')} className="mt-4 text-sky-600 font-medium hover:underline">
                        Return to Dashboard
                    </button>
                </div>
            );
      }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'} border-b border-slate-800/50 transition-all duration-300`}>
        {!isSidebarCollapsed ? (
             <Link to="/" className="flex items-center gap-2 text-white overflow-hidden whitespace-nowrap">
               <div className="bg-sky-500 p-1.5 rounded-lg text-white shrink-0">
                 <Activity size={20} />
               </div>
               <div>
                 <h1 className="text-lg font-bold leading-none">CarePlanner</h1>
                 <p className="text-[10px] font-bold text-sky-500 tracking-wider uppercase">Pro Portal</p>
               </div>
             </Link>
        ) : (
            <Link to="/" className="bg-sky-500 p-2 rounded-xl text-white">
                 <Activity size={24} />
            </Link>
        )}
        
        {/* Close Button only for Mobile */}
        {!isSidebarCollapsed && (
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white transition-colors">
                <X size={24} />
             </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    title={isSidebarCollapsed ? item.label : ''}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                        isActive 
                            ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                    <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    
                    {!isSidebarCollapsed && (
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                            {item.label}
                        </div>
                    )}
                </button>
            )
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/50">
        <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Sign Out"
        >
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
              onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out shadow-xl
          md:translate-x-0 md:static
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
          <SidebarContent />
          
          {/* Desktop Collapse Button */}
          <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-3 top-20 bg-white text-slate-600 p-1.5 rounded-full shadow-md border border-slate-100 hidden md:flex hover:text-sky-600 transition-colors z-50 items-center justify-center hover:scale-110 active:scale-95"
          >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Sticky Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                  <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                      <Menu size={24} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
                    {navItems.find(i => i.id === activeTab)?.label}
                  </h2>
              </div>

              <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-9 pr-4 py-2 text-sm bg-slate-100 border-transparent focus:bg-white border focus:border-sky-500 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500/20 w-48 transition-all" 
                    />
                  </div>

                  {/* Notifications */}
                  <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  </button>

                  <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                  {/* Profile */}
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                       <div className="text-sm font-bold text-slate-800 leading-none">{currentUser?.name || 'Dr. Carter'}</div>
                       <div className="text-xs text-slate-500 mt-1">Cardiology</div>
                    </div>
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-sm hover:ring-2 hover:ring-sky-500/20 transition-all cursor-pointer">
                        <img src={currentUser?.avatar || "https://ui-avatars.com/api/?name=Dr+Carter"} alt="Doc" className="w-full h-full object-cover" />
                    </div>
                 </div>
              </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
              <div className="max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
                 {renderContent()}
              </div>
          </main>
      </div>

      {/* Prescription Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Prescribe Plan for {selectedPatient.name}</h3>
                <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             <div className="p-6">
                <div className="flex gap-4 mb-4">
                   <button 
                     onClick={() => setMessageType('prescription')}
                     className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${messageType === 'prescription' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-slate-200 text-slate-600'}`}
                   >
                     Prescription
                   </button>
                   <button 
                     onClick={() => setMessageType('note')}
                     className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${messageType === 'note' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
                   >
                     General Note
                   </button>
                </div>
                
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={messageType === 'prescription' ? "e.g. Increase Lisinopril to 20mg daily..." : "e.g. Great job on the blood pressure control..."}
                  className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none mb-4"
                />

                <div className="flex justify-end gap-3">
                   <button onClick={() => setSelectedPatient(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">Cancel</button>
                   <button 
                     onClick={sendMessage}
                     disabled={!messageText.trim()}
                     className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                   >
                     <Send size={16} /> Send to Patient
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={20}/> Add New Patient</h3>
                    <button onClick={() => setIsAddPatientOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddPatient} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={newPatientName}
                            onChange={e => setNewPatientName(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            max="120"
                            value={newPatientAge}
                            onChange={e => setNewPatientAge(e.target.value)}
                            placeholder="e.g. 45"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Conditions (Comma separated)</label>
                        <input 
                            type="text" 
                            value={newPatientConditions}
                            onChange={e => setNewPatientConditions(e.target.value)}
                            placeholder="e.g. Hypertension, Diabetes"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsAddPatientOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-200"
                        >
                            Create Patient Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;