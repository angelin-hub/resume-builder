import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert resume coach and career advisor called "ResumePro AI".
You help users build professional resumes, improve their content, and land jobs.
Keep answers concise (2-4 sentences max), practical, and encouraging.
Use bullet points when listing multiple items. Respond in plain text, no markdown headers.`;

export const handleAIChat: RequestHandler = async (req, res) => {
  const { message, history = [] } = req.body as {
    message: string;
    history: { role: "user" | "model"; text: string }[];
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI service not configured. Add GEMINI_API_KEY to .env" });
  }
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert history to Gemini format
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return res.json({ reply: text });
  } catch (err: any) {
    console.error("Gemini error:", err?.message);
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
};

export const handleAISuggest: RequestHandler = async (req, res) => {
  const { resumeData } = req.body as { resumeData: Record<string, any> };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI service not configured." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this resume data and return exactly 5 specific, actionable improvement suggestions.
Resume: ${JSON.stringify(resumeData, null, 2)}

Return a JSON array of 5 objects, each with:
- id: string (s1-s5)
- category: one of "summary" | "skills" | "keywords" | "format" | "impact"
- priority: "high" | "medium" | "low"
- title: short title (max 8 words)
- description: specific advice for THIS resume (2-3 sentences)
- example: a concrete before/after example

Respond ONLY with the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const suggestions = JSON.parse(clean);

    return res.json({ suggestions });
  } catch (err: any) {
    console.error("Gemini suggest error:", err?.message);
    return res.status(500).json({ error: "Could not generate suggestions." });
  }
};
