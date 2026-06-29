import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Briefcase, BookOpen, Check, Zap,
  Download, Eye, Mail, Phone, MapPin, User, Plus, Trash2,
  Save, CloudOff, Cloud, Loader2, Globe, Award, Heart,
  Languages, Code, Star, GraduationCap, Link2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { resumeApi, getToken, saveResumeLocally } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getDomainConfig } from "@/lib/domainConfig";
import ResumeStrengthMeter from "@/components/ResumeStrengthMeter";
import BuilderAITip from "@/components/BuilderAITip";

// ─── Static data ──────────────────────────────────────────────────────────────
// Must match ids and accents in client/pages/Templates.tsx exactly

const templateOptions = [
  { id: "classic",    name: "Classic",      color: "from-amber-500 to-orange-500",   accent: "#f97316", bg: "#fff7ed" },
  { id: "modern",     name: "Modern",       color: "from-orange-500 to-amber-400",   accent: "#f97316", bg: "#fff7ed" },
  { id: "minimal",    name: "Minimal",      color: "from-gray-500 to-gray-600",      accent: "#6b7280", bg: "#f9fafb" },
  { id: "creative",   name: "Creative",     color: "from-emerald-600 to-teal-600",   accent: "#059669", bg: "#ecfdf5" },
  { id: "executive",  name: "Executive",    color: "from-stone-600 to-gray-700",     accent: "#57534e", bg: "#fafaf9" },
  { id: "ats",        name: "ATS-Optimized",color: "from-pink-600 to-red-600",       accent: "#db2777", bg: "#fdf2f8" },
  { id: "sidebar",    name: "Sidebar Pro",  color: "from-amber-500 to-orange-500",   accent: "#d97706", bg: "#fffbeb" },
  { id: "healthcare", name: "Healthcare",   color: "from-teal-600 to-green-600",     accent: "#0d9488", bg: "#f0fdfa" },
  { id: "corporate",  name: "Corporate",    color: "from-slate-600 to-zinc-600",     accent: "#475569", bg: "#f8fafc" },
];

const educationLevels = [
  { id: "secondary", label: "Secondary School", icon: "🏫" },
  { id: "diploma",   label: "Diploma",           icon: "📜" },
  { id: "bachelors", label: "Bachelor's Degree",  icon: "🎓" },
  { id: "masters",   label: "Master's Degree",    icon: "🎓" },
  { id: "doctorate", label: "Doctorate / Ph.D",   icon: "🔬" },
];

const STEPS = [
  "Experience", "Student?", "Education", "Template", "Personal Info",
  "Work History", "Education Details", "Skills & Languages",
  "Projects", "Certifications", "Achievements", "References", "Done",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string; email: string; phone: string;
  location: string; jobTitle: string; summary: string;
  website: string; linkedin: string; github: string;
}

interface WorkEntry {
  id: string; company: string; position: string;
  startDate: string; endDate: string; current: boolean;
  description: string; achievements: string;
}

interface EduEntry {
  id: string; institution: string; degree: string;
  field: string; startYear: string; endYear: string;
  gpa: string; activities: string;
}

interface Project {
  id: string; name: string; role: string;
  tech: string; description: string; link: string;
}

interface Certification {
  id: string; name: string; issuer: string;
  date: string; credentialId: string;
}

interface Achievement {
  id: string; title: string; description: string; year: string;
}

interface Reference {
  id: string; name: string; title: string;
  company: string; email: string; phone: string;
}

// ─── Reusable small components ────────────────────────────────────────────────

function OptionCard({ selected, onClick, icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: string; title: string; desc?: string;
}) {
  return (
    <button onClick={onClick} className={`w-full p-5 rounded-xl text-left smooth-transition ${selected ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary shadow-lg shadow-primary/20" : "card-blur hover:border-primary/40"}`}>
      <div className="flex items-start gap-4">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          {desc && <p className="text-sm text-foreground/60 mt-0.5">{desc}</p>}
        </div>
        {selected && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>}
      </div>
    </button>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", rows }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; rows?: number;
}) {
  const cls = "w-full px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition text-sm";
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground/80">{label}</label>
      {rows
        ? <textarea rows={rows} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`${cls} resize-none`} />
        : <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={cls} />
      }
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-bold gradient-text">{title}</h2>
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 card-blur rounded-xl text-sm font-semibold hover:border-primary/40 smooth-transition text-primary mt-4">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

