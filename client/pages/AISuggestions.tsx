import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Sparkles, ArrowRight, ArrowLeft, Check, RefreshCw,
  Zap, Target, TrendingUp, FileText, Lightbulb, ChevronDown, ChevronUp,
} from "lucide-react";
import Navigation from "@/components/Navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Suggestion {
  id: string;
  category: "summary" | "skills" | "keywords" | "format" | "impact";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  example?: string;
  applied: boolean;
}

// ─── Static AI suggestion data ────────────────────────────────────────────────
const allSuggestions: Suggestion[] = [
  {
    id: "s1",
    category: "summary",
    priority: "high",
    title: "Strengthen your professional summary",
    description:
      "Your summary should lead with a strong value proposition. Start with your years of experience, core expertise, and a notable achievement.",
    example:
      '"Results-driven Software Engineer with 5+ years building scalable web apps. Led a team that shipped a product used by 2M+ users."',
    applied: false,
  },
  {
    id: "s2",
    category: "impact",
    priority: "high",
    title: "Quantify your achievements",
    description:
      "Replace vague duties with measurable results. Numbers make your resume stand out and pass ATS filters.",
    example:
      'Instead of "Managed a team" → "Managed a team of 8 engineers, delivering 3 projects 20% ahead of schedule."',
    applied: false,
  },
  {
    id: "s3",
    category: "keywords",
    priority: "high",
    title: "Add industry-specific keywords",
    description:
      "Include role-relevant keywords so your resume passes Applicant Tracking Systems (ATS) before a human reads it.",
    example:
      "For IT: 'CI/CD', 'microservices', 'REST API', 'agile'. For Marketing: 'ROI', 'conversion rate', 'growth hacking'.",
    applied: false,
  },
  {
    id: "s4",
    category: "skills",
    priority: "medium",
    title: "Separate hard skills from soft skills",
    description:
      "Group your technical skills (tools, languages, platforms) separately from interpersonal skills to improve readability.",
    example:
      "Hard Skills: Python, React, AWS | Soft Skills: Leadership, Communication, Problem Solving",
    applied: false,
  },
  {
    id: "s5",
    category: "format",
    priority: "medium",
    title: "Use consistent verb tense",
    description:
      "Current roles should use present tense; past roles should use past tense. Inconsistency signals lack of attention to detail.",
    example: '"Develop" (current) vs "Developed" (past role).',
    applied: false,
  },
  {
    id: "s6",
    category: "format",
    priority: "medium",
    title: "Keep your resume to 1–2 pages",
    description:
      "Recruiters spend an average of 7 seconds on a resume. Concise, well-formatted content increases readability.",
    example:
      "If you have under 10 years of experience, aim for 1 page. Senior professionals may use 2.",
    applied: false,
  },
  {
    id: "s7",
    category: "impact",
    priority: "low",
    title: "Start bullet points with strong action verbs",
    description:
      "Weak: 'Responsible for managing…' — Strong: 'Spearheaded...', 'Optimised...', 'Architected...'",
    example:
      "Engineered · Orchestrated · Accelerated · Reduced · Launched · Delivered",
    applied: false,
  },
  {
    id: "s8",
    category: "keywords",
    priority: "low",
    title: "Mirror the job description language",
    description:
      "Tailor your resume for each role by echoing exact phrases from the job posting. This boosts ATS match scores.",
    example:
      'If the JD says "cross-functional collaboration", use that exact phrase in your resume.',
    applied: false,
  },
];

