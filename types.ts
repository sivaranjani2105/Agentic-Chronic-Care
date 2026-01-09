export type UserRole = 'patient' | 'doctor' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
}

export interface VitalLog {
  id: string;
  timestamp: Date;
  systolic: number;
  diastolic: number;
  glucose: number; // mg/dL
  status: 'Normal' | 'Elevated' | 'High' | 'Critical';
  note?: string;
}

export interface DoctorMessage {
  id: string;
  doctorName: string;
  text: string;
  date: Date;
  type: 'prescription' | 'note' | 'alert';
  isRead: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: Date;
  type: 'video' | 'in-person';
  status: 'pending' | 'confirmed' | 'cancelled';
  reason?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string[];
  riskScore: number; // 0-100
  logs: VitalLog[]; // Added logs history directly to patient
  notes?: string;
  messages: DoctorMessage[];
  avatar?: string;
}

export interface AIAnalysisResult {
  riskLevel: 'Normal' | 'Elevated' | 'High' | 'Critical';
  patientAdvice: string;
  doctorAlert: string;
  actionPlan: string[];
  recommendedClinicalAction?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  feedback?: 'helpful' | 'unhelpful';
}

export interface AppFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
}