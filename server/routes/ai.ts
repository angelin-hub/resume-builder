/**
 * AI routes — powered by Google Gemini
 *
 * Day 3: Wire in one real LLM call
 * 1. Import the SDK
 * 2. Read the key from an env var
 * 3. Add a call site that actually invokes the model
 */

// 1. Import the Google Generative AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RequestHandler } from "express";

// Resume coach system prompt
const SYSTEM_PROMPT = `You are an expert resume coach and career advisor called "ResumePro AI".
You help users build professional resumes, improve their content, and land jobs.
Keep answers concise (2-4 sentences max), practical, and encouraging.
Use bullet points when listing multiple items. Respond in plain text, no markdown headers.`;

// ── /api/ai/chat ─────────────────────────────────────────────────────────────
export const handleAIChat: RequestHandler = async (req, res) => {
  const { message, history = [] } = req.body as {
    message: string;
    history: { role: "user" | "model"; text: string }[];
  };

  // 2. Read the API key from environment variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not set. Add it to your .env file.",
    });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    // 3. Invoke the model — real LLM call
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chatHistory = history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return res.json({ reply });
  } catch (err: any) {
    console.error("[Gemini] chat error:", err?.message ?? err);
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
};

// ── /api/ai/interview ────────────────────────────────────────────────────────
export const handleAIInterview: RequestHandler = async (req, res) => {
  const { action, role, experience, question, answer } = req.body;

  // 2. Read the API key from environment variable
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "GEMINI_API_KEY is not set." });
  }

  try {
    // 3. Invoke the model — real LLM call
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === "generate") {
      const prompt = `Generate exactly 5 interview questions for a ${experience}-level ${role} position.
Mix behavioral (2), technical (2), and situational (1) questions.
Return ONLY a JSON array of 5 question strings. No other text.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim()
        .replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      const questions = JSON.parse(text);
      return res.json({ questions });
    }

    if (action === "evaluate") {
      const prompt = `You are an expert interviewer evaluating a candidate answer.
Role: ${role}
Question: ${question}
Candidate answer: ${answer}

Evaluate the answer and return ONLY a JSON object with:
- score: number 0-100
- feedback: 2-3 sentence constructive feedback mentioning strengths and areas to improve

Return ONLY the JSON object, no other text.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim()
        .replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      const evaluation = JSON.parse(text);
      return res.json(evaluation);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err: any) {
    console.error("[Gemini] interview error:", err?.message ?? err);
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
};
export const handleAISuggest: RequestHandler = async (req, res) => {
  const { resumeData } = req.body as { resumeData: Record<string, any> };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "GEMINI_API_KEY is not set." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this resume and return exactly 5 specific improvement suggestions.
Resume data: ${JSON.stringify(resumeData, null, 2)}

Return a JSON array of 5 objects with fields:
- id: "s1" to "s5"
- category: "summary" | "skills" | "keywords" | "format" | "impact"
- priority: "high" | "medium" | "low"
- title: short title (max 8 words)
- description: specific advice for THIS resume (2-3 sentences)
- example: concrete before/after example

Respond ONLY with the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const suggestions = JSON.parse(clean);

    return res.json({ suggestions });
  } catch (err: any) {
    console.error("[Gemini] suggest error:", err?.message ?? err);
    return res.status(500).json({ error: "Could not generate suggestions." });
  }
};