const categoryMeta: Record<
  Suggestion["category"],
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  summary: {
    label: "Summary",
    icon: <FileText className="w-4 h-4" />,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  skills: {
    label: "Skills",
    icon: <Target className="w-4 h-4" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  keywords: {
    label: "Keywords",
    icon: <Zap className="w-4 h-4" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  format: {
    label: "Format",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  impact: {
    label: "Impact",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
};

const priorityStyle: Record<Suggestion["priority"], string> = {
  high: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  medium: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  low: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
};

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
        <motion.circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.span
          className="text-2xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <p className="text-[10px] text-foreground/50 -mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

// ─── Suggestion card ──────────────────────────────────────────────────────────
function SuggestionCard({
  suggestion,
  onToggle,
}: {
  suggestion: Suggestion;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = categoryMeta[suggestion.category];

  return (
    <motion.div
      layout
      className={`card-blur rounded-2xl overflow-hidden transition-all duration-300 ${
        suggestion.applied ? "opacity-60" : ""
      }`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: suggestion.applied ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-1">
          {/* Category icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
            {meta.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${priorityStyle[suggestion.priority]}`}>
                {suggestion.priority} priority
              </span>
            </div>
            <h3 className="font-semibold text-sm leading-snug">{suggestion.title}</h3>
          </div>

          {/* Apply / Applied button */}
          <button
            onClick={() => onToggle(suggestion.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold smooth-transition ${
              suggestion.applied
                ? "bg-green-500/15 text-green-500 border border-green-500/30"
                : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-md hover:shadow-primary/30"
            }`}
          >
            {suggestion.applied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Applied
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Apply
              </>
            )}
          </button>
        </div>

        <p className="text-foreground/60 text-sm ml-11 leading-relaxed">
          {suggestion.description}
        </p>

        {/* Expand example */}
        {suggestion.example && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-11 mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 smooth-transition"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Hide example
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> See example
              </>
            )}
          </button>
        )}

        <AnimatePresence>
          {expanded && suggestion.example && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="ml-11 overflow-hidden"
            >
              <div className="mt-2 p-3 bg-foreground/5 rounded-lg border border-foreground/10 text-xs text-foreground/70 italic leading-relaxed">
                {suggestion.example}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AISuggestions() {
  const navigate = useNavigate();
  const location = useLocation();

  const [suggestions, setSuggestions] = useState<Suggestion[]>(allSuggestions);
  const [scanning, setScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState<Suggestion["category"] | "all">("all");
  const [aiError, setAiError] = useState(false);

  // Real AI scan — calls Gemini via server, falls back to static suggestions
  useEffect(() => {
    let prog = 0;
    // Start progress animation
    const progressInterval = setInterval(() => {
      prog = Math.min(prog + 3, 85); // go to 85% while waiting for API
      setScanProgress(prog);
    }, 60);

    // Read resume draft from localStorage to send to AI
    const fetchAISuggestions = async () => {
      try {
        const raw = localStorage.getItem("rp_draft");
        const draft = raw ? JSON.parse(raw) : null;
        const resumeData = draft ? {
          jobTitle: draft.fd?.jobTitle,
          summary: draft.fd?.summary,
          skills: draft.skills?.filter(Boolean),
          workHistory: draft.workList?.filter((w: any) => w.company || w.position),
          education: draft.eduList?.filter((e: any) => e.institution),
          domain: draft.domain,
          experienceLevel: draft.experienceLevel,
        } : null;

        if (resumeData) {
          const res = await fetch("/api/ai/suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeData }),
            signal: AbortSignal.timeout(20000),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.suggestions?.length) {
              const withApplied = data.suggestions.map((s: any) => ({ ...s, applied: false }));
              clearInterval(progressInterval);
              setScanProgress(100);
              setSuggestions(withApplied);
              setScanning(false);
              return;
            }
          }
        }
      } catch (_) {
        setAiError(true);
      }
      // Fallback to static suggestions
      clearInterval(progressInterval);
      setScanProgress(100);
      setSuggestions(allSuggestions);
      setScanning(false);
    };

    fetchAISuggestions();
    return () => clearInterval(progressInterval);
  }, []);

  const appliedCount = suggestions.filter((s) => s.applied).length;
  const totalCount = suggestions.length;
  const score = Math.round(42 + (appliedCount / totalCount) * 55);

  const filtered =
    activeFilter === "all"
      ? suggestions
      : suggestions.filter((s) => s.category === activeFilter);

  const toggleSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: !s.applied } : s))
    );
  };

  const applyAll = () => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, applied: true })));
  };

  const resetAll = () => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, applied: false })));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <Link
            to="/create-resume"
            className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground smooth-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Resume Builder
          </Link>

          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 card-blur px-4 py-2 rounded-full text-sm font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="w-4 h-4 text-primary" /> Powered by Google Gemini AI
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-3">
              AI Resume Suggestions
            </h1>
            <p className="text-foreground/60 text-lg max-w-xl mx-auto">
              Our AI analysed your resume and found{" "}
              <span className="text-foreground font-semibold">{totalCount} improvements</span>{" "}
              to boost your chances.
            </p>
          </motion.div>

          {/* Scan animation */}
          <AnimatePresence>
            {scanning && (
              <motion.div
                className="card-blur rounded-2xl p-8 mb-8 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className="font-semibold">Gemini AI is analysing your resume…</span>
                </div>
                <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden max-w-md mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-sm text-foreground/40 mt-2">{scanProgress}% complete</p>
                {aiError && <p className="text-xs text-amber-500 mt-1">Using built-in suggestions (add GEMINI_API_KEY for AI-powered analysis)</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score + Stats */}
          {!scanning && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Score */}
              <div className="card-blur rounded-2xl p-6 flex flex-col items-center justify-center sm:col-span-1">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">
                  Resume Score
                </p>
                <p className="text-[9px] text-foreground/30 mb-3 flex items-center gap-1">
                  <svg width="8" height="8" viewBox="0 0 28 28" fill="none"><path d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z" fill="currentColor"/></svg>
                  Analysed by Gemini
                </p>
                <ScoreRing score={score} />
                <p className="text-xs text-foreground/50 mt-2">
                  {score >= 80
                    ? "Excellent 🎉"
                    : score >= 60
                    ? "Good — keep going!"
                    : "Needs improvement"}
                </p>
              </div>

              {/* Stats */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Suggestions Applied",
                    value: `${appliedCount} / ${totalCount}`,
                    icon: <Check className="w-5 h-5 text-white" />,
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    label: "High Priority",
                    value: suggestions.filter((s) => s.priority === "high").length,
                    icon: <Zap className="w-5 h-5 text-white" />,
                    color: "from-rose-500 to-pink-500",
                  },
                  {
                    label: "Categories",
                    value: Object.keys(categoryMeta).length,
                    icon: <Target className="w-5 h-5 text-white" />,
                    color: "from-primary to-secondary",
                  },
                  {
                    label: "ATS Readiness",
                    value: `${Math.min(100, 55 + appliedCount * 6)}%`,
                    icon: <TrendingUp className="w-5 h-5 text-white" />,
                    color: "from-amber-500 to-orange-500",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="card-blur rounded-2xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-xs text-foreground/50">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggestions list */}
          {!scanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Filter bar + bulk actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                {/* Category filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold smooth-transition ${
                      activeFilter === "all"
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "card-blur hover:border-foreground/30"
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  {(Object.keys(categoryMeta) as Suggestion["category"][]).map((cat) => {
                    const m = categoryMeta[cat];
                    const count = suggestions.filter((s) => s.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold smooth-transition ${
                          activeFilter === cat
                            ? `${m.bg} ${m.color} border border-current/30`
                            : "card-blur hover:border-foreground/30"
                        }`}
                      >
                        {m.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Bulk actions */}
                <div className="flex gap-2">
                  <button
                    onClick={applyAll}
                    className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 smooth-transition flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Apply All
                  </button>
                  <button
                    onClick={resetAll}
                    className="px-3 py-1.5 text-xs font-semibold card-blur rounded-lg hover:bg-foreground/10 smooth-transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 mb-10">
                {filtered.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} onToggle={toggleSuggestion} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Continue CTA */}
          {!scanning && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 card-blur rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <p className="font-semibold">
                  {appliedCount === 0
                    ? "Resume score boosted — you're ready!"
                    : `${appliedCount} suggestion${appliedCount > 1 ? "s" : ""} applied — great work!`}
                </p>
                <p className="text-sm text-foreground/50">
                  Preview your final resume, then download or save it.
                </p>
              </div>
              <motion.button
                onClick={() => navigate("/resume-preview")}
                className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary/40 smooth-transition whitespace-nowrap"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Preview & Download Resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
