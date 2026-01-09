import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, Shield, Brain, Heart, CheckCircle2, MessageCircle, Menu, X, Stethoscope, Smartphone, Layout, Users, Globe, Zap, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AIChat from './AIChat';
import { useData } from '../contexts/DataContext';

const LandingPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
    setIsMobileMenuOpen(false);
  };
  
  const getDashboardPath = () => {
     if (!currentUser) return '/login';
     if (currentUser.role === 'admin') return '/admin';
     if (currentUser.role === 'doctor') return '/doctor';
     return '/patient';
  };

  const dashboardPath = getDashboardPath();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Animated Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-emerald-100/40 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-[600px] h-[600px] rounded-full bg-sky-100/40 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-100/40 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Professional SaaS Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 text-2xl font-bold text-slate-900 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
             <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform duration-300">
               <Activity size={24} />
             </div>
             <span className="tracking-tight">Care<span className="text-emerald-600">Planner</span></span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
             <button onClick={() => scrollToSection('features')} className="hover:text-emerald-600 transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
             </button>
             <button onClick={() => scrollToSection('patients')} className="hover:text-emerald-600 transition-colors relative group">
                For Patients
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
             </button>
             <button onClick={() => scrollToSection('clinicians')} className="hover:text-emerald-600 transition-colors relative group">
                For Clinicians
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
             </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4 items-center">
             {!currentUser ? (
               <Link to="/login" className="text-slate-600 font-semibold hover:text-emerald-600 transition-colors px-4 py-2">
                 Sign In
               </Link>
             ) : (
                <div className="flex items-center gap-3 mr-2">
                    <span className="text-sm font-semibold text-slate-600">Hi, {currentUser.name.split(' ')[0]}</span>
                    {currentUser.avatar && (
                        <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
                    )}
                </div>
             )}
             
             <Link to={dashboardPath} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 flex items-center gap-2">
               {currentUser ? "Go to Dashboard" : "Get Started"} <ArrowRight size={16} />
             </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5 z-40 max-h-[85vh] overflow-y-auto">
             <button onClick={() => scrollToSection('features')} className="text-left text-slate-600 font-medium p-3 hover:bg-slate-50 rounded-xl">Features</button>
             <button onClick={() => scrollToSection('patients')} className="text-left text-slate-600 font-medium p-3 hover:bg-slate-50 rounded-xl">For Patients</button>
             <button onClick={() => scrollToSection('clinicians')} className="text-left text-slate-600 font-medium p-3 hover:bg-slate-50 rounded-xl">For Clinicians</button>
             <div className="h-px bg-slate-100 my-2"></div>
             <button 
                onClick={openChat}
                className="text-left w-full p-3 text-emerald-600 font-bold flex items-center gap-2 hover:bg-emerald-50 rounded-xl"
             >
                <MessageCircle size={18} /> Ask AI Coach
             </button>
             
             {!currentUser ? (
                 <Link 
                   to="/login" 
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="text-center w-full py-3.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl border border-slate-200"
                 >
                   Login
                 </Link>
             ) : (
                 <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-center w-full py-3.5 text-red-500 font-bold hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 border border-red-100">
                    <LogOut size={16}/> Sign Out
                 </button>
             )}
             
             <Link 
               to={dashboardPath} 
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-center w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors"
             >
                {currentUser ? "Go to Dashboard" : "Get Started"}
             </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 max-w-7xl mx-auto w-full gap-12 lg:gap-24 pt-32 pb-20 relative z-10">
        
        {/* Left: Text Content */}
        <div className="flex-1 text-center md:text-left animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             Powered by Gemini 1.5 Pro
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Intelligent Care for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600">Chronic Health</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            Your personal AI health companion. Real-time monitoring, autonomous risk detection, and a direct line to your doctor—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
             <Link to={dashboardPath} className="group bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 min-w-[200px] justify-center">
                {currentUser ? "Dashboard" : "Start Journey"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <button 
               onClick={() => setIsChatOpen(true)}
               className="px-8 py-4 rounded-full text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border border-slate-100 flex items-center gap-2 min-w-[200px] justify-center group"
             >
                <MessageCircle size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" /> 
                Try AI Chat
             </button>
          </div>

          <div className="mt-12 flex items-center justify-center md:justify-start gap-8 text-sm font-semibold text-slate-500">
             <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-100"><Shield size={16} className="text-emerald-500"/> HIPAA Secure</div>
             <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-100"><Zap size={16} className="text-emerald-500"/> 24/7 AI Monitoring</div>
          </div>
        </div>

        {/* Right: Visual Abstract Card (Animated) */}
        <div className="flex-1 relative hidden md:block animate-float">
           <div className="relative z-10 w-full max-w-md mx-auto aspect-square">
              {/* Abstract Blobs behind card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-[2rem] -rotate-6 transform translate-x-4 translate-y-4 opacity-60"></div>
              <div className="absolute bottom-0 left-8 w-48 h-48 bg-sky-200 rounded-full blur-xl opacity-60"></div>

              {/* Main Glass Card */}
              <div className="absolute inset-4 glass-card rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between border-white/60 bg-white/70 backdrop-blur-2xl transition-transform hover:scale-[1.02] duration-500">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Health Score</div>
                       <div className="text-4xl font-extrabold text-slate-800 mt-1">98<span className="text-lg text-emerald-500 align-top">%</span></div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 rounded-2xl shadow-inner">
                       <Heart size={28} fill="currentColor" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    {/* Simulated Stats */}
                    <div className="bg-white/80 p-4 rounded-xl flex items-center gap-4 shadow-sm border border-slate-100/50">
                       <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">BP</div>
                       <div className="flex-1">
                          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                             <span>Systolic</span>
                             <span className="text-slate-800">118</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full w-[60%] bg-blue-500 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                    
                    {/* Simulated AI Message */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
                       <div className="mt-1"><Brain size={16} className="text-emerald-600" /></div>
                       <div>
                          <div className="text-xs font-bold text-emerald-700 uppercase mb-0.5">CareCoach Insight</div>
                          <div className="text-sm text-slate-700 font-medium leading-snug">
                             "Your vitals are stable! Keep up the good hydration."
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </span>
                       Live Sync
                    </div>
                    <span>Updated 2m ago</span>
                 </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 animate-bounce duration-[3000ms] border border-slate-50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                       <Activity size={20} />
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                       <div className="text-sm font-bold text-emerald-600">Optimized</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Stats Strip */}
      <div className="bg-white border-y border-slate-100 py-12 relative z-10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
               <div className="text-3xl font-bold text-slate-900">10k+</div>
               <div className="text-sm text-slate-500 font-medium">Active Patients</div>
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-bold text-slate-900">99.9%</div>
               <div className="text-sm text-slate-500 font-medium">Uptime Reliability</div>
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-bold text-slate-900">24/7</div>
               <div className="text-sm text-slate-500 font-medium">AI Monitoring</div>
            </div>
            <div className="space-y-1">
               <div className="text-3xl font-bold text-slate-900">500+</div>
               <div className="text-sm text-slate-500 font-medium">Clinics Partnered</div>
            </div>
         </div>
      </div>

      {/* Feature Grid */}
      <div id="features" className="w-full bg-slate-50 py-24 scroll-mt-20">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Our Capabilities</span>
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Why Choose CarePlanner?</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">We bridge the gap between daily patient life and clinical oversight using advanced, compassionate AI.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Card 1 */}
               <div className="p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-default">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                     <Activity size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Vitals Tracking</h3>
                  <p className="text-slate-500 leading-relaxed">Seamlessly log Blood Pressure and Glucose. Our visual trends help you stay on track with your health goals effortlessly.</p>
               </div>
               
               {/* Card 2 */}
               <div className="p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-default relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 group-hover:bg-sky-600 group-hover:text-white">
                     <Brain size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 relative z-10">AI Care Agent</h3>
                  <p className="text-slate-500 leading-relaxed relative z-10">The AI proactively analyzes data and notifies your doctor instantly if any risks are detected, acting as your 24/7 guardian.</p>
               </div>
               
               {/* Card 3 */}
               <div className="p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-default">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-600 group-hover:text-white">
                     <Shield size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Secure & Private</h3>
                  <p className="text-slate-500 leading-relaxed">Your health data is encrypted, HIPAA compliant, and only shared with your assigned clinician. You own your data.</p>
               </div>
            </div>
         </div>
      </div>

      {/* For Patients Section */}
      <div id="patients" className="w-full py-24 bg-white scroll-mt-20 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 order-2 md:order-1 relative">
               <div className="bg-sky-50 rounded-[3rem] p-12 relative overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  
                  {/* Dashboard Mockup */}
                  <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl border border-sky-100">
                     <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Smartphone size={20} />
                           </div>
                           <div>
                              <div className="font-bold text-slate-800 text-sm">Mobile Dashboard</div>
                              <div className="text-xs text-slate-400">Viewed just now</div>
                           </div>
                        </div>
                        <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Active</div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                           <div className="h-2 bg-slate-200 rounded w-24"></div>
                           <div className="h-2 bg-emerald-400 rounded w-8"></div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                           <div className="h-2 bg-slate-200 rounded w-32"></div>
                           <div className="h-2 bg-sky-400 rounded w-12"></div>
                        </div>
                        <div className="h-24 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                           Graph Visualization Area
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 order-1 md:order-2">
               <div className="flex items-center gap-2 text-sky-600 font-bold uppercase tracking-wider mb-4 text-sm">
                  <span className="p-1 bg-sky-100 rounded"><Smartphone size={14}/></span> For Patients
               </div>
               <h2 className="text-4xl font-bold text-slate-900 mb-6">Empower Your Health Journey</h2>
               <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Take control of your chronic conditions with a simple, friendly interface. Log your daily stats, chat with our AI coach for immediate advice, and rest easy knowing your doctor is always in the loop.
               </p>
               <ul className="space-y-5">
                  <li className="flex items-center gap-4 text-slate-700 bg-slate-50 p-3 rounded-xl border border-transparent hover:border-sky-100 hover:bg-sky-50 transition-colors">
                     <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500"><CheckCircle2 size={20} /></div>
                     <span className="font-medium">Daily Health Ring visualizes your progress</span>
                  </li>
                  <li className="flex items-center gap-4 text-slate-700 bg-slate-50 p-3 rounded-xl border border-transparent hover:border-sky-100 hover:bg-sky-50 transition-colors">
                     <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500"><CheckCircle2 size={20} /></div>
                     <span className="font-medium">Instant AI feedback on every log entry</span>
                  </li>
                  <li className="flex items-center gap-4 text-slate-700 bg-slate-50 p-3 rounded-xl border border-transparent hover:border-sky-100 hover:bg-sky-50 transition-colors">
                     <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500"><CheckCircle2 size={20} /></div>
                     <span className="font-medium">Secure chat with CareCoach anytime</span>
                  </li>
               </ul>
            </div>
         </div>
      </div>

      {/* For Clinicians Section */}
      <div id="clinicians" className="w-full py-24 bg-slate-900 text-white scroll-mt-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20 relative z-10">
            <div className="flex-1">
               <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider mb-4 text-sm">
                  <span className="p-1 bg-emerald-900 rounded"><Stethoscope size={14}/></span> For Clinicians
               </div>
               <h2 className="text-4xl font-bold text-white mb-6">Intelligent Patient Triage</h2>
               <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  Reduce administrative burden and focus on patients who need you most. Our AI pre-screens logs for critical risks and organizes your dashboard by priority.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/5 hover:bg-white/15 transition-colors">
                     <CheckCircle2 className="text-emerald-400 mb-2" size={24} />
                     <h4 className="font-bold mb-1">Risk Scoring</h4>
                     <p className="text-xs text-slate-400">Automated prioritization based on vitals.</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/5 hover:bg-white/15 transition-colors">
                     <Globe className="text-emerald-400 mb-2" size={24} />
                     <h4 className="font-bold mb-1">Remote Monitoring</h4>
                     <p className="text-xs text-slate-400">Manage population health from anywhere.</p>
                  </div>
               </div>
            </div>
            
            <div className="flex-1">
               <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-[2rem] shadow-2xl border border-slate-700">
                  <div className="bg-slate-950 rounded-[1.5rem] p-8 relative overflow-hidden">
                     {/* Decorative glow */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                     
                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                           <Layout size={20} className="text-emerald-400" />
                           <span className="font-medium">Doctor Portal</span>
                        </div>
                        <div className="flex gap-1">
                           <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                           <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                     </div>
                     
                     <div className="space-y-4 relative z-10">
                        {/* Patient Row 1 */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-red-500/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold border border-red-500/30">SJ</div>
                              <div>
                                 <div className="text-sm font-bold">Sarah Jenkins</div>
                                 <div className="text-[10px] text-slate-400">HTN • Diabetes</div>
                              </div>
                           </div>
                           <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/20">Critical Alert</span>
                        </div>
                        
                        {/* Patient Row 2 */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">MC</div>
                              <div>
                                 <div className="text-sm font-bold text-slate-300">Mike Chen</div>
                                 <div className="text-[10px] text-slate-500">Diabetes</div>
                              </div>
                           </div>
                           <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/10">Stable</span>
                        </div>
                     </div>
                     
                     <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center">
                        <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                           View Full Dashboard <ArrowRight size={12}/>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <footer id="about" className="py-16 text-center text-slate-400 text-sm bg-slate-950 scroll-mt-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2 text-xl font-bold text-white">
                <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                  <Activity size={20} />
                </div>
                <span>Care<span className="text-emerald-500">Planner</span></span>
              </div>
              <p className="text-slate-500 text-left max-w-xs">
                 Bridging healthcare and AI to provide proactive, personalized chronic disease management.
              </p>
           </div>
           
           <div className="flex gap-12 text-slate-400 font-medium">
              <div className="flex flex-col gap-3 text-left">
                 <span className="text-white font-bold mb-1">Product</span>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Features</a>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Security</a>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Enterprise</a>
              </div>
              <div className="flex flex-col gap-3 text-left">
                 <span className="text-white font-bold mb-1">Company</span>
                 <a href="#" className="hover:text-emerald-400 transition-colors">About</a>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Blog</a>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Careers</a>
              </div>
              <div className="flex flex-col gap-3 text-left">
                 <span className="text-white font-bold mb-1">Legal</span>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                 <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              </div>
           </div>
        </div>
        <div className="border-t border-slate-900 mt-12 pt-8 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <p>&copy; 2026 AI Ignite Hackathon Project. All rights reserved.</p>
           <p className="flex items-center gap-2">
              Made with <Heart size={14} className="text-red-500 fill-red-500" /> for the future of healthcare.
           </p>
        </div>
      </footer>

      {/* Floating AI Bot for Access on Landing Page */}
      <AIChat isOpen={isChatOpen} onToggle={setIsChatOpen} largeTrigger={true} />
    </div>
  );
};

export default LandingPage;