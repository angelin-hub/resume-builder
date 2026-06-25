import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, RotateCcw } from "lucide-react";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
}

// ── Smart local AI responses ──────────────────────────────────────────────────
const knowledge: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["ats","applicant tracking","pass","scan","filter"],
    answer: "To pass ATS systems: ① Use standard section headings (Experience, Education, Skills). ② Mirror keywords from the job description exactly. ③ Avoid tables, columns, or images in the ATS version. ④ Use a .docx or plain-text PDF. Our ATS-Ready template is built for this! 🎯",
  },
  {
    keywords: ["summary","objective","profile","about"],
    answer: "A strong summary = 2–3 sentences: Years of experience + core expertise + 1 standout achievement. Example: \"Full-stack engineer with 5+ years building React/Node apps. Led a team that shipped a product used by 2M+ users. Reduced load time by 60% through architecture refactoring.\" ✨",
  },
  {
    keywords: ["skill","skills","technical","hard skill","soft skill"],
    answer: "Separate hard skills (tools, languages, platforms) from soft skills (leadership, communication). List 8–12 technical skills relevant to your target role. Put the most important ones first — ATS weights the order. 🛠️",
  },
  {
    keywords: ["experience","work","job","bullet","achievement","impact"],
    answer: "Use the CAR formula: Context → Action → Result. Replace duties with achievements: ❌ \"Managed a team\" → ✅ \"Led a team of 6 engineers, delivering 3 products 20% ahead of schedule.\" Quantify everything possible — numbers stand out! 📈",
  },
  {
    keywords: ["format","length","page","one page","two page"],
    answer: "Under 10 years experience → 1 page. Senior/10+ years → 2 pages max. Recruiters spend ~7 seconds on first scan. Use clear headings, consistent spacing, and avoid walls of text. Our templates handle all of this automatically! 📄",
  },
  {
    keywords: ["education","degree","gpa","university","college","school"],
    answer: "Put Education after Experience (unless you're a recent grad). Include: degree, institution, graduation year, GPA if 3.5+. Add relevant coursework or honors only if they add value for the target role. 🎓",
  },
  {
    keywords: ["template","design","color","layout","which"],
    answer: "Choosing a template: Modern/Creative → tech, design, startups. Classic/ATS-Ready → corporate, finance, law. Executive → C-suite, senior management. Minimal → academic, research. Match the industry culture! 🎨",
  },
  {
    keywords: ["cover letter","covering letter"],
    answer: "A great cover letter: ① Address the hiring manager by name. ② Open with a hook — a specific achievement. ③ Connect your experience to their problem. ④ End with a clear CTA. Keep it to 3 short paragraphs, under 300 words. ✉️",
  },
  {
    keywords: ["linkedin","profile","online","portfolio"],
    answer: "Always include your LinkedIn URL (make it custom: linkedin.com/in/yourname). Make sure your headline and summary match your resume. Add the same keywords. Recruiters cross-check these! Also include GitHub for tech roles and a portfolio link for design/creative. 🔗",
  },
  {
    keywords: ["gap","career gap","break","unemployed"],
    answer: "Career gaps are common — be honest. Frame them positively: freelance work, courses, caregiving, health recovery. Add a brief note in the job history. Focus on what you learned or built during that time. Recruiters appreciate honesty. 💪",
  },
  {
    keywords: ["interview","interview prep","prepare","question"],
    answer: "Before an interview: ① Research the company's products, mission, recent news. ② Prepare STAR stories for 5+ experiences. ③ Have 3 thoughtful questions ready. ④ Align your resume with their job description. Your resume is your interview script! 🎤",
  },
  {
    keywords: ["salary","pay","compensation","negotiate"],
    answer: "Research market rate on Glassdoor/Levels.fyi/LinkedIn Salary before negotiating. Let them give a number first if possible. Counter with data, not need. \"Based on my research and X years of experience, I was expecting Y–Z range.\" You can negotiate 10–20% above initial offer. 💰",
  },
];

const greetings = [
  "Hi! I'm your AI resume assistant 🤖 Ask me anything about resumes, ATS, formatting, or job searching!",
  "Hello! Ready to help you craft the perfect resume. What would you like to know? ✨",
  "Hey there! I'm here to help you land your dream job. What resume questions do you have? 🚀",
];

