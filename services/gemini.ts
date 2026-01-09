import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 3 Flash Preview for better stability and performance
const MODEL_NAME = "gemini-3-flash-preview"; 

export const analyzeVitalsWithGemini = async (
  systolic: number,
  diastolic: number,
  glucose: number
): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      Analyze the following patient vitals:
      Blood Pressure: ${systolic}/${diastolic} mmHg
      Blood Glucose: ${glucose} mg/dL

      Standard Reference Ranges:
      - Blood Pressure: Normal <120/80. Elevated 120-129/<80. High Stage 1 130-139/80-89. High Stage 2 140+/90+. Hypertensive Crisis >180/>120.
      - Blood Glucose (Fasting): Normal <100. Prediabetes 100-125. Diabetes >126.

      Task:
      Provide a JSON response with the following structure:
      - riskLevel: "Normal", "Elevated", "High", or "Critical" based on the highest risk metric.
      - patientAdvice: A short, calming, and actionable tip for the patient (max 2 sentences).
        CONTEXT AWARENESS RULES:
        1. If Blood Pressure is the primary concern (>120/80), the advice MUST mention "blood pressure" and suggest relaxation, checking cuff position, or hydration.
        2. If Glucose is the primary concern (>100), the advice MUST mention "glucose" or "sugar" and suggest water intake or activity.
        3. If both are high, mention both but focus on the most critical risk.
        4. If Normal, praise the patient for maintaining healthy ${systolic < 120 && glucose < 100 ? "vitals" : "levels"}.
      - doctorAlert: A concise clinical summary for the doctor highlighting the concern.
      - actionPlan: An array of 3 short immediate steps.
      - recommendedClinicalAction: One short phrase for the doctor's next step (e.g., "Continue Monitoring", "Schedule Follow-up", "Review Medication").
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ["Normal", "Elevated", "High", "Critical"] },
            patientAdvice: { type: Type.STRING },
            doctorAlert: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedClinicalAction: { type: Type.STRING },
          },
          required: ["riskLevel", "patientAdvice", "doctorAlert", "actionPlan", "recommendedClinicalAction"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of API error/limit
    return {
      riskLevel: "Elevated",
      patientAdvice: "We couldn't analyze your data right now. Please rest and monitor your symptoms.",
      doctorAlert: "Automated analysis failed. Manual review required.",
      actionPlan: ["Rest for 15 minutes", "Drink water", "Retake measurement"],
      recommendedClinicalAction: "Manual Review Required",
    };
  }
};

export const getChatResponse = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history,
      config: {
        systemInstruction: "You are a compassionate and knowledgeable medical AI assistant named 'CareCoach'. Your goal is to help patients manage chronic conditions like Diabetes and Hypertension. Be encouraging, concise, and always advise consulting a doctor for serious symptoms. Do not provide medical diagnoses, but offer lifestyle and management advice.",
      },
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the care network right now. Please try again later.";
  }
};

export const getChatResponseStream = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  patientContext?: string
) => {
    const baseInstruction = "You are a compassionate and knowledgeable medical AI assistant named 'CareCoach'. Your goal is to help patients manage chronic conditions like Diabetes and Hypertension. Be encouraging, concise, and always advise consulting a doctor for serious symptoms. Do not provide medical diagnoses, but offer lifestyle and management advice.";
    
    const systemInstruction = patientContext 
        ? `${baseInstruction}\n\nIMPORTANT: You are assisting a specific patient. Use the following context to personalize your advice, but do not simply recite their data unless asked.\n\nPATIENT CONTEXT:\n${patientContext}`
        : baseInstruction;

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return await chat.sendMessageStream({ message: newMessage });
};