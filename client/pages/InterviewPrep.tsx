/**
 * Interview Prep — AI-powered mock interview powered by Google Gemini
 *
 * Day 3 "Add the Brain":
 * 1. SDK: @google/generative-ai (server/routes/ai.ts)
 * 2. Key: GEMINI_API_KEY env var
 * 3. Call site: POST /api/ai/interview → real Gemini LLM invocation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Send, RefreshCw, ChevronDown, ChevronUp,
  Sparkles, Target, Brain, ArrowRight, CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const JOB_ROLES = [
  "Software Engineer", "Product Manager", "Data Analyst",
  "UX Designer", "Marketing Manager", "Business Analyst",
  "Nursing / Healthcare", "Sales Executive", "HR Manager",
  "Civil Engineer", "Teacher / Educator", "Financial Analyst",
];

interface QA { question: string; userAnswer: string; feedback: string; score: number; }

export default function InterviewPrep() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<QA[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Generate interview questions via Gemini
  const generateQuestions = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setResults([]);
    setCurrent(0);
    setDone(false);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", role, experience }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
    } catch (e: any) {
      setError(e.message ?? "Failed to generate questions. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  // Evaluate answer via Gemini
  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          role,
          question: questions[current],
          answer,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const qa: QA = {
        question: questions[current],
        userAnswer: answer,
        feedback: data.feedback,
        score: data.score,
      };
      const updated = [...results, qa];
      setResults(updated);
      setAnswer("");

      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent(i => i + 1);
      }
    } catch (e: any) {
      setError(e.message ?? "Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;

  const scoreColor = avgScore >= 80 ? "#22c55e" : avgScore >= 60 ? "#f97316" : "#ef4444";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-4">
              <Brain className="w-3.5 h-3.5" /> Powered by Google Gemini AI
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-3">Interview Prep</h1>
            <p className="text-foreground/60 text-lg max-w-xl mx-auto">
              Practice with AI-generated questions for your role. Get instant Gemini feedback on every answer.
            </p>
          </motion.div>

          {/* Setup card */}
          {questions.length === 0 && !loading && (
            <motion.div className="card-blur rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Configure your mock interview
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Job Role *</label>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-xl focus:outline-none focus:border-primary smooth-transition text-sm">
                    <option value="">Select a role…</option>
                    {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    <option value="custom">Other (type below)</option>
                  </select>
                  {role === "custom" && (
                    <input type="text" placeholder="Type your job role…"
                      className="w-full mt-2 px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-xl focus:outline-none focus:border-primary smooth-transition text-sm"
                      onChange={e => setRole(e.target.value)} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Experience Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "junior", label: "Junior", desc: "0–2 years" },
                      { id: "mid", label: "Mid-level", desc: "2–5 years" },
                      { id: "senior", label: "Senior", desc: "5+ years" },
                    ].map(l => (
                      <button key={l.id} onClick={() => setExperience(l.id)}
                        className={`p-3 rounded-xl text-left smooth-transition border ${experience === l.id ? "bg-primary/15 border-primary" : "card-blur hover:border-primary/40"}`}>
                        <p className="font-semibold text-sm">{l.label}</p>
                        <p className="text-xs text-foreground/50">{l.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}

                <motion.button onClick={generateQuestions} disabled={!role || role === "custom"}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/40 smooth-transition flex items-center justify-center gap-2 disabled:opacity-50">
                  <Sparkles className="w-5 h-5" /> Generate Interview Questions with Gemini
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <motion.div className="card-blur rounded-2xl p-12 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#4285f4] to-[#9c27b0] flex items-center justify-center"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="white"/>
                </svg>
              </motion.div>
              <p className="font-semibold text-lg">Gemini is generating your questions…</p>
              <p className="text-foreground/50 text-sm mt-1">Tailoring questions for {role}</p>
            </motion.div>
          )}

          {/* Interview Q&A */}
          {questions.length > 0 && !done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Progress */}
              <div className="flex items-center justify-between mb-3 text-sm text-foreground/60">
                <span>Question {current + 1} of {questions.length}</span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 28 28" fill="none" className="text-[#4285f4]">
                    <path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="currentColor"/>
                  </svg>
                  Gemini AI
                </span>
              </div>
              <div className="w-full h-2 bg-foreground/10 rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  animate={{ width: `${((current) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>

              <div className="card-blur rounded-2xl p-8">
                <AnimatePresence mode="wait">
                  <motion.div key={current}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Question {current + 1}</p>
                    <h3 className="text-xl font-bold mb-6 leading-relaxed">{questions[current]}</h3>
                  </motion.div>
                </AnimatePresence>

                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={5}
                  placeholder="Type your answer here… be specific and use examples from your experience."
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-xl focus:outline-none focus:border-primary smooth-transition text-sm resize-none mb-4"
                />

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <motion.button onClick={submitAnswer} disabled={!answer.trim() || evaluating}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg smooth-transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {evaluating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Gemini is evaluating…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Answer</>
                  )}
                </motion.button>
              </div>

              {/* Previous answers */}
              {results.length > 0 && (
                <div className="mt-6 space-y-4">
                  <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest">Previous Answers</p>
                  {results.map((r, i) => (
                    <div key={i} className="card-blur rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-foreground/50">Q{i + 1}</p>
                        <span className="text-sm font-bold" style={{ color: r.score >= 80 ? "#22c55e" : r.score >= 60 ? "#f97316" : "#ef4444" }}>
                          {r.score}/100
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-1">{r.question}</p>
                      <p className="text-xs text-foreground/60 mb-2 italic">"{r.userAnswer.slice(0, 100)}{r.userAnswer.length > 100 ? "…" : ""}"</p>
                      <p className="text-xs text-foreground/70 bg-primary/5 rounded-lg p-3">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Results */}
          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="card-blur rounded-2xl p-10 text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
                    <motion.circle cx="48" cy="48" r="40" fill="none" stroke={scoreColor} strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={251}
                      initial={{ strokeDashoffset: 251 }}
                      animate={{ strokeDashoffset: 251 - (avgScore / 100) * 251 }}
                      transition={{ duration: 1.5, ease: "easeOut" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: scoreColor }}>{avgScore}</span>
                    <span className="text-xs text-foreground/40">/ 100</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2">Interview Complete!</h2>
                <p className="text-foreground/60 mb-2">
                  {avgScore >= 80 ? "Excellent performance! You're ready." :
                   avgScore >= 60 ? "Good effort! A bit more practice will get you there." :
                   "Keep practising — you'll improve with each session."}
                </p>
                <p className="text-xs text-foreground/40 flex items-center justify-center gap-1 mb-6">
                  <svg width="10" height="10" viewBox="0 0 28 28" fill="none"><path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="currentColor"/></svg>
                  Evaluated by Google Gemini AI
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setQuestions([]); setResults([]); setDone(false); setRole(""); }}
                    className="px-6 py-3 card-blur rounded-xl font-semibold hover:border-primary/40 smooth-transition flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                  <Link to="/create-resume"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg smooth-transition flex items-center gap-2">
                    Build Resume <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Detailed feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Detailed Feedback</h3>
                {results.map((r, i) => (
                  <div key={i} className="card-blur rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="font-semibold text-sm flex-1">{r.question}</p>
                      <span className="text-sm font-bold px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ background: `${scoreColor}20`, color: scoreColor }}>
                        {r.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 italic mb-3">Your answer: "{r.userAnswer.slice(0, 150)}{r.userAnswer.length > 150 ? "…" : ""}"</p>
                    <div className="bg-primary/5 rounded-lg p-3 flex gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80">{r.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
