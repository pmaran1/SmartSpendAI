
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (transactions: Transaction[]): Promise<AIInsight[]> => {
  if (transactions.length === 0) return [];

  const summary = transactions.slice(-50).map(t => ({
    date: t.date,
    amount: t.amount,
    category: t.category,
    type: t.type
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these recent transactions and provide 3 actionable financial insights. Focus on trends, overspending, and potential savings. Return only a valid JSON array of objects with keys: title, description, impact (high|medium|low), and type (saving|trend|alert). 
      Transactions: ${JSON.stringify(summary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["title", "description", "impact", "type"]
          }
        }
      }
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return [{
      title: "Data Analysis",
      description: "Keep recording more transactions to see automated insights here.",
      impact: "medium",
      type: "trend"
    }];
  }
};
