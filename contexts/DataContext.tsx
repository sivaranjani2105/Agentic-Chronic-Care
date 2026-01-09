import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, User, VitalLog, DoctorMessage, Appointment, AppFeedback } from '../types';

interface DataContextType {
  currentUser: User | null;
  patients: Patient[];
  appointments: Appointment[];
  login: (role: 'patient' | 'doctor' | 'admin') => void;
  logout: () => void;
  addVitalLog: (patientId: string, log: VitalLog) => void;
  updatePatient: (updatedPatient: Patient) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'logs' | 'messages' | 'riskScore'>) => void;
  sendDoctorMessage: (patientId: string, text: string, type: 'prescription' | 'note' | 'alert') => void;
  markMessagesRead: (patientId: string) => void;
  bookAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  cancelAppointment: (id: string) => void;
  addFeedback: (feedback: Omit<AppFeedback, 'id' | 'timestamp'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'careplanner_patient_data';
const USER_STORAGE_KEY = 'careplanner_current_user';
const APPT_STORAGE_KEY = 'careplanner_appointments';
const FEEDBACK_STORAGE_KEY = 'careplanner_feedback';

// Mock Initial Data (used only if local storage is empty)
const INITIAL_PATIENTS: Patient[] = [
  { 
    id: 'p1', 
    name: 'Sarah Jenkins', 
    age: 45, 
    condition: ['Hypertension', 'Type 2 Diabetes'], 
    riskScore: 45,
    messages: [
      { id: 'm1', doctorName: 'Dr. Carter', text: 'Welcome to your new care dashboard. Please log your vitals daily.', date: new Date(Date.now() - 864000000), type: 'note', isRead: true }
    ],
    logs: [
      { id: '1', timestamp: new Date(Date.now() - 86400000), systolic: 135, diastolic: 85, glucose: 110, status: 'Elevated' },
      { id: '2', timestamp: new Date(Date.now() - 172800000), systolic: 122, diastolic: 78, glucose: 102, status: 'Normal' },
    ],
    avatar: 'https://picsum.photos/200'
  },
  { 
    id: 'p2', 
    name: 'Michael Chen', 
    age: 52, 
    condition: ['Type 2 Diabetes'], 
    riskScore: 20,
    messages: [],
    logs: [
       { id: '3', timestamp: new Date(Date.now() - 4000000), systolic: 118, diastolic: 75, glucose: 95, status: 'Normal' }
    ]
  },
  { 
    id: 'p3', 
    name: 'David Miller', 
    age: 68, 
    condition: ['Hypertension', 'Arrhythmia'], 
    riskScore: 85,
    messages: [],
    logs: [
      { id: '4', timestamp: new Date(Date.now() - 1200000), systolic: 160, diastolic: 100, glucose: 105, status: 'Critical' }
    ]
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientName: 'Sarah Jenkins',
    doctorName: 'Dr. Carter',
    date: new Date(Date.now() + 172800000), // 2 days from now
    type: 'video',
    status: 'confirmed',
    reason: 'Monthly checkup'
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize currentUser from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to restore user session", e);
      return null;
    }
  });
  
  // Initialize patients with LocalStorage persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep revive Dates (JSON.stringify converts dates to strings)
        return parsed.map((p: any) => ({
          ...p,
          logs: p.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })),
          messages: p.messages ? p.messages.map((m: any) => ({ ...m, date: new Date(m.date) })) : []
        }));
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    return INITIAL_PATIENTS;
  });

  // Initialize Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
        const saved = localStorage.getItem(APPT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((a: any) => ({ ...a, date: new Date(a.date) }));
        }
    } catch (e) {
        console.error("Failed to load appointments", e);
    }
    return INITIAL_APPOINTMENTS;
  });

  // Initialize Feedback
  const [feedbackList, setFeedbackList] = useState<AppFeedback[]>(() => {
      try {
          const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
          if (saved) {
              const parsed = JSON.parse(saved);
              return parsed.map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) }));
          }
      } catch (e) {
          console.error("Failed to load feedback", e);
      }
      return [];
  });

  // Save to LocalStorage whenever patients change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  // Save Appointments
  useEffect(() => {
    localStorage.setItem(APPT_STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  // Save Feedback
  useEffect(() => {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackList));
  }, [feedbackList]);

  // Save User Session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (role: 'patient' | 'doctor' | 'admin') => {
    // Simulating Auth
    if (role === 'patient') {
      const patientData = patients.find(p => p.id === 'p1');
      setCurrentUser({ 
        id: 'p1', 
        name: patientData?.name || 'Sarah Jenkins', 
        role: 'patient', 
        avatar: patientData?.avatar || 'https://picsum.photos/200' 
      });
    } else if (role === 'doctor') {
      setCurrentUser({ id: 'd1', name: 'Dr. Carter', role: 'doctor', avatar: 'https://ui-avatars.com/api/?name=Dr+Carter&background=0ea5e9&color=fff' });
    } else {
      setCurrentUser({ id: 'a1', name: 'Admin User', role: 'admin' });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const addVitalLog = (patientId: string, log: VitalLog) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        // Simple risk score adjustment logic
        let newRisk = p.riskScore;
        if (log.status === 'Critical') newRisk = Math.min(100, newRisk + 25);
        if (log.status === 'High') newRisk = Math.min(100, newRisk + 15);
        if (log.status === 'Elevated') newRisk = Math.min(100, newRisk + 5);
        if (log.status === 'Normal') newRisk = Math.max(0, newRisk - 5);
        
        return {
          ...p,
          riskScore: newRisk,
          logs: [log, ...p.logs]
        };
      }
      return p;
    }));
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    
    // Sync with currentUser if the updated patient is the logged-in user
    if (currentUser && currentUser.id === updatedPatient.id) {
        setCurrentUser(prev => prev ? ({ 
            ...prev, 
            name: updatedPatient.name, 
            avatar: updatedPatient.avatar || prev.avatar 
        }) : null);
    }
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'logs' | 'messages' | 'riskScore'>) => {
    const newPatient: Patient = {
        ...patientData,
        id: `p${Date.now()}`,
        logs: [],
        messages: [],
        riskScore: 0, 
        avatar: `https://ui-avatars.com/api/?name=${patientData.name.replace(' ', '+')}&background=random`
    };
    setPatients(prev => [newPatient, ...prev]);
  };

  const sendDoctorMessage = (patientId: string, text: string, type: 'prescription' | 'note' | 'alert') => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newMessage: DoctorMessage = {
          id: Date.now().toString(),
          doctorName: currentUser?.name || 'Doctor',
          text,
          date: new Date(),
          type,
          isRead: false
        };
        return {
          ...p,
          messages: [newMessage, ...(p.messages || [])]
        };
      }
      return p;
    }));
  };

  const markMessagesRead = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          messages: p.messages.map(m => ({ ...m, isRead: true }))
        };
      }
      return p;
    }));
  };

  const bookAppointment = (appt: Omit<Appointment, 'id' | 'status'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: Date.now().toString(),
      status: 'confirmed'
    };
    setAppointments(prev => [...prev, newAppt]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const addFeedback = (feedback: Omit<AppFeedback, 'id' | 'timestamp'>) => {
      const newFeedback: AppFeedback = {
          ...feedback,
          id: Date.now().toString(),
          timestamp: new Date()
      };
      setFeedbackList(prev => [...prev, newFeedback]);
  };

  return (
    <DataContext.Provider value={{ currentUser, patients, appointments, login, logout, addVitalLog, updatePatient, addPatient, sendDoctorMessage, markMessagesRead, bookAppointment, cancelAppointment, addFeedback }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};