function Btns({ onBack, onNext, disabled, label = "Next →", first = false, loading = false }: {
  onBack: () => void; onNext: () => void; disabled?: boolean; label?: string; first?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex gap-4 mt-8">
      {first
        ? <Link to="/" className="flex-1 px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/10 smooth-transition font-semibold flex items-center justify-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" />Cancel</Link>
        : <button onClick={onBack} className="flex-1 px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/10 smooth-transition font-semibold flex items-center justify-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" />Back</button>
      }
      <button onClick={onNext} disabled={disabled || loading} className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 smooth-transition text-sm ${disabled || loading ? "bg-foreground/10 text-foreground/40 cursor-not-allowed" : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl hover:shadow-primary/40"}`}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>{label} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

function MiniPreview({ accent, twoCol, withPhoto }: { accent: string; twoCol: boolean; withPhoto: boolean }) {
  return (
    <svg viewBox="0 0 160 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="110" fill="white" fillOpacity="0.06" />
      <rect x="0" y="0" width="160" height="26" fill={accent} opacity="0.85" />
      {withPhoto && <circle cx="13" cy="13" r="9" fill="white" opacity="0.25" />}
      <rect x={withPhoto ? "28" : "8"} y="7" width="55" height="5" rx="2" fill="white" opacity="0.85" />
      <rect x={withPhoto ? "28" : "8"} y="16" width="38" height="3" rx="1" fill="white" opacity="0.5" />
      {twoCol ? (
        <>
          <rect x="8" y="32" width="28" height="2" rx="1" fill={accent} opacity="0.6" />
          {[37,43,49,55,61,67].map(y => <rect key={y} x="8" y={y} width="52" height="2" rx="1" fill="#aaa" opacity="0.3" />)}
          <rect x="68" y="32" width="32" height="2" rx="1" fill={accent} opacity="0.6" />
          {[37,43,49,55,61,67,74,81].map(y => <rect key={y} x="68" y={y} width="84" height="2" rx="1" fill="#aaa" opacity="0.28" />)}
        </>
      ) : (
        <>
          <rect x="8" y="32" width="36" height="2" rx="1" fill={accent} opacity="0.6" />
          {[37,43,49,55,62,68,75,82,90,97].map((y,i) => <rect key={y} x="8" y={y} width={i%3===2?100:144} height="2" rx="1" fill="#aaa" opacity="0.28" />)}
        </>
      )}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Step control (1-based, max 13)
  const [step, setStep] = useState(1);

  // Step 1-3 prefs
  const [experience, setExp]  = useState("");
  const [isStudent, setStudent] = useState("");
  const [eduLevel, setEdu]    = useState("");

  // Step 4 template prefs
  const [withPhoto, setPhoto] = useState("");
  const [columns, setCols]    = useState("");
  const [selectedTpl, setTpl] = useState(searchParams.get("template") ?? "");

  // Step 5 personal info
  const [fd, setFd] = useState<PersonalInfo>({
    fullName:"", email:"", phone:"", location:"",
    jobTitle:"", summary:"", website:"", linkedin:"", github:"",
  });
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 6 work history
  const [workList, setWork] = useState<WorkEntry[]>([
    { id:"w1", company:"", position:"", startDate:"", endDate:"", current:false, description:"", achievements:"" }
  ]);

  // Step 7 education details
  const [eduList, setEduList] = useState<EduEntry[]>([
    { id:"e1", institution:"", degree:"", field:"", startYear:"", endYear:"", gpa:"", activities:"" }
  ]);

  // Step 8 skills & languages
  const [skills, setSkills]       = useState<string[]>(["", "", "", ""]);
  const [languages, setLangs]     = useState<{lang:string; level:string}[]>([{ lang:"", level:"" }]);
  const [softSkills, setSoftSkills] = useState<string[]>(["", ""]);
  const [interests, setInterests] = useState<string[]>(["", ""]);

  // Step 9 projects
  const [projects, setProjects] = useState<Project[]>([
    { id:"p1", name:"", role:"", tech:"", description:"", link:"" }
  ]);

  // Step 10 certifications
  const [certs, setCerts] = useState<Certification[]>([
    { id:"c1", name:"", issuer:"", date:"", credentialId:"" }
  ]);

  // Step 11 achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id:"a1", title:"", description:"", year:"" }
  ]);

  // Step 12 references
  const [refs, setRefs] = useState<Reference[]>([
    { id:"r1", name:"", title:"", company:"", email:"", phone:"" }
  ]);

  // Save state
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [savedId, setSavedId] = useState<number|null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ── Jump to Template step when ?template= param is present ───────────────
  useEffect(() => {
    const tplParam = searchParams.get("template");
    const prefill  = searchParams.get("prefill");
    if (tplParam && prefill !== "1") {
      const valid = templateOptions.find(t => t.id === tplParam);
      if (valid) {
        setTpl(tplParam);
        // Set sensible defaults so step 4 is immediately usable
        setPhoto("without-photo");
        setCols("one-col");
        // Immediately persist template choice to draft so preview + download use it
        try {
          const existing = localStorage.getItem("rp_draft");
          const draft = existing ? JSON.parse(existing) : {};
          localStorage.setItem("rp_draft", JSON.stringify({
            ...draft,
            templateId: tplParam,
            layoutColumns: draft.layoutColumns || "one-col",
            withPhoto: draft.withPhoto ?? false,
            customColor: searchParams.get("color") || draft.customColor || null,
            customFont:  searchParams.get("font")  || draft.customFont  || null,
          }));
        } catch (_) {}
        setStep(1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pre-fill from example template (prefill=1 URL param) ──────────────────
  useEffect(() => {
    if (searchParams.get("prefill") !== "1") return;
    try {
      const raw = localStorage.getItem("rp_draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.templateId) setTpl(d.templateId);
      if (d.layoutColumns) setCols(d.layoutColumns);
      setPhoto(d.withPhoto ? "with-photo" : "without-photo");
      if (d.experienceLevel) setExp(d.experienceLevel);
      if (d.fd) setFd(f => ({ ...f, ...d.fd }));
      if (d.workList?.length) setWork(d.workList);
      if (d.eduList?.length) setEduList(d.eduList);
      if (d.skills?.length) setSkills(d.skills.filter(Boolean));
      setStep(5);
      localStorage.removeItem("rp_example_prefill");
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived
  const tpl        = templateOptions.find(t => t.id === selectedTpl);
  const twoCol     = columns === "two-col";
  const hasPhoto   = withPhoto === "with-photo";
  const totalSteps = experience === "no-experience" && isStudent === "student" ? 13 : 12;
  const progressPct = Math.round((step / totalSteps) * 100);
  // Domain-specific content config — updates all placeholders/suggestions automatically
  const domainCfg  = getDomainConfig(searchParams.get("domain"));
  // Custom color/font from Templates page customizer
  const customColor = searchParams.get("color") || null;
  const customFont  = searchParams.get("font") || null;
  // Override tpl accent if user customised it
  const effectiveTpl = tpl ? {
    ...tpl,
    accent: customColor ?? tpl.accent,
  } : tpl;

  // ── Save ──────────────────────────────────────────────────────────────────────

  const buildPayload = useCallback(() => ({
    title: fd.fullName ? `${fd.fullName}${fd.jobTitle ? ` – ${fd.jobTitle}` : ""}` : "Untitled Resume",
    domain: searchParams.get("domain") ?? undefined,
    // Use selectedTpl (from state) or fall back to URL param — ensures template from picker page is always saved
    templateId: selectedTpl || searchParams.get("template") || "modern",
    experienceLevel: experience as any,
    isStudent: isStudent === "student",
    educationLevel: eduLevel,
    layoutColumns: columns,
    withPhoto: withPhoto === "with-photo",
    jobTitle: fd.jobTitle,
    phone: fd.phone,
    location: fd.location,
    summary: fd.summary,
    skills: skills.filter(Boolean),
    status: "draft" as const,
  }), [fd, selectedTpl, experience, isStudent, eduLevel, columns, withPhoto, skills, searchParams]); = useCallback(async () => {
    setSaveStatus("saving");
    const draftData = { ...buildPayload(), fd, workList, eduList, projects, certs, achievements, refs, languages, softSkills, interests, photoDataUrl, savedAt: new Date().toISOString() };
    try {
      // Save raw draft (used by ResumePreview for full rendering)
      localStorage.setItem("rp_draft", JSON.stringify(draftData));
      // Also save into the multi-resume list for the Dashboard
      const name = fd.fullName?.trim() || "Untitled Resume";
      const title = fd.jobTitle ? `${name} – ${fd.jobTitle}` : name;
      saveResumeLocally({
        id: savedId ?? undefined,
        title,
        status: "draft",
        templateId: buildPayload().templateId,
        domain: buildPayload().domain,
        jobTitle: fd.jobTitle,
        location: fd.location,
        skills: skills.filter(Boolean),
        resumeScore: 65,
        downloadCount: 0,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch (_) {}

    if (getToken()) {
      try {
        const payload = buildPayload();
        if (savedId) {
          await resumeApi.update(savedId, payload);
        } else {
          const saved = await resumeApi.create(payload);
          setSavedId(saved.id ?? null);
        }
        setSaveStatus("saved");
      } catch { setSaveStatus("error"); }
    } else {
      setSaveStatus("saved");
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus("idle"), 3000);
  }, [buildPayload, savedId, fd, workList, eduList, projects, certs, achievements, refs, languages, softSkills, interests, skills, photoDataUrl]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = async () => {
    if (step === 1 && experience === "no-experience") return setStep(2);
    if (step === 1) return setStep(4);
    if (step === 2 && isStudent === "student") return setStep(3);
    if (step === 2) return setStep(4);
    if (step === 3) return setStep(4);
    if (step < totalSteps) return setStep(s => s + 1);
    // Final step — save and go to AI suggestions
    await handleSave();
    navigate("/ai-suggestions");
  };

  const goBack = () => {
    if (step === 4) {
      if (experience === "no-experience" && isStudent === "student") return setStep(3);
      if (experience === "no-experience") return setStep(2);
      return setStep(1);
    }
    if (step > 1) setStep(s => s - 1);
  };

  const downloadPdf = () => {
    const el = previewRef.current;
    if (!el) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fd.fullName || "Resume"}</title><style>body{margin:0;padding:0;font-family:Georgia,serif;}@media print{body{-webkit-print-color-adjust:exact;}}</style></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${fd.fullName || "resume"}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Save button ─────────────────────────────────────────────────────────────

  const SaveBtn = ({ full = false }: { full?: boolean }) => (
    <button onClick={handleSave} disabled={saveStatus === "saving"}
      className={`${full ? "w-full" : ""} py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 smooth-transition text-sm
        ${saveStatus === "saved"   ? "bg-green-500/15 text-green-500 border border-green-500/30"
        : saveStatus === "error"   ? "bg-red-500/15 text-red-500 border border-red-500/30"
        : saveStatus === "saving"  ? "bg-foreground/10 text-foreground/40 cursor-not-allowed"
        : "card-blur hover:border-primary/40 hover:bg-primary/5"}`}
    >
      {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
      {saveStatus === "saved"  && <Check className="w-4 h-4" />}
      {saveStatus === "error"  && <CloudOff className="w-4 h-4" />}
      {saveStatus === "idle"   && <Save className="w-4 h-4" />}
      {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? (isAuthenticated ? "Saved to Cloud ✓" : "Saved Locally ✓") : saveStatus === "error" ? "Retry Save" : isAuthenticated ? "Save to Cloud" : "Save Draft"}
    </button>
  );

  // ── Card wrapper ────────────────────────────────────────────────────────────

  const card = (children: React.ReactNode) => (
    <motion.div key={step} className="card-blur p-7 sm:p-9 rounded-2xl" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
      <BuilderAITip step={step} />
      {children}
    </motion.div>
  );

  const showRight = step >= 4;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="relative pt-24 pb-16 px-4 overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay:"2s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mb-8">
            {/* Domain banner */}
            {searchParams.get("domain") && domainCfg.label !== "General" && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl mb-4 text-sm">
                <span className="text-lg">🎯</span>
                <div>
                  <span className="font-bold text-primary">{domainCfg.label}</span>
                  <span className="text-foreground/50 ml-2">· Keywords: </span>
                  <span className="text-foreground/60 text-xs italic">{domainCfg.keywordsHint}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between mb-2 text-sm">
              <span className="font-semibold">Step {step} of {totalSteps} — {STEPS[step-1]}</span>
              <div className="flex items-center gap-3">
                {step >= 4 && (
                  <button onClick={handleSave} disabled={saveStatus==="saving"} className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground smooth-transition">
                    {saveStatus==="saving" ? <Loader2 className="w-3 h-3 animate-spin"/> : saveStatus==="saved" ? <Check className="w-3 h-3 text-green-500"/> : saveStatus==="error" ? <CloudOff className="w-3 h-3 text-red-400"/> : <Save className="w-3 h-3"/>}
                    <span className={saveStatus==="saved"?"text-green-500":saveStatus==="error"?"text-red-400":""}>
                      {saveStatus==="saving"?"Saving…":saveStatus==="saved"?"Saved":saveStatus==="error"?"Failed":"Save"}
                    </span>
                  </button>
                )}
                <span className="text-foreground/50">{progressPct}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" animate={{ width:`${progressPct}%` }} transition={{ duration:0.5, ease:"easeOut" }} />
            </div>
            {/* Step dots */}
            <div className="flex gap-1 mt-2 justify-center flex-wrap">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i+1 === step ? "w-6 bg-primary" : i+1 < step ? "w-3 bg-primary/50" : "w-3 bg-foreground/10"}`} />
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className={showRight ? "grid lg:grid-cols-2 gap-8 items-start" : "max-w-2xl mx-auto"}>
            <div>

              {/* STEP 1 — Experience */}
              {step===1 && card(<>
                <SectionHeader icon={Briefcase} title="Work Experience" />
                <p className="text-foreground/60 mb-6">How much professional experience do you have?</p>
                <div className="space-y-3">
                  <OptionCard selected={experience==="no-experience"} onClick={()=>setExp("no-experience")} icon="🎓" title="No Experience" desc="Just starting my career" />
                  <OptionCard selected={experience==="one-year"}      onClick={()=>setExp("one-year")}      icon="💼" title="Less than 1 Year" desc="I have some work experience" />
                  <OptionCard selected={experience==="three-years"}   onClick={()=>setExp("three-years")}   icon="📈" title="1–3 Years" desc="Building my career" />
                  <OptionCard selected={experience==="five-years"}    onClick={()=>setExp("five-years")}    icon="⭐" title="5+ Years" desc="Experienced professional" />
                  <OptionCard selected={experience==="ten-years"}     onClick={()=>setExp("ten-years")}     icon="🏆" title="10+ Years" desc="Senior / Executive level" />
                </div>
                <Btns first onBack={()=>{}} onNext={goNext} disabled={!experience} />
              </>)}

              {/* STEP 2 — Student */}
              {step===2 && card(<>
                <SectionHeader icon={BookOpen} title="Are You a Student?" />
                <p className="text-foreground/60 mb-6">This helps us tailor your resume layout.</p>
                <div className="space-y-3">
                  <OptionCard selected={isStudent==="student"}     onClick={()=>setStudent("student")}     icon="📚" title="Yes, I'm a Student"    desc="Currently enrolled" />
                  <OptionCard selected={isStudent==="not-student"} onClick={()=>setStudent("not-student")} icon="🎯" title="No, I'm Not a Student" desc="Not currently studying" />
                </div>
                <Btns onBack={goBack} onNext={goNext} disabled={!isStudent} />
              </>)}

              {/* STEP 3 — Education level */}
              {step===3 && card(<>
                <SectionHeader icon={GraduationCap} title="Education Level" />
                <p className="text-foreground/60 mb-6">Your highest or current qualification.</p>
                <div className="space-y-3">
                  {educationLevels.map(lvl => <OptionCard key={lvl.id} selected={eduLevel===lvl.id} onClick={()=>setEdu(lvl.id)} icon={lvl.icon} title={lvl.label} />)}
                </div>
                <Btns onBack={goBack} onNext={goNext} disabled={!eduLevel} />
              </>)}

              {/* STEP 4 — Template prefs */}
              {step===4 && card(<>
                <SectionHeader icon={Star} title="Template Preferences" />
                {/* Banner when arriving from dashboard template picker */}
                {searchParams.get("template") && searchParams.get("prefill") !== "1" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl mb-5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: templateOptions.find(t => t.id === selectedTpl)?.accent ?? "#f97316" }}>
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {templateOptions.find(t => t.id === selectedTpl)?.name ?? selectedTpl} template pre-selected ✓
                      </p>
                      <p className="text-xs text-foreground/50">You can change it below or keep going</p>
                    </div>
                  </motion.div>
                )}
                <p className="text-foreground/60 mb-5">Customise how your resume looks — preview updates live →</p>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Photo</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[{id:"with-photo",label:"With Photo",icon:"🖼️",desc:"Profile picture included"},{id:"without-photo",label:"No Photo",icon:"📄",desc:"Clean, ATS-friendly"}].map(o=>(
                    <button key={o.id} onClick={()=>setPhoto(o.id)} className={`p-4 rounded-xl text-left smooth-transition relative ${withPhoto===o.id?"bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary":"card-blur hover:border-primary/40"}`}>
                      <div className="text-xl mb-1.5">{o.icon}</div>
                      <p className="font-semibold text-sm">{o.label}</p>
                      <p className="text-xs text-foreground/50">{o.desc}</p>
                      {withPhoto===o.id && <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Layout</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[{id:"one-col",label:"One Column",icon:"▬",desc:"Classic single-column"},{id:"two-col",label:"Two Columns",icon:"⬛",desc:"Sidebar + main content"}].map(o=>(
                    <button key={o.id} onClick={()=>setCols(o.id)} className={`p-4 rounded-xl text-left smooth-transition relative ${columns===o.id?"bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary":"card-blur hover:border-primary/40"}`}>
                      <div className="text-xl mb-1.5">{o.icon}</div>
                      <p className="font-semibold text-sm">{o.label}</p>
                      <p className="text-xs text-foreground/50">{o.desc}</p>
                      {columns===o.id && <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>

                {/* Selected template — read-only display, chosen from Templates page */}
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Selected Template</p>
                {selectedTpl ? (
                  <div className="flex items-center gap-4 p-4 card-blur rounded-xl border border-primary/30 bg-primary/5 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: templateOptions.find(t => t.id === selectedTpl)?.accent ?? "#f97316" }}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{templateOptions.find(t => t.id === selectedTpl)?.name} Template</p>
                      <p className="text-xs text-foreground/50">Selected from the Templates page ✓</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amber-500 mb-5 card-blur px-4 py-3 rounded-xl">
                    ⚠️ No template selected — <a href="/templates" className="underline font-semibold">go back and pick one</a>
                  </p>
                )}

                <Btns onBack={goBack} onNext={goNext} disabled={!withPhoto||!columns||!selectedTpl} />
              </>)}

              {/* STEP 5 — Personal Info */}
              {step===5 && card(<>
                <SectionHeader icon={User} title="Personal Information" />
                {/* Domain badge */}
                {domainCfg.label !== "General" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4 border border-primary/20">
                    🎯 Tailored for: {domainCfg.label}
                  </div>
                )}
                <p className="text-foreground/60 mb-5">Your contact details and professional headline.</p>

                {/* ── Photo upload (only when user chose "With Photo") ──────── */}
                {withPhoto === "with-photo" && (
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">Profile Photo</p>
                    <div className="flex items-center gap-5">
                      {/* Preview circle */}
                      <div
                        onClick={() => photoInputRef.current?.click()}
                        className="w-20 h-20 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary smooth-transition flex-shrink-0 bg-primary/5 group relative"
                      >
                        {photoDataUrl ? (
                          <img src={photoDataUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-primary/60 group-hover:text-primary smooth-transition">
                            <User className="w-7 h-7" />
                            <span className="text-[9px] font-semibold text-center leading-tight">Click to<br/>upload</span>
                          </div>
                        )}
                        {/* Edit overlay */}
                        {photoDataUrl && (
                          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 smooth-transition flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">Change</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 3 * 1024 * 1024) {
                              alert("Photo must be under 3MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = ev => setPhotoDataUrl(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }}
                        />
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-semibold hover:shadow-lg smooth-transition mb-2"
                        >
                          {photoDataUrl ? "Change Photo" : "Upload Photo"}
                        </button>
                        {photoDataUrl && (
                          <button
                            onClick={() => { setPhotoDataUrl(""); if (photoInputRef.current) photoInputRef.current.value = ""; }}
                            className="ml-2 px-3 py-2 text-sm text-red-400 hover:text-red-500 card-blur rounded-xl smooth-transition"
                          >
                            Remove
                          </button>
                        )}
                        <p className="text-xs text-foreground/40 mt-1">JPG, PNG or WebP · Max 3MB · Square crop recommended</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name *" placeholder="Jane Smith" value={fd.fullName} onChange={v=>setFd(p=>({...p,fullName:v}))} />
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground/80">Job Title *</label>
                      <input
                        type="text"
                        placeholder={domainCfg.jobTitlePlaceholder}
                        value={fd.jobTitle}
                        onChange={e=>setFd(p=>({...p,jobTitle:e.target.value}))}
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition text-sm"
                        list="job-title-suggestions"
                      />
                      <datalist id="job-title-suggestions">
                        {domainCfg.jobTitleSuggestions.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email *" placeholder="jane@email.com" value={fd.email} onChange={v=>setFd(p=>({...p,email:v}))} type="email" />
                    <Field label="Phone" placeholder="+1 (555) 000-0000" value={fd.phone} onChange={v=>setFd(p=>({...p,phone:v}))} type="tel" />
                  </div>
                  <Field label="Location" placeholder="City, Country" value={fd.location} onChange={v=>setFd(p=>({...p,location:v}))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="LinkedIn URL" placeholder="linkedin.com/in/..." value={fd.linkedin} onChange={v=>setFd(p=>({...p,linkedin:v}))} />
                    <Field label="GitHub / Portfolio" placeholder="github.com/..." value={fd.github} onChange={v=>setFd(p=>({...p,github:v}))} />
                  </div>
                  <Field label="Website" placeholder="https://yoursite.com" value={fd.website} onChange={v=>setFd(p=>({...p,website:v}))} />
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground/80">Professional Summary</label>
                    <textarea
                      rows={4}
                      placeholder={domainCfg.summaryPlaceholder}
                      value={fd.summary}
                      onChange={e=>setFd(p=>({...p,summary:e.target.value}))}
                      className="w-full px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition text-sm resize-none"
                    />
                    {/* Domain-specific summary examples */}
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs font-semibold text-foreground/40 uppercase tracking-widest">Example summaries for {domainCfg.label}:</p>
                      {domainCfg.summaryExamples.map((ex, i) => (
                        <button key={i} type="button"
                          onClick={() => setFd(p => ({...p, summary: ex}))}
                          className="w-full text-left text-xs p-2.5 card-blur rounded-lg hover:border-primary/40 smooth-transition text-foreground/60 hover:text-foreground leading-relaxed"
                        >
                          <span className="text-primary font-bold mr-1">Use →</span>{ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Btns onBack={goBack} onNext={goNext} disabled={!fd.fullName||!fd.email} />
              </>)}

              {/* STEP 6 — Work History */}
              {step===6 && card(<>
                <SectionHeader icon={Briefcase} title="Work History" />
                <p className="text-foreground/60 mb-5">Add your most recent roles first.</p>
                <div className="space-y-5">
                  {workList.map((w,i)=>(
                    <div key={w.id} className="card-blur p-5 rounded-xl space-y-3 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Position {i+1}</span>
                        {workList.length > 1 && <button onClick={()=>setWork(prev=>prev.filter(x=>x.id!==w.id))} className="text-red-400 hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Company" placeholder="Company Name" value={w.company} onChange={v=>setWork(p=>p.map(x=>x.id===w.id?{...x,company:v}:x))} />
                        <Field label="Position / Title" placeholder="e.g. Senior Developer" value={w.position} onChange={v=>setWork(p=>p.map(x=>x.id===w.id?{...x,position:v}:x))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Start Date" placeholder="Jan 2020" value={w.startDate} onChange={v=>setWork(p=>p.map(x=>x.id===w.id?{...x,startDate:v}:x))} />
                        <Field label="End Date" placeholder={w.current?"Present":"Dec 2023"} value={w.current?"Present":w.endDate} onChange={v=>setWork(p=>p.map(x=>x.id===w.id?{...x,endDate:v}:x))} />
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={w.current} onChange={e=>setWork(p=>p.map(x=>x.id===w.id?{...x,current:e.target.checked}:x))} className="accent-primary" />
                        <span className="text-foreground/70">I currently work here</span>
                      </label>
                      <Field label="Job Description" placeholder={domainCfg.workDescriptionPlaceholder} value={w.description} onChange={v=>setWork(p=>p.map(x=>x.id===w.id?{...x,description:v}:x))} rows={3} />
                      <Field label="Key Achievements" placeholder="• Increased revenue by 30%&#10;• Led a team of 8 engineers" value={w.achievements} onChange={v=>setWork(p=>p.map(x=>x.id===w.id?{...x,achievements:v}:x))} rows={3} />
                    </div>
                  ))}
                  <AddBtn onClick={()=>setWork(p=>[...p,{id:`w${Date.now()}`,company:"",position:"",startDate:"",endDate:"",current:false,description:"",achievements:""}])} label="Add Another Position" />
                </div>
                <Btns onBack={goBack} onNext={goNext} />
              </>)}

              {/* STEP 7 — Education Details */}
              {step===7 && card(<>
                <SectionHeader icon={GraduationCap} title="Education Details" />
                <p className="text-foreground/60 mb-5">Add your degrees, diplomas, and courses.</p>
                <div className="space-y-5">
                  {eduList.map((e,i)=>(
                    <div key={e.id} className="card-blur p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Education {i+1}</span>
                        {eduList.length > 1 && <button onClick={()=>setEduList(prev=>prev.filter(x=>x.id!==e.id))} className="text-red-400 hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Institution" placeholder="University Name" value={e.institution} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,institution:v}:x))} />
                        <Field label="Degree" placeholder="e.g. Bachelor of Science" value={e.degree} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,degree:v}:x))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Field of Study" placeholder="Computer Science" value={e.field} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,field:v}:x))} />
                        <Field label="GPA / Grade" placeholder="3.8 / 4.0" value={e.gpa} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,gpa:v}:x))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Start Year" placeholder="2018" value={e.startYear} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,startYear:v}:x))} />
                        <Field label="End Year" placeholder="2022" value={e.endYear} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,endYear:v}:x))} />
                      </div>
                      <Field label="Activities & Societies" placeholder="Student Council, Debate Club, Hackathon finalist…" value={e.activities} onChange={v=>setEduList(p=>p.map(x=>x.id===e.id?{...x,activities:v}:x))} rows={2} />
                    </div>
                  ))}
                  <AddBtn onClick={()=>setEduList(p=>[...p,{id:`e${Date.now()}`,institution:"",degree:"",field:"",startYear:"",endYear:"",gpa:"",activities:""}])} label="Add Another Education" />
                </div>
                <Btns onBack={goBack} onNext={goNext} />
              </>)}

              {/* STEP 8 — Skills & Languages */}
              {step===8 && card(<>
                <SectionHeader icon={Code} title="Skills & Languages" />
                {domainCfg.label !== "General" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4 border border-primary/20">
                    🎯 Suggestions for: {domainCfg.label}
                  </div>
                )}
                <p className="text-foreground/60 mb-4">Click any suggestion to instantly add it, or type your own.</p>

                {/* Skill chips */}
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Suggested Skills — click to add</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {domainCfg.skillSuggestions.map(s=>(
                    <button key={s} type="button"
                      onClick={()=>setSkills(p=>{
                        if(p.includes(s)) return p.filter(x=>x!==s);
                        const ei=p.findIndex(x=>!x.trim());
                        if(ei>=0){const n=[...p];n[ei]=s;return n;}
                        return [...p,s];
                      })}
                      className={`px-3 py-1 rounded-full text-xs font-semibold smooth-transition border ${skills.includes(s)?"bg-primary text-white border-primary":"bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"}`}
                    >{skills.includes(s)?"✓ ":"+ "}{s}</button>
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Your Skills</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {skills.map((s,i)=>(
                    <input key={i} placeholder={domainCfg.skillSuggestions[i]?`e.g. ${domainCfg.skillSuggestions[i]}`:`Skill ${i+1}`} value={s} onChange={e=>setSkills(p=>{const n=[...p];n[i]=e.target.value;return n;})} className="px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition text-sm" />
                  ))}
                </div>
                <AddBtn onClick={()=>setSkills(p=>[...p,"",""])} label="Add More Skills" />

                {/* Soft skill chips */}
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 mt-6">Suggested Soft Skills</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {domainCfg.softSkillSuggestions.map(s=>(
                    <button key={s} type="button"
                      onClick={()=>setSoftSkills(p=>{
                        if(p.includes(s)) return p.filter(x=>x!==s);
                        const ei=p.findIndex(x=>!x.trim());
                        if(ei>=0){const n=[...p];n[ei]=s;return n;}
                        return [...p,s];
                      })}
                      className={`px-3 py-1 rounded-full text-xs font-semibold smooth-transition border ${softSkills.includes(s)?"bg-secondary text-white border-secondary":"bg-foreground/8 text-foreground/60 border-foreground/20 hover:border-primary/40"}`}
                    >{softSkills.includes(s)?"✓ ":"+ "}{s}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {softSkills.map((s,i)=>(
                    <input key={i} placeholder={domainCfg.softSkillSuggestions[i]??`e.g. Leadership`} value={s} onChange={e=>setSoftSkills(p=>{const n=[...p];n[i]=e.target.value;return n;})} className="px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition text-sm" />
                  ))}
                </div>
                <AddBtn onClick={()=>setSoftSkills(p=>[...p,"",""])} label="Add More Soft Skills" />

                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 mt-6">Languages</p>
                <div className="space-y-3 mb-4">
                  {languages.map((l,i)=>(
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <input placeholder="Language (e.g. English)" value={l.lang} onChange={e=>setLangs(p=>{const n=[...p];n[i]={...n[i],lang:e.target.value};return n;})} className="px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary smooth-transition text-sm" />
                      <select value={l.level} onChange={e=>setLangs(p=>{const n=[...p];n[i]={...n[i],level:e.target.value};return n;})} className="px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary smooth-transition text-sm">
                        <option value="">Proficiency</option>
                        <option>Native</option><option>Fluent</option><option>Advanced (C1)</option><option>Upper Intermediate (B2)</option><option>Intermediate (B1)</option><option>Basic (A2)</option>
                      </select>
                    </div>
                  ))}
                </div>
                <AddBtn onClick={()=>setLangs(p=>[...p,{lang:"",level:""}])} label="Add Language" />

                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 mt-6">Hobbies & Interests</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {domainCfg.interestSuggestions.map(s=>(
                    <button key={s} type="button"
                      onClick={()=>setInterests(p=>{
                        if(p.includes(s)) return p.filter(x=>x!==s);
                        const ei=p.findIndex(x=>!x.trim());
                        if(ei>=0){const n=[...p];n[ei]=s;return n;}
                        return [...p,s];
                      })}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-foreground/5 text-foreground/60 border border-foreground/15 hover:border-primary/40 smooth-transition"
                    >+ {s}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {interests.map((s,i)=>(
                    <input key={i} placeholder={domainCfg.interestSuggestions[i]??`e.g. Photography`} value={s} onChange={e=>setInterests(p=>{const n=[...p];n[i]=e.target.value;return n;})} className="px-4 py-3 bg-foreground/5 border border-foreground/15 rounded-lg focus:outline-none focus:border-primary smooth-transition text-sm" />
                  ))}
                </div>
                <Btns onBack={goBack} onNext={goNext} />
              </>)}

              {/* STEP 9 — Projects */}
              {step===9 && card(<>
                <SectionHeader icon={Globe} title="Projects" />
                {domainCfg.label !== "General" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4 border border-primary/20">
                    🎯 {domainCfg.label} projects
                  </div>
                )}
                <p className="text-foreground/60 mb-5">Showcase your best personal, academic, or professional projects.</p>
                <div className="space-y-5">
                  {projects.map((p,i)=>(
                    <div key={p.id} className="card-blur p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Project {i+1}</span>
                        {projects.length > 1 && <button onClick={()=>setProjects(prev=>prev.filter(x=>x.id!==p.id))} className="text-red-400 hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Project Name" placeholder="My Awesome App" value={p.name} onChange={v=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,name:v}:x))} />
                        <Field label="Your Role" placeholder="Lead Developer" value={p.role} onChange={v=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,role:v}:x))} />
                      </div>
                      <Field label="Technologies Used" placeholder="React, Node.js, PostgreSQL, AWS…" value={p.tech} onChange={v=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,tech:v}:x))} />
                      <Field label="Description & Impact" placeholder={domainCfg.projectPlaceholder} value={p.description} onChange={v=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,description:v}:x))} rows={3} />
                      <Field label="Project Link (optional)" placeholder="https://github.com/..." value={p.link} onChange={v=>setProjects(prev=>prev.map(x=>x.id===p.id?{...x,link:v}:x))} />
                    </div>
                  ))}
                  <AddBtn onClick={()=>setProjects(p=>[...p,{id:`p${Date.now()}`,name:"",role:"",tech:"",description:"",link:""}])} label="Add Another Project" />
                </div>
                <Btns onBack={goBack} onNext={goNext} />
              </>)}

              {/* STEP 10 — Certifications */}
              {step===10 && card(<>
                <SectionHeader icon={Award} title="Certifications" />
                <p className="text-foreground/60 mb-4">Professional certifications, licences, and online courses.</p>
                {/* Domain cert suggestions */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {domainCfg.certificationSuggestions.map(s=>(
                    <button key={s} type="button"
                      onClick={()=>setCerts(p=>{
                        if(p.some(c=>c.name===s)) return p;
                        const ei=p.findIndex(c=>!c.name.trim());
                        if(ei>=0){const n=[...p];n[ei]={...n[ei],name:s};return n;}
                        return [...p,{id:`c${Date.now()}`,name:s,issuer:"",date:"",credentialId:""}];
                      })}
                      className={`px-3 py-1 rounded-full text-xs font-semibold smooth-transition border ${certs.some(c=>c.name===s)?"bg-primary text-white border-primary":"bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"}`}
                    >{certs.some(c=>c.name===s)?"✓ ":"+ "}{s}</button>
                  ))}
                </div>
                <div className="space-y-5">
                  {certs.map((c,i)=>(
                    <div key={c.id} className="card-blur p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Certification {i+1}</span>
                        {certs.length > 1 && <button onClick={()=>setCerts(prev=>prev.filter(x=>x.id!==c.id))} className="text-red-400 hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Certification Name" placeholder={domainCfg.certificationSuggestions[0]??`e.g. AWS Solutions Architect`} value={c.name} onChange={v=>setCerts(p=>p.map(x=>x.id===c.id?{...x,name:v}:x))} />
                        <Field label="Issuing Organisation" placeholder="e.g. Amazon Web Services" value={c.issuer} onChange={v=>setCerts(p=>p.map(x=>x.id===c.id?{...x,issuer:v}:x))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Issue Date" placeholder="March 2023" value={c.date} onChange={v=>setCerts(p=>p.map(x=>x.id===c.id?{...x,date:v}:x))} />
                        <Field label="Credential ID (optional)" placeholder="ABC-12345" value={c.credentialId} onChange={v=>setCerts(p=>p.map(x=>x.id===c.id?{...x,credentialId:v}:x))} />
                      </div>
                    </div>
                  ))}
                  <AddBtn onClick={()=>setCerts(p=>[...p,{id:`c${Date.now()}`,name:"",issuer:"",date:"",credentialId:""}])} label="Add Certification" />
                </div>
                <Btns onBack={goBack} onNext={goNext} />
              </>)}

              {/* STEP 11 — Achievements */}
              {step===11 && card(<>
                <SectionHeader icon={Star} title="Achievements & Awards" />
                <p className="text-foreground/60 mb-5">Awards, honours, publications, and notable accomplishments.</p>
                <div className="space-y-5">
                  {achievements.map((a,i)=>(
                    <div key={a.id} className="card-blur p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Achievement {i+1}</span>
                        {achievements.length > 1 && <button onClick={()=>setAchievements(prev=>prev.filter(x=>x.id!==a.id))} className="text-red-400 hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Title" placeholder={domainCfg.achievementPlaceholder.split("…")[0] || "e.g. Employee of the Year"} value={a.title} onChange={v=>setAchievements(p=>p.map(x=>x.id===a.id?{...x,title:v}:x))} />
                        <Field label="Year" placeholder="2023" value={a.year} onChange={v=>setAchievements(p=>p.map(x=>x.id===a.id?{...x,year:v}:x))} />
                      </div>
                      <Field label="Description" placeholder="Brief context and impact of this achievement…" value={a.description} onChange={v=>setAchievements(p=>p.map(x=>x.id===a.id?{...x,description:v}:x))} rows={2} />
                    </div>
                  ))}
                  <AddBtn onClick={()=>setAchievements(p=>[...p,{id:`a${Date.now()}`,title:"",description:"",year:""}])} label="Add Achievement" />
                </div>
                <Btns onBack={goBack} onNext={goNext} />
              </>)}

              {/* STEP 12 — References */}
              {step===12 && card(<>
                <SectionHeader icon={Heart} title="References" />
                <p className="text-foreground/60 mb-5">Professional references who can vouch for your work.</p>
                <div className="space-y-5">
                  {refs.map((r,i)=>(
                    <div key={r.id} className="card-blur p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Reference {i+1}</span>
                        {refs.length > 1 && <button onClick={()=>setRefs(prev=>prev.filter(x=>x.id!==r.id))} className="text-red-400 hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Full Name" placeholder="John Doe" value={r.name} onChange={v=>setRefs(p=>p.map(x=>x.id===r.id?{...x,name:v}:x))} />
                        <Field label="Job Title" placeholder="CTO at Tech Corp" value={r.title} onChange={v=>setRefs(p=>p.map(x=>x.id===r.id?{...x,title:v}:x))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Company" placeholder="Company Name" value={r.company} onChange={v=>setRefs(p=>p.map(x=>x.id===r.id?{...x,company:v}:x))} />
                        <Field label="Email" placeholder="john@company.com" value={r.email} onChange={v=>setRefs(p=>p.map(x=>x.id===r.id?{...x,email:v}:x))} />
                      </div>
                      <Field label="Phone (optional)" placeholder="+1 (555) 000-0000" value={r.phone} onChange={v=>setRefs(p=>p.map(x=>x.id===r.id?{...x,phone:v}:x))} />
                    </div>
                  ))}
                  <AddBtn onClick={()=>setRefs(p=>[...p,{id:`r${Date.now()}`,name:"",title:"",company:"",email:"",phone:""}])} label="Add Reference" />
                </div>
                <Btns onBack={goBack} onNext={goNext} loading={saveStatus==="saving"} label="Save & Get AI Suggestions" />
              </>)}

              {/* STEP 13 — Done */}
              {step===13 && card(
                <div className="text-center py-4">
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300}} className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/30">
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold gradient-text mb-2">Resume Complete!</h1>
                  <p className="text-foreground/60 mb-4">Your <span className="font-semibold text-foreground">{tpl?.name ?? "custom"}</span> resume is built and ready.</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {[tpl?.name, twoCol?"Two Columns":"One Column", hasPhoto?"With Photo":"No Photo", educationLevels.find(e=>e.id===eduLevel)?.label, `${workList.filter(w=>w.company).length} work entries`, `${skills.filter(Boolean).length} skills`].filter(Boolean).map(tag=>(
                      <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <SaveBtn full />
                    <button onClick={downloadPdf} className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary/40 smooth-transition flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download Resume
                    </button>
                    <Link to="/dashboard" className="w-full py-3 card-blur font-semibold rounded-xl hover:bg-foreground/10 smooth-transition flex items-center justify-center">
                      Go to Dashboard
                    </Link>
                  </div>
                  <button onClick={goBack} className="mt-3 text-sm text-foreground/50 hover:text-foreground smooth-transition">
                    <ArrowLeft className="w-3 h-3 inline mr-1" />Edit
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Live Preview ── */}
            {showRight && (
              <div className="sticky top-24 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground/70">
                    <Eye className="w-4 h-4 text-primary" /> Live Preview
                  </div>
                  <div className="flex items-center gap-2">
                    {saveStatus==="saved" && <motion.span initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-1 text-xs text-green-500 font-semibold"><Cloud className="w-3 h-3" />{isAuthenticated?"Cloud saved":"Locally saved"}</motion.span>}
                    <button onClick={()=>setShowPreview(v=>!v)} className="text-xs text-foreground/50 hover:text-foreground smooth-transition lg:hidden">{showPreview?"Hide":"Show"}</button>
                  </div>
                </div>

                {/* Live Resume Strength Meter */}
                <ResumeStrengthMeter
                  fd={fd}
                  workList={workList}
                  skills={skills}
                  eduList={eduList}
                  projects={projects}
                  certs={certs}
                />

                <div className={`lg:block ${showPreview?"block":"hidden lg:block"}`}>
                  <div ref={previewRef}>
                    <LivePreview fd={fd} tpl={effectiveTpl} twoCol={twoCol} withPhoto={hasPhoto} eduLevel={eduLevel} experience={experience} workList={workList} skills={skills.filter(Boolean)} customFont={customFont} />
                  </div>
                </div>
                <div className="space-y-2">
                  <SaveBtn full />
                  {(step >= 5) && (
                    <button onClick={downloadPdf} className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/40 smooth-transition flex items-center justify-center gap-2 text-sm">
                      <Download className="w-4 h-4" /> Download Resume
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function LivePreview({ fd, tpl, twoCol, withPhoto, eduLevel, experience, workList, skills, customFont }: {
  fd: PersonalInfo;
  tpl: typeof templateOptions[0] | undefined;
  twoCol: boolean; withPhoto: boolean;
  eduLevel: string; experience: string;
  workList: WorkEntry[];
  skills: string[];
  customFont?: string | null;
}) {
  const accent   = tpl?.accent ?? "#f97316";
  const bg       = tpl?.bg     ?? "#fff7ed";
  const font     = customFont  ?? "Georgia, serif";
  const name     = fd.fullName || "Your Name";
  const title    = fd.jobTitle  || "Job Title";
  const email    = fd.email     || "email@example.com";
  const phone    = fd.phone     || "+1 (555) 000-0000";
  const loc      = fd.location  || "City, Country";
  const summary  = fd.summary   || "Your professional summary will appear here as you type.";
  const eduLabel = educationLevels.find(e => e.id === eduLevel)?.label ?? "";

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 text-[10.5px] leading-snug" style={{ background: bg, fontFamily: font, color:"#1a1a2e" }}>
      <div className="px-5 py-4 text-white" style={{ background: accent }}>
        <div className="flex items-start gap-3">
          {withPhoto && <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 border-2 border-white/40"><User className="w-5 h-5 text-white/70" /></div>}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{name}</p>
            <p className="text-white/75">{title}</p>
            <div className="flex flex-wrap gap-x-3 mt-1 text-white/60">
              <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{email}</span>
              <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{loc}</span>
            </div>
            {(fd.linkedin || fd.github || fd.website) && (
              <div className="flex flex-wrap gap-x-3 mt-0.5 text-white/50">
                {fd.linkedin && <span className="flex items-center gap-1"><Link2 className="w-2 h-2" />{fd.linkedin}</span>}
                {fd.github   && <span className="flex items-center gap-1"><Globe className="w-2 h-2" />{fd.github}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`p-4 ${twoCol ? "grid grid-cols-[5fr_8fr] gap-4" : "space-y-3"}`}>
        {twoCol ? (
          <>
            <div className="space-y-3 pr-3 border-r border-gray-200">
              {skills.length > 0 && <PSection label="Skills" accent={accent}>
                <div className="flex flex-wrap gap-1">{skills.slice(0,8).map(s=><span key={s} className="px-1.5 py-0.5 rounded text-white text-[8.5px]" style={{background:accent}}>{s}</span>)}</div>
              </PSection>}
              {eduLabel && <PSection label="Education" accent={accent}><p className="font-semibold">{eduLabel}</p></PSection>}
              <PSection label="Languages" accent={accent}><p className="text-gray-600">English · Native</p></PSection>
            </div>
            <div className="space-y-3">
              <PSection label="Summary" accent={accent}><p className="text-gray-700 leading-relaxed">{summary}</p></PSection>
              <PSection label="Experience" accent={accent}>
                {workList.filter(w=>w.company||w.position).length > 0
                  ? workList.filter(w=>w.company||w.position).map(w=>(
                    <div key={w.id} className="mb-2">
                      <div className="flex justify-between"><p className="font-semibold">{w.position||"Position"}</p><p className="text-gray-500 text-[9px]">{w.startDate}{w.startDate&&(w.current?"–Present":w.endDate?`–${w.endDate}`:"")}</p></div>
                      <p className="text-gray-500">{w.company}</p>
                      {w.description && <p className="text-gray-600 mt-0.5 line-clamp-2">{w.description}</p>}
                    </div>
                  ))
                  : <p className="text-gray-400 italic">{experience==="no-experience"?"No prior experience.":"Add your work history above."}</p>
                }
              </PSection>
            </div>
          </>
        ) : (
          <>
            <PSection label="Summary" accent={accent}><p className="text-gray-700 leading-relaxed">{summary}</p></PSection>
            <PSection label="Experience" accent={accent}>
              {workList.filter(w=>w.company||w.position).length > 0
                ? workList.filter(w=>w.company||w.position).map(w=>(
                  <div key={w.id} className="mb-2">
                    <div className="flex justify-between"><p className="font-semibold">{w.position||"Position"}</p><p className="text-gray-500 text-[9px]">{w.startDate}{w.startDate&&(w.current?"–Present":w.endDate?`–${w.endDate}`:"")}</p></div>
                    <p className="text-gray-500">{w.company}</p>
                    {w.description && <p className="text-gray-600 mt-0.5 line-clamp-2">{w.description}</p>}
                  </div>
                ))
                : <p className="text-gray-400 italic">{experience==="no-experience"?"No prior experience.":"Add your work history above."}</p>
              }
            </PSection>
            {eduLabel && <PSection label="Education" accent={accent}><p className="font-semibold">{eduLabel}</p></PSection>}
            {skills.length > 0 && <PSection label="Skills" accent={accent}>
              <div className="flex flex-wrap gap-1">{skills.slice(0,10).map(s=><span key={s} className="px-2 py-0.5 rounded-full text-white text-[8.5px]" style={{background:accent}}>{s}</span>)}</div>
            </PSection>}
          </>
        )}
      </div>
    </div>
  );
}

function PSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[8.5px] font-bold uppercase tracking-widest mb-1 pb-0.5 border-b" style={{ color: accent, borderColor: accent+"50" }}>{label}</p>
      {children}
    </div>
  );
}
