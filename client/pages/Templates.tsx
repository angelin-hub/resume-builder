import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Sparkles, Palette, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";

// ─── Domain label map ─────────────────────────────────────────────────────────
const domainLabels: Record<string, string> = {
  it: "IT & Software Development",
  nursing: "Nursing & Healthcare",
  design: "UI/UX & Graphic Design",
  business: "Business & Management",
  finance: "Finance & Accounting",
  law: "Law & Legal",
  civil: "Civil Engineering",
  mechanical: "Mechanical Engineering",
  electrical: "Electrical & Electronics",
  education: "Education & Teaching",
  marketing: "Marketing & Sales",
  media: "Media & Communication",
  hospitality: "Hospitality & Tourism",
  science: "Science & Research",
  logistics: "Logistics & Supply Chain",
  hr: "Human Resources",
  aviation: "Aviation",
  arts: "Arts & Creative",
  retail: "Retail & Customer Service",
  other: "Others",
};

// ─── Template data ────────────────────────────────────────────────────────────
const allTemplates = [
  {
    id: "classic",
    name: "Classic",
    description: "Timeless professional design trusted by recruiters worldwide",
    tag: "Most Popular",
    tagColor: "from-amber-500 to-orange-500",
    color: "from-amber-500 to-orange-500",
    accent: "#f97316",
    headerBg: "#f97316",
    twoCol: false,
    domains: ["business", "law", "finance", "hr", "other"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold, contemporary layout with striking accent colors",
    tag: "Trending",
    tagColor: "from-orange-500 to-amber-400",
    color: "from-orange-500 to-amber-400",
    accent: "#f97316",
    headerBg: "#f97316",
    twoCol: false,
    domains: ["it", "design", "marketing", "media", "arts"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean whitespace-focused design that lets your work speak",
    tag: "ATS Friendly",
    tagColor: "from-gray-400 to-gray-500",
    color: "from-gray-500 to-gray-600",
    accent: "#6b7280",
    headerBg: "#6b7280",
    twoCol: false,
    domains: ["it", "science", "education", "logistics", "other"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with a vibrant two-column creative layout",
    tag: "Eye-catching",
    tagColor: "from-emerald-500 to-teal-500",
    color: "from-emerald-600 to-teal-600",
    accent: "#059669",
    headerBg: "#059669",
    twoCol: true,
    domains: ["design", "arts", "media", "marketing", "hospitality"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium sophisticated layout for senior-level professionals",
    tag: "Premium",
    tagColor: "from-stone-500 to-gray-600",
    color: "from-stone-600 to-gray-700",
    accent: "#57534e",
    headerBg: "#57534e",
    twoCol: false,
    domains: ["business", "finance", "law", "aviation", "hr"],
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Purpose-built to pass applicant tracking systems",
    tag: "Best for Jobs",
    tagColor: "from-rose-500 to-pink-500",
    color: "from-pink-600 to-red-600",
    accent: "#db2777",
    headerBg: "#db2777",
    twoCol: false,
    domains: ["it", "nursing", "civil", "mechanical", "electrical"],
  },
  {
    id: "sidebar",
    name: "Sidebar Pro",
    description: "Two-column layout with a rich skills sidebar panel",
    tag: "New",
    tagColor: "from-amber-500 to-orange-500",
    color: "from-amber-500 to-orange-500",
    accent: "#d97706",
    headerBg: "#d97706",
    twoCol: true,
    domains: ["it", "design", "science", "education", "logistics"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Clean and trustworthy layout designed for medical roles",
    tag: "Specialised",
    tagColor: "from-teal-500 to-green-500",
    color: "from-teal-600 to-green-600",
    accent: "#0d9488",
    headerBg: "#0d9488",
    twoCol: false,
    domains: ["nursing", "science", "education", "other"],
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Structured corporate format preferred by large enterprises",
    tag: "Enterprise",
    tagColor: "from-slate-500 to-zinc-500",
    color: "from-slate-600 to-zinc-600",
    accent: "#475569",
    headerBg: "#475569",
    twoCol: false,
    domains: ["business", "finance", "law", "logistics", "hr"],
  },
];

// ─── Rich SVG resume preview ──────────────────────────────────────────────────
function ResumePreview({
  accent,
  twoCol,
}: {
  accent: string;
  twoCol: boolean;
}) {
  return (
    <svg
      viewBox="0 0 320 420"
      className="w-full h-full drop-shadow-sm"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Paper */}
      <rect width="320" height="420" fill="white" rx="4" />

      {twoCol ? (
        <>
          {/* Sidebar */}
          <rect width="100" height="420" fill={accent} opacity="0.12" />
          {/* Sidebar accent bar */}
          <rect width="4" height="420" fill={accent} opacity="0.7" />

          {/* Header area */}
          <rect x="110" y="20" width="180" height="8" rx="2" fill={accent} opacity="0.9" />
          <rect x="110" y="34" width="120" height="5" rx="2" fill="#ccc" opacity="0.7" />
          <rect x="110" y="44" width="90" height="4" rx="2" fill="#ccc" opacity="0.4" />

          {/* Sidebar sections */}
          <rect x="12" y="30" width="60" height="5" rx="2" fill={accent} opacity="0.8" />
          {[42, 52, 62, 72, 82].map((y) => (
            <rect key={y} x="12" y={y} width="55" height="3" rx="1" fill="#999" opacity="0.35" />
          ))}
          <rect x="12" y="100" width="60" height="5" rx="2" fill={accent} opacity="0.8" />
          {[112, 122, 132].map((y) => (
            <rect key={y} x="12" y={y} width="55" height="3" rx="1" fill="#999" opacity="0.35" />
          ))}
          <rect x="12" y="152" width="60" height="5" rx="2" fill={accent} opacity="0.8" />
          {[50, 60, 68].map((_, i) => (
            <rect key={i} x="12" y={165 + i * 18} width="70" height="14" rx="6" fill={accent} opacity="0.2" />
          ))}

          {/* Main content sections */}
          <line x1="110" y1="68" x2="300" y2="68" stroke={accent} strokeWidth="1.5" opacity="0.5" />
          <rect x="110" y="74" width="80" height="5" rx="2" fill={accent} opacity="0.7" />
          {[84, 93, 102, 111].map((y) => (
            <rect key={y} x="110" y={y} width={y % 2 === 0 ? 175 : 150} height="3" rx="1" fill="#ccc" opacity="0.5" />
          ))}

          <line x1="110" y1="125" x2="300" y2="125" stroke={accent} strokeWidth="1.5" opacity="0.5" />
          <rect x="110" y="131" width="90" height="5" rx="2" fill={accent} opacity="0.7" />
          {[141, 150, 159, 168, 177].map((y) => (
            <rect key={y} x="110" y={y} width={y % 3 === 0 ? 180 : 140} height="3" rx="1" fill="#ccc" opacity="0.5" />
          ))}
        </>
      ) : (
        <>
          {/* Header bar */}
          <rect width="320" height="70" fill={accent} opacity="0.9" rx="4" />
          <rect width="320" height="70" fill="white" opacity="0.05" />

          {/* Profile avatar circle */}
          <circle cx="36" cy="35" r="22" fill="white" opacity="0.2" />

          {/* Name + title in header */}
          <rect x="68" y="18" width="130" height="8" rx="2" fill="white" opacity="0.9" />
          <rect x="68" y="32" width="95" height="5" rx="2" fill="white" opacity="0.6" />
          <rect x="68" y="43" width="160" height="3" rx="1" fill="white" opacity="0.35" />

          {/* Contact row */}
          <rect x="20" y="82" width="280" height="1" fill={accent} opacity="0.3" />
          <rect x="20" y="88" width="60" height="3" rx="1" fill="#bbb" opacity="0.5" />
          <rect x="100" y="88" width="60" height="3" rx="1" fill="#bbb" opacity="0.5" />
          <rect x="180" y="88" width="60" height="3" rx="1" fill="#bbb" opacity="0.5" />

          {/* Summary section */}
          <rect x="20" y="104" width="80" height="5" rx="2" fill={accent} opacity="0.8" />
          <rect x="20" y="100" width="280" height="1" fill={accent} opacity="0.2" />
          {[114, 123, 132].map((y) => (
            <rect key={y} x="20" y={y} width={y === 132 ? 210 : 280} height="3" rx="1" fill="#ccc" opacity="0.55" />
          ))}

          {/* Experience section */}
          <rect x="20" y="150" width="100" height="5" rx="2" fill={accent} opacity="0.8" />
          <rect x="20" y="146" width="280" height="1" fill={accent} opacity="0.2" />
          <rect x="20" y="162" width="110" height="4" rx="2" fill="#555" opacity="0.6" />
          <rect x="200" y="162" width="60" height="4" rx="2" fill={accent} opacity="0.4" />
          {[172, 181, 190, 199].map((y) => (
            <rect key={y} x="20" y={y} width={y % 2 === 0 ? 260 : 220} height="3" rx="1" fill="#ccc" opacity="0.5" />
          ))}

          <rect x="20" y="215" width="110" height="4" rx="2" fill="#555" opacity="0.6" />
          <rect x="200" y="215" width="60" height="4" rx="2" fill={accent} opacity="0.4" />
          {[225, 234, 243].map((y) => (
            <rect key={y} x="20" y={y} width={y === 243 ? 190 : 250} height="3" rx="1" fill="#ccc" opacity="0.5" />
          ))}

          {/* Skills section */}
          <rect x="20" y="265" width="60" height="5" rx="2" fill={accent} opacity="0.8" />
          <rect x="20" y="261" width="280" height="1" fill={accent} opacity="0.2" />
          <div />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={20 + i * 56}
              y="276"
              width="48"
              height="16"
              rx="8"
              fill={accent}
              opacity="0.15"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={20 + i * 56}
              y="300"
              width="48"
              height="16"
              rx="8"
              fill={accent}
              opacity="0.1"
            />
          ))}
        </>
      )}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Templates() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const domain = searchParams.get("domain");
  const domainLabel = domain ? domainLabels[domain] : null;

  const [selected, setSelected] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  // Customization options
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [customFont, setCustomFont] = useState<string>("Georgia, serif");

  const ACCENT_COLORS = [
    { label: "Orange",  value: "#f97316" },
    { label: "Amber",   value: "#d97706" },
    { label: "Teal",    value: "#0d9488" },
    { label: "Blue",    value: "#3b82f6" },
    { label: "Violet",  value: "#7c3aed" },
    { label: "Rose",    value: "#e11d48" },
    { label: "Slate",   value: "#475569" },
    { label: "Black",   value: "#1a1a1a" },
  ];

  const FONTS = [
    { label: "Classic (Georgia)",   value: "Georgia, serif" },
    { label: "Modern (Inter)",      value: "Inter, sans-serif" },
    { label: "Elegant (Garamond)",  value: "EB Garamond, serif" },
    { label: "Clean (Helvetica)",   value: "Helvetica, Arial, sans-serif" },
  ];

  // Effective accent = custom override or template default
  const effectiveAccent = customColor ?? selectedTemplate?.accent ?? "#f97316";

  // Filter templates by domain — show relevant ones first, then others
  const relevant = domain
    ? allTemplates.filter((t) => t.domains.includes(domain))
    : allTemplates;
  const rest = domain
    ? allTemplates.filter((t) => !t.domains.includes(domain))
    : [];

  const displayTemplates = [...relevant, ...rest];
  const selectedTemplate = displayTemplates.find((t) => t.id === selected);

  const handleUse = () => {
    if (selected) {
      const params = new URLSearchParams({
        template: selected,
        domain: domain ?? "",
        ...(customColor ? { color: customColor } : {}),
        ...(customFont !== "Georgia, serif" ? { font: customFont } : {}),
      });
      navigate(`/create-resume?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <section className="relative z-10 pt-32 pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/40 mb-5">
              <Link to="/template-picker" className="hover:text-foreground smooth-transition">
                Career Domain
              </Link>
              <span>›</span>
              <span className="text-foreground font-medium">Pick a Template</span>
            </div>

            {domainLabel && (
              <motion.div
                className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-sm font-semibold card-blur"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {domainLabel}
              </motion.div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-4 leading-tight">
              Pick Your Template
            </h1>
            <p className="text-foreground/60 text-lg max-w-xl mx-auto">
              {domainLabel
                ? `${relevant.length} templates curated for ${domainLabel}. Click one to preview, then hit "Use Template".`
                : "Choose a template that best suits your style and role."}
            </p>

            {domainLabel && (
              <Link
                to="/template-picker"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:text-primary/80 smooth-transition"
              >
                <ArrowLeft className="w-4 h-4" /> Change domain
              </Link>
            )}
          </motion.div>

          {/* Recommended label */}
          {domain && relevant.length > 0 && (
            <motion.p
              className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ⭐ Recommended for {domainLabel}
            </motion.p>
          )}

          {/* Template Grid */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {displayTemplates.map((template, index) => {
              const isSelected = selected === template.id;
              const isRecommended = domain ? template.domains.includes(domain) : false;

              return (
                <motion.div
                  key={template.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => setSelected(template.id)}
                  className={`
                    group relative rounded-2xl overflow-hidden cursor-pointer
                    transition-all duration-300
                    ${isSelected
                      ? "ring-2 ring-primary shadow-2xl shadow-primary/20 scale-[1.02]"
                      : "card-blur hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                    }
                    ${!isRecommended && domain ? "opacity-70 hover:opacity-100" : ""}
                  `}
                >
                  {/* Recommended badge */}
                  {isRecommended && domain && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                      ⭐ Recommended
                    </div>
                  )}

                  {/* Tag badge */}
                  <div className={`absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${template.tagColor}`}>
                    {template.tag}
                  </div>

                  {/* Selected checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="absolute top-3 left-3 z-30 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Preview area */}
                  <div className={`
                    relative overflow-hidden transition-all duration-300
                    ${isSelected ? "h-72" : "h-56 group-hover:h-64"}
                  `}
                    style={{ background: `${template.accent}08` }}
                  >
                    <div className="absolute inset-0 p-4">
                      <ResumePreview accent={template.accent} twoCol={template.twoCol} />
                    </div>

                    {/* Overlay on hover/select */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      style={{ background: `linear-gradient(to bottom, transparent 60%, ${template.accent}20)` }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold">{template.name}</h3>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${template.color}`} />
                    </div>
                    <p className="text-foreground/55 text-sm leading-relaxed">{template.description}</p>

                    {/* Layout indicator */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/40"}`}>
                        {template.twoCol ? "Two Column" : "Single Column"}
                      </span>
                    </div>
                  </div>

                  {/* Selected bottom bar */}
                  {isSelected && (
                    <motion.div
                      className={`h-1 w-full bg-gradient-to-r ${template.color}`}
                      layoutId="selectedBar"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* "Other styles" divider when domain is set */}
          {domain && rest.length > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 mt-12 mb-6">
              Other styles
            </p>
          )}
        </div>
      </section>

      {/* Fixed bottom bar — Customize + Use Template */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Customize panel — slides up above the bar */}
            <AnimatePresence>
              {showCustomize && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-background/95 backdrop-blur-xl border-t border-border/30 px-4 sm:px-8 py-5">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">

                      {/* Accent Color */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" /> Accent Color
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* Template default */}
                          <button
                            onClick={() => setCustomColor(null)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold smooth-transition border ${
                              customColor === null
                                ? "border-primary bg-primary/10 text-primary"
                                : "card-blur hover:border-primary/40 text-foreground/60"
                            }`}
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-current" style={{ background: selectedTemplate?.accent }} />
                            Default
                          </button>
                          {ACCENT_COLORS.map(c => (
                            <button
                              key={c.value}
                              onClick={() => setCustomColor(c.value)}
                              title={c.label}
                              className={`w-8 h-8 rounded-full smooth-transition border-2 ${
                                customColor === c.value ? "scale-125 border-foreground" : "border-transparent hover:scale-110"
                              }`}
                              style={{ background: c.value }}
                            />
                          ))}
                          {/* Custom hex input */}
                          <div className="flex items-center gap-1.5 card-blur px-2 py-1 rounded-xl border">
                            <div className="w-4 h-4 rounded-full border border-foreground/20" style={{ background: customColor ?? selectedTemplate?.accent }} />
                            <input
                              type="color"
                              value={customColor ?? selectedTemplate?.accent ?? "#f97316"}
                              onChange={e => setCustomColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 outline-none p-0"
                              title="Custom color"
                            />
                            <span className="text-xs text-foreground/50">{(customColor ?? selectedTemplate?.accent ?? "").toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Font */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3 flex items-center gap-1.5">
                          <span className="font-bold text-sm">Aa</span> Font Style
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {FONTS.map(f => (
                            <button
                              key={f.value}
                              onClick={() => setCustomFont(f.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs smooth-transition border ${
                                customFont === f.value
                                  ? "border-primary bg-primary/10 text-primary font-bold"
                                  : "card-blur hover:border-primary/40 text-foreground/60"
                              }`}
                              style={{ fontFamily: f.value }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live preview of customisation */}
                    <div className="max-w-7xl mx-auto mt-4 flex items-center gap-3">
                      <p className="text-xs text-foreground/40">Preview:</p>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: effectiveAccent + "40", background: effectiveAccent + "10" }}>
                        <div className="w-4 h-4 rounded-full" style={{ background: effectiveAccent }} />
                        <span className="text-sm font-bold" style={{ color: effectiveAccent, fontFamily: customFont }}>
                          {selectedTemplate?.name} — {ACCENT_COLORS.find(c => c.value === customColor)?.label ?? "Default"} · {FONTS.find(f => f.value === customFont)?.label.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Frosted bar */}
            <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-t border-border/30" style={{ bottom: showCustomize ? "auto" : 0, top: 0, height: "100%" }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
              {/* Selected info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: effectiveAccent }}
                >
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight">{selectedTemplate?.name}</p>
                  <p className="text-foreground/50 text-xs truncate">{selectedTemplate?.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Customize toggle */}
                <motion.button
                  onClick={() => setShowCustomize(v => !v)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl smooth-transition border ${
                    showCustomize
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "card-blur text-foreground/70 hover:border-primary/40"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Customize
                  {showCustomize ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </motion.button>

                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2.5 text-sm text-foreground/60 hover:text-foreground card-blur rounded-xl smooth-transition"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleUse}
                  className="group inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 smooth-transition"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ background: `linear-gradient(to right, ${effectiveAccent}, ${effectiveAccent}dd)` }}
                >
                  Use Template
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