function getAnswer(input: string): string {
  const lower = input.toLowerCase();
  const matched = knowledge.find(k => k.keywords.some(kw => lower.includes(kw)));
  if (matched) return matched.answer;

  // Fallback suggestions
  if (lower.length < 5) return "Could you tell me more? I'm here to help with your resume! 😊";
  return `Great question! For "${input.slice(0, 40)}..." — the key is always to tailor your resume to the specific role. Use keywords from the job description, quantify achievements, and keep formatting clean. Want me to cover any specific section in detail?`;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTED = [
  "How do I pass ATS?",
  "Write a strong summary",
  "How long should my resume be?",
  "Best skills to add?",
];

// ── Chat bubble ───────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285f4] to-[#9c27b0] flex items-center justify-center flex-shrink-0 mb-1">
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="white"/>
          </svg>
        </div>
      )}
      <div className={`max-w-[80%] ${isBot ? "" : "items-end flex flex-col"}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isBot
            ? "bg-foreground/8 border border-foreground/10 text-foreground rounded-bl-sm"
            : "bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm"
        }`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-foreground/30 mt-1 px-1">{msg.time}</span>
      </div>
      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mb-1">
          <User className="w-4 h-4 text-foreground/60" />
        </div>
      )}
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4285f4] to-[#9c27b0] flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="white"/>
        </svg>
      </div>
      <div className="bg-foreground/8 border border-foreground/10 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#4285f4]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", text: greetings[0], time: now() },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Build chat history for context (last 6 messages)
    const history = messages.slice(-6).map(m => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      text: m.text,
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) throw new Error("server");
      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply,
        time: now(),
      }]);
    } catch {
      // Fallback to local knowledge base if server/key unavailable
      const answer = getAnswer(text);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: answer,
        time: now(),
      }]);
    }
  };

  const reset = () => {
    setMessages([{ id: "0", role: "assistant", text: greetings[Math.floor(Math.random() * greetings.length)], time: now() }]);
    setInput("");
    setTyping(false);
  };

  return (
    <>
      {/* Floating Robot Button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-20 h-20 flex items-center justify-center"
        style={{ filter: "drop-shadow(0 8px 24px rgba(249,115,22,0.5))" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="AI Resume Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            /* Close state — shrinks robot and shows X circle */
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl"
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            /* Robot idle state */
            <motion.div
              key="robot"
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 20 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 180 }}
            >
              {/* Floating bob animation wrapper */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="80" height="88" viewBox="0 0 80 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Antenna */}
                  <line x1="40" y1="6" x2="40" y2="18" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
                  <motion.circle cx="40" cy="4" r="4" fill="#f97316"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />

                  {/* Head */}
                  <rect x="14" y="18" width="52" height="38" rx="10" fill="url(#robotGrad)" />
                  {/* Head shine */}
                  <rect x="18" y="22" width="20" height="6" rx="3" fill="white" fillOpacity="0.18" />

                  {/* Eyes */}
                  <motion.rect x="22" y="28" width="14" height="10" rx="4" fill="#1a1a1a"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.5, 0.6] }}
                  />
                  <motion.rect x="44" y="28" width="14" height="10" rx="4" fill="#1a1a1a"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.5, 0.6], delay: 0.05 }}
                  />
                  {/* Eye glow */}
                  <motion.rect x="24" y="30" width="10" height="6" rx="3" fill="#f97316"
                    animate={{ opacity: [0.9, 0.4, 0.9] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <motion.rect x="46" y="30" width="10" height="6" rx="3" fill="#f97316"
                    animate={{ opacity: [0.9, 0.4, 0.9] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                  />

                  {/* Mouth */}
                  <rect x="24" y="44" width="32" height="6" rx="3" fill="#1a1a1a" />
                  <rect x="26" y="45" width="8" height="4" rx="2" fill="#f97316" fillOpacity="0.7" />
                  <rect x="36" y="45" width="8" height="4" rx="2" fill="#f97316" fillOpacity="0.5" />
                  <rect x="46" y="45" width="8" height="4" rx="2" fill="#f97316" fillOpacity="0.3" />

                  {/* Neck */}
                  <rect x="34" y="56" width="12" height="6" rx="3" fill="#ea580c" />

                  {/* Body */}
                  <rect x="10" y="62" width="60" height="22" rx="8" fill="url(#robotBodyGrad)" />
                  {/* Body shine */}
                  <rect x="14" y="65" width="28" height="5" rx="2.5" fill="white" fillOpacity="0.12" />
                  {/* Chest light */}
                  <motion.circle cx="40" cy="73" r="5" fill="#f97316"
                    animate={{ opacity: [0.8, 0.3, 0.8], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <circle cx="40" cy="73" r="3" fill="white" fillOpacity="0.6" />

                  {/* Arms */}
                  <rect x="0" y="63" width="12" height="18" rx="6" fill="url(#robotGrad)" />
                  <rect x="68" y="63" width="12" height="18" rx="6" fill="url(#robotGrad)" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="robotGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#c2410c" />
                    </linearGradient>
                    <linearGradient id="robotBodyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#9a3412" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Speech bubble hint */}
                <motion.div
                  className="absolute -top-8 -left-16 bg-white text-orange-600 text-[10px] font-bold px-2 py-1 rounded-xl shadow-lg whitespace-nowrap border border-orange-100"
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8], y: [4, 0, 0, 4] }}
                  transition={{ duration: 3, delay: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  💬 Ask me anything!
                  <span className="absolute bottom-[-5px] right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow pulse ring when closed */}
        {!open && (
          <motion.span
            className="absolute bottom-1 right-1 w-[72px] h-[72px] rounded-full border-2 border-primary pointer-events-none"
            animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] bg-background border border-foreground/10 rounded-3xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4285f4] via-[#9c27b0] to-[#f97316] px-5 py-4 flex items-center gap-3">
              {/* Gemini star icon */}
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="white"/>
                </svg>
              </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Resume AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-green-300"
                    animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-white/70 text-xs">Powered by Gemini AI</span>
                </div>
              </div>
              <button onClick={reset} className="p-1.5 hover:bg-white/20 rounded-lg smooth-transition" title="New conversation">
                <RotateCcw className="w-4 h-4 text-white/70" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg smooth-transition">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: "320px" }}>
              {messages.map(m => <Bubble key={m.id} msg={m} />)}
              {typing && <TypingDots />}
              <div ref={bottomRef} />
            </div>

            {/* Suggested questions — only show when ≤1 messages */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full smooth-transition font-medium border border-primary/20">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-foreground/10">
              <div className="flex items-center gap-2 bg-foreground/5 rounded-2xl px-4 py-2 border border-foreground/10 focus-within:border-primary/40 smooth-transition">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
                  placeholder="Ask about resumes, ATS, skills…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/35"
                />
                <motion.button
                  onClick={() => send(input)}
                  disabled={!input.trim() || typing}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </motion.button>
              </div>
              <p className="text-center text-[10px] text-foreground/30 mt-1.5 flex items-center justify-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Powered by <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Google Gemini</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
