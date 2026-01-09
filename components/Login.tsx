import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck, ArrowLeft, CheckCircle2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else if (currentUser.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    }
  }, [currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API network delay
    setTimeout(() => {
        setIsLoading(false);
        const lowerEmail = email.toLowerCase();
        
        // Simple credential mapping for demo
        if (lowerEmail.includes('admin')) {
            login('admin');
        } else if (lowerEmail.includes('doctor') || lowerEmail.includes('dr')) {
            login('doctor');
        } else if (lowerEmail.includes('sarah') || lowerEmail.includes('patient') || lowerEmail.includes('@careplanner')) {
            // Default to patient for any other valid looking email
            login('patient');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    }, 1500);
  };

  const handleQuickLogin = (role: 'patient' | 'doctor' | 'admin') => {
      if (role === 'patient') {
          setEmail('sarah@careplanner.ai');
          setPassword('health2026');
      } else if (role === 'doctor') {
          setEmail('dr.carter@careplanner.ai');
          setPassword('docsecure123');
      } else {
          setEmail('admin@careplanner.ai');
          setPassword('admin_sys_99');
      }
      setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-3xl animate-blob"></div>
         <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-sky-100/50 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Improved Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200 text-slate-600 font-semibold text-sm hover:text-emerald-700 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 z-20 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Back to Home</span>
      </button>

      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 border border-slate-100 min-h-[650px]">
        
        {/* Left Side: Visual */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          <div className="relative z-10 animate-in slide-in-from-left duration-700">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back</h2>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
               Securely access your unified chronic disease management portal.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 space-y-6">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg hover:bg-white/20 transition-colors animate-in slide-in-from-bottom duration-700 delay-150">
                <div className="flex gap-1 mb-2">
                   {[1,2,3,4,5].map(i => <div key={i} className="text-yellow-400">★</div>)}
                </div>
                <p className="italic text-sm leading-relaxed text-emerald-50 mb-4">"This platform has transformed how I manage my patients. The AI summaries save me hours every week."</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center font-bold text-xs">DC</div>
                   <div>
                      <span className="text-sm font-bold block">Dr. Carter</span>
                      <span className="text-xs text-emerald-200">Cardiologist</span>
                   </div>
                </div>
             </div>

             <div className="flex gap-4 text-xs font-medium text-emerald-200">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400"/> HIPAA Compliant</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400"/> AES-256 Encrypted</div>
             </div>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-400 opacity-10 animate-pulse"></div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="mb-8">
             <h3 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h3>
             <p className="text-slate-500">Enter your credentials to access your account.</p>
          </div>

          {/* Quick Access Pills for Hackathon Demo */}
          <div className="mb-8">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Demo Access</p>
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                 <button 
                    onClick={() => handleQuickLogin('patient')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors whitespace-nowrap"
                 >
                    <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center"><User size={14}/></div>
                    <span className="text-sm font-semibold">Sarah (Patient)</span>
                 </button>
                 <button 
                    onClick={() => handleQuickLogin('doctor')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 transition-colors whitespace-nowrap"
                 >
                    <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center"><Stethoscope size={14}/></div>
                    <span className="text-sm font-semibold">Dr. Carter</span>
                 </button>
                 <button 
                    onClick={() => handleQuickLogin('admin')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap"
                 >
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center"><ShieldCheck size={14}/></div>
                    <span className="text-sm font-semibold">Admin</span>
                 </button>
             </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
               <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@careplanner.ai"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
               </div>
            </div>

            <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Forgot password?</a>
               </div>
               <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {error}
                </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !email || !password}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-200/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {isLoading ? (
                   <>
                     <Loader2 size={20} className="animate-spin" /> Authenticating...
                   </>
               ) : (
                   "Sign In"
               )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500">
             Don't have an account? <a href="#" className="font-bold text-slate-800 hover:text-emerald-600 underline underline-offset-2">Request Access</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;