import React from 'react';
import { ShieldCheck, Users, Activity, Settings, Database, LogOut, ArrowLeft } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { patients, currentUser, logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Calculate dynamic stats
  const totalLogs = patients.reduce((acc, p) => acc + p.logs.length, 0);
  const criticalPatients = patients.filter(p => p.riskScore > 80).length;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
           <button onClick={() => navigate('/')} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={18} /> <span className="text-sm font-medium">Home</span>
           </button>
           <h2 className="text-lg font-bold flex items-center gap-2">
             <ShieldCheck className="text-emerald-400" /> AdminPanel
           </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl text-emerald-400 font-medium">
             <Activity size={20} /> System Status
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
             <Users size={20} /> User Management
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
             <Database size={20} /> AI Safety Logs
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-xl transition-colors">
             <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
            <div className="text-sm text-slate-500">Logged in as {currentUser?.name}</div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="text-slate-500 text-sm font-medium uppercase mb-2">Total Patients</div>
               <div className="text-3xl font-bold text-slate-900">{patients.length}</div>
               <div className="text-emerald-500 text-sm mt-1 flex items-center gap-1">
                  <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-xs">+1 new</span> this session
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="text-slate-500 text-sm font-medium uppercase mb-2">Total AI Logs Processed</div>
               <div className="text-3xl font-bold text-slate-900">{totalLogs}</div>
               <div className="text-emerald-500 text-sm mt-1">
                  All systems operational
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="text-slate-500 text-sm font-medium uppercase mb-2">High Risk Alerts</div>
               <div className="text-3xl font-bold text-slate-900">{criticalPatients}</div>
               <div className="text-slate-400 text-sm mt-1">
                  Requires clinical review
               </div>
            </div>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
               <h3 className="font-bold text-slate-800">Recent AI Safety Logs</h3>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                     <th className="px-6 py-3">Timestamp</th>
                     <th className="px-6 py-3">Event Type</th>
                     <th className="px-6 py-3">User</th>
                     <th className="px-6 py-3">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                     <td className="px-6 py-3">Oct 24, 10:42 AM</td>
                     <td className="px-6 py-3">Vitals Analysis</td>
                     <td className="px-6 py-3">Patient #1024</td>
                     <td className="px-6 py-3"><span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-xs">Safe</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                     <td className="px-6 py-3">Oct 24, 10:38 AM</td>
                     <td className="px-6 py-3">Chat Interaction</td>
                     <td className="px-6 py-3">Patient #0992</td>
                     <td className="px-6 py-3"><span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-xs">Safe</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                     <td className="px-6 py-3">Oct 24, 10:15 AM</td>
                     <td className="px-6 py-3">Risk Alert Gen</td>
                     <td className="px-6 py-3">System Agent</td>
                     <td className="px-6 py-3"><span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-xs">Verified</span></td>
                  </tr>
               </tbody>
            </table>
         </div>
      </main>
    </div>
  );
};

export default AdminDashboard;