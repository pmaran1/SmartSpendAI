
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { Transaction, AIInsight, ChatMessage } from "../types";

// Always use named parameter for apiKey and direct process.env access.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses a natural language string into a transaction object.
 */
export const parseTransaction = async (input: string, categories: string[]): Promise<Partial<Transaction> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following financial transaction input and return a JSON object.
      Categories available: ${categories.join(", ")}.
      If the date is not specified, assume today's date (${new Date().toISOString().split('T')[0]}).
      Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["expense", "income"] },
            date: { type: Type.STRING, description: "ISO date YYYY-MM-DD" }
          },
          required: ["amount", "category", "description", "type", "date"]
        }
      }
    });

    // response.text is a property, not a method.
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
};

/**
 * Parses a receipt image using Multimodal Vision.
 */
export const parseReceipt = async (base64Image: string, categories: string[]): Promise<Partial<Transaction> | null> => {
  try {
    // Corrected: Multimodal inputs must be wrapped in a single content object with a parts array.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: `Extract financial data from this receipt. Available categories: ${categories.join(", ")}. Return a JSON object with amount, category, description (merchant name), and date (YYYY-MM-DD). Type is always 'expense'.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["amount", "category", "description", "date"]
        }
      }
    });
    // response.text is a property.
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Vision AI Error:", error);
    return null;
  }
};

const addTransactionTool: FunctionDeclaration = {
  name: 'add_transaction',
  parameters: {
    type: Type.OBJECT,
    description: 'Add a new financial transaction (income or expense) to the records.',
    properties: {
      amount: { type: Type.NUMBER, description: 'The monetary amount of the transaction.' },
      category: { type: Type.STRING, description: 'The category of the transaction (e.g., Food, Rent, Salary).' },
      description: { type: Type.STRING, description: 'A short note about the transaction.' },
      type: { type: Type.STRING, enum: ['expense', 'income'], description: 'Whether this is money going out or coming in.' },
      date: { type: Type.STRING, description: 'The date in YYYY-MM-DD format. Default to today if not provided.' }
    },
    required: ['amount', 'category', 'description', 'type']
  }
};

const setBudgetTool: FunctionDeclaration = {
  name: 'set_budget',
  parameters: {
    type: Type.OBJECT,
    description: 'Set or update the monthly spending limit for a specific category.',
    properties: {
      category: { type: Type.STRING, description: 'The category to set a budget for.' },
      limit: { type: Type.NUMBER, description: 'The maximum monthly spending amount allowed.' }
    },
    required: ['category', 'limit']
  }
};

/**
 * Handles conversational queries about user's financial history and performs actions via function calling.
 */
export const getChatResponse = async (query: string, transactions: Transaction[], categories: string[]): Promise<GenerateContentResponse> => {
  const context = transactions.slice(0, 50).map(t => ({
    date: t.date,
    amount: t.amount,
    category: t.category,
    desc: t.description,
    type: t.type
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are SmartSpend AI, a financial consultant. 
      Use the following transaction history to answer the user's question accurately. 
      You have tools to add transactions and set budgets. If the user asks you to record something or set a limit, USE THE TOOLS.
      Do not just say you will do it; call the function.
      
      Available Categories: ${categories.join(', ')}
      Today's Date: ${new Date().toISOString().split('T')[0]}
      
      History: ${JSON.stringify(context)}
      User Query: "${query}"`,
      config: {
        temperature: 0.3,
        tools: [{ functionDeclarations: [addTransactionTool, setBudgetTool] }]
      }
    });
    return response;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

/**
 * Provides 3 financial insights based on recent transaction data.
 */
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

    // response.text is a property.
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Insights Error:", error);
    return [];
  }
};
