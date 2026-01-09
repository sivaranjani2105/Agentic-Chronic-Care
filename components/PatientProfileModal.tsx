import React, { useState, useEffect, useRef } from 'react';
import { X, User, Save, Edit2, Activity, Calendar, Plus, Camera, AlertTriangle } from 'lucide-react';
import { Patient } from '../types';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onUpdate: (updatedPatient: Patient) => void;
}

const MAX_CONDITIONS = 10;

const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ isOpen, onClose, patient, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Patient>(patient);
  const [newCondition, setNewCondition] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form data when patient prop changes or modal opens
  useEffect(() => {
    setFormData(patient);
    setNewCondition('');
    setError('');
    setIsEditing(false);
    setShowConfirm(false);
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onUpdate(formData);
    setIsEditing(false);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setFormData(patient);
    setNewCondition('');
    setError('');
    setIsEditing(false);
    setShowConfirm(false);
  };

  const isLimitReached = formData.condition.length >= MAX_CONDITIONS;

  const addCondition = () => {
    if (isLimitReached) return;

    const rawInput = newCondition.trim();
    if (!rawInput) return;

    // Handle comma-separated values
    const candidates = rawInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const newConditionsToAdd: string[] = [];
    let validationError = '';
    
    const availableSlots = MAX_CONDITIONS - formData.condition.length;

    if (candidates.length > availableSlots) {
        setError(`You can only add ${availableSlots} more condition(s).`);
        return;
    }

    for (const candidate of candidates) {
        if (candidate.length > 30) {
            validationError = 'Condition name too long (max 30 chars)';
            break;
        }
        // Allow alphanumeric, spaces, hyphens, and apostrophes
        if (!/^[a-zA-Z0-9\s\-']+$/.test(candidate)) {
            validationError = 'Only letters, numbers, spaces & hyphens allowed';
            break;
        }

         // Case-insensitive duplicate check
         const exists = formData.condition.some(c => c.toLowerCase() === candidate.toLowerCase());
         const inCurrentBatch = newConditionsToAdd.some(c => c.toLowerCase() === candidate.toLowerCase());
         
         if (!exists && !inCurrentBatch) {
             newConditionsToAdd.push(candidate);
         }
    }

    if (validationError) {
        setError(validationError);
        return;
    }

    if (newConditionsToAdd.length > availableSlots) {
        setError(`You can only add ${availableSlots} more condition(s).`);
        return;
    }

    if (newConditionsToAdd.length > 0) {
      setFormData(prev => ({
        ...prev,
        condition: [...prev.condition, ...newConditionsToAdd]
      }));
    }
    
    setNewCondition('');
    setError('');
  };

  const removeCondition = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      condition: prev.condition.filter((_, index) => index !== indexToRemove)
    }));
    if (error && formData.condition.length - 1 < MAX_CONDITIONS) {
        setError('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCondition();
    } else if (e.key === 'Backspace' && newCondition === '' && formData.condition.length > 0) {
       removeCondition(formData.condition.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCondition(e.target.value);
    if (error) setError('');
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="text-emerald-100" /> Patient Profile
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div 
                className={`relative w-24 h-24 rounded-full bg-slate-100 border-4 border-emerald-50 mb-3 overflow-hidden shadow-inner group ${isEditing ? 'cursor-pointer hover:border-emerald-200' : ''}`}
                onClick={handleImageClick}
            >
               <img 
                 src={formData.avatar || "https://picsum.photos/200"} 
                 alt="Profile" 
                 className={`w-full h-full object-cover transition-opacity ${isEditing ? 'group-hover:opacity-70' : ''}`}
               />
               
               {isEditing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                 </div>
               )}
               
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageChange} 
                 className="hidden" 
                 accept="image/*"
               />
            </div>
            
            {!isEditing ? (
              <h3 className="text-xl font-bold text-slate-800">{formData.name}</h3>
            ) : (
                <p className="text-xs text-emerald-600 font-medium">Click image to change</p>
            )}
          </div>

          <div className="space-y-4">
            {/* Name Field */}
            {isEditing && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Age Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                 <Calendar size={12} /> Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              ) : (
                <div className="text-slate-800 font-medium px-1 flex items-center justify-between">
                  <span>{formData.age} years old</span>
                </div>
              )}
            </div>

            {/* Conditions Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                 <Activity size={12} /> Chronic Conditions
              </label>
              
              <div className={`w-full min-h-[50px] border rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 transition-all ${
                  isEditing 
                    ? `bg-white focus-within:ring-2 ${error ? 'border-red-300 focus-within:ring-red-200 focus-within:border-red-500' : 'border-slate-200 focus-within:ring-emerald-500 focus-within:border-emerald-500'}`
                    : 'border-transparent bg-slate-50'
              }`}>
                {formData.condition.map((c, i) => (
                  <div key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium border animate-in zoom-in-90 duration-200 ${
                      isEditing 
                        ? 'bg-sky-50 border-sky-100 text-sky-700' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    <span>{c}</span>
                    {isEditing && (
                      <button 
                        onClick={() => removeCondition(i)}
                        className="p-0.5 hover:bg-sky-100 rounded-full text-sky-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={newCondition}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={isLimitReached}
                      placeholder={isLimitReached ? "Limit reached" : "e.g. Hypertension, Diabetes"}
                      className={`flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder:text-slate-400 ${isLimitReached ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={addCondition}
                      disabled={isLimitReached || !newCondition.trim()}
                      className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isLimitReached ? "Limit reached" : "Add Condition"}
                    >
                      <Plus size={16} />
                    </button>
                  </>
                ) : (
                   formData.condition.length === 0 && <span className="text-slate-400 italic text-sm">No conditions listed</span>
                )}
              </div>
              
              {isEditing && error && (
                  <p className="text-xs text-red-500 mt-1 ml-1 animate-in slide-in-from-top-1 flex items-center gap-1">
                      <AlertTriangle size={12} /> {error}
                  </p>
              )}

              {isEditing && isLimitReached && !error && (
                  <p className="text-xs text-amber-500 mt-1 ml-1 animate-in slide-in-from-top-1 flex items-center gap-1">
                      <AlertTriangle size={12} /> Maximum of {MAX_CONDITIONS} conditions reached.
                  </p>
              )}

              {isEditing && !error && !isLimitReached && (
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1 flex justify-between">
                     <span>Press <kbd className="font-sans px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500">Enter</kbd> to add</span>
                     <span>{formData.condition.length}/{MAX_CONDITIONS} conditions</span>
                  </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <Save size={18} /> Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Overlay */}
        {showConfirm && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
                <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 text-center">Save Changes?</h3>
                <p className="text-slate-500 text-center mb-8 leading-relaxed">
                    Are you sure you want to update the profile information for <strong>{formData.name}</strong>?
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={confirmSave}
                        className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                        Yes, Save
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileModal;