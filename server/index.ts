import "dotenv/config";
import express from "express";
import cors from "cors";

// routes
import { handleDemo } from "./routes/demo";
import { handleSignUp, handleSignIn, handleSignOut, handleMe } from "./routes/auth";
import { listResumes, createResume, getResume, updateResume, deleteResume, trackDownload } from "./routes/resumes";
import { getUserStats, updateProfile, changePassword } from "./routes/users";
import { handleAIChat, handleAISuggest, handleAIInterview } from "./routes/ai";
import { requireAuth } from "./middleware/auth";

export function createServer() {
  const app = express();

  // ── Middleware ──────────────────────────────────────────────────────────────
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Health & legacy ─────────────────────────────────────────────────────────
  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "pong", db: !!process.env.DATABASE_URL });
  });

  app.get("/api/demo", handleDemo);

  // ── Auth routes (public) ────────────────────────────────────────────────────
  app.post("/api/auth/signup", handleSignUp);
  app.post("/api/auth/signin", handleSignIn);
  app.post("/api/auth/signout", handleSignOut);
  app.get("/api/auth/me", handleMe);

  // ── Resume routes (protected) ───────────────────────────────────────────────
  app.get("/api/resumes", requireAuth, listResumes);
  app.post("/api/resumes", requireAuth, createResume);
  app.get("/api/resumes/:id", requireAuth, getResume);
  app.patch("/api/resumes/:id", requireAuth, updateResume);
  app.delete("/api/resumes/:id", requireAuth, deleteResume);
  app.post("/api/resumes/:id/download", requireAuth, trackDownload);

  // ── AI routes (public — key checked server-side) ────────────────────────────
  app.post("/api/ai/chat",      handleAIChat);
  app.post("/api/ai/suggest",   handleAISuggest);
  app.post("/api/ai/interview", handleAIInterview);

  // ── User routes (protected) ─────────────────────────────────────────────────
  app.get("/api/users/me/stats", requireAuth, getUserStats);
  app.patch("/api/users/me", requireAuth, updateProfile);
  app.patch("/api/users/me/password", requireAuth, changePassword);

  return app;
}
