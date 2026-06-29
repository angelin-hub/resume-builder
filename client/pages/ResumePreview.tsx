import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Download, Save, Check, ArrowLeft, Loader2,
  CloudOff, Cloud, Mail, Phone, MapPin, User, Globe, Link2, Printer,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { resumeApi, getToken, getLocalResumes, saveLocalResumes } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { launchConfetti } from "@/components/Confetti";

// ─── helpers ──────────────────────────────────────────────────────────────────
function getDraft() {
  try { const r = localStorage.getItem("rp_draft"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
const TEMPLATES: Record<string, { accent: string; bg: string; name: string }> = {
  classic:    { accent: "#f97316", bg: "#fff7ed",  name: "Classic"       },
  modern:     { accent: "#f97316", bg: "#fff7ed",  name: "Modern"        },
  minimal:    { accent: "#6b7280", bg: "#f9fafb",  name: "Minimal"       },
  creative:   { accent: "#059669", bg: "#ecfdf5",  name: "Creative"      },
  executive:  { accent: "#57534e", bg: "#fafaf9",  name: "Executive"     },
  ats:        { accent: "#db2777", bg: "#fdf2f8",  name: "ATS-Optimized" },
  sidebar:    { accent: "#d97706", bg: "#fffbeb",  name: "Sidebar Pro"   },
  healthcare: { accent: "#0d9488", bg: "#f0fdfa",  name: "Healthcare"    },
  corporate:  { accent: "#475569", bg: "#f8fafc",  name: "Corporate"     },
};
const EDU: Record<string, string> = {
  secondary:"Secondary School", diploma:"Diploma",
  bachelors:"Bachelor's Degree", masters:"Master's Degree", doctorate:"Doctorate / Ph.D",
};

// ─── Section component ────────────────────────────────────────────────────────
function Sec({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[9px] font-bold uppercase tracking-widest pb-0.5 border-b mb-1.5"
        style={{ color: accent, borderColor: accent + "40" }}>{label}</p>
      {children}
    </div>
  );
}

// ─── Full A4 resume paper ─────────────────────────────────────────────────────
function ResumePaper({ draft, paperRef }: { draft: any; paperRef: React.RefObject<HTMLDivElement> }) {
  const tpl    = TEMPLATES[draft?.templateId] ?? TEMPLATES.classic;
  const accent = draft?.customColor ?? tpl.accent;
  const bg     = tpl.bg;
  const font   = draft?.customFont  ?? "Georgia, serif";
  const twoCol = draft?.layoutColumns === "two-col";
  const photo  = draft?.withPhoto === true || draft?.withPhoto === "with-photo";
  const fd     = draft?.fd ?? {};
  const work   = (draft?.workList   ?? []).filter((w: any) => w.company || w.position);
  const eduL   = (draft?.eduList    ?? []).filter((e: any) => e.institution || e.degree);
  const skills = (draft?.skills     ?? []).filter(Boolean).slice(0, 14);
  const langs  = (draft?.languages  ?? []).filter((l: any) => l.lang);
  const projs  = (draft?.projects   ?? []).filter((p: any) => p.name);
  const certs  = (draft?.certs      ?? []).filter((c: any) => c.name);
  const achiev = (draft?.achievements ?? []).filter((a: any) => a.title);
  const refs   = (draft?.refs       ?? []).filter((r: any) => r.name);
  const softs  = (draft?.softSkills ?? []).filter(Boolean);
  const eduLabel = EDU[draft?.educationLevel ?? ""] ?? "";

  const name  = fd.fullName || "Your Name";
  const title = fd.jobTitle  || "Job Title";
  const email = fd.email     || "email@example.com";

  const mainContent = (
    <>
      {fd.summary && <Sec label="Professional Summary" accent={accent}><p className="text-gray-700 text-[11px] leading-relaxed">{fd.summary}</p></Sec>}

      {work.length > 0 && <Sec label="Work Experience" accent={accent}>
        {work.map((w: any, i: number) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold text-[11.5px]">{w.position}</p>
              <p className="text-gray-400 text-[10px] ml-2 whitespace-nowrap">{w.startDate}{w.startDate && (w.current ? "–Present" : w.endDate ? `–${w.endDate}` : "")}</p>
            </div>
            <p className="text-gray-500 text-[10.5px]">{w.company}</p>
            {w.description  && <p className="text-gray-600 text-[10px] mt-0.5 leading-relaxed">{w.description}</p>}
            {w.achievements && <p className="text-gray-600 text-[10px] mt-0.5 leading-relaxed whitespace-pre-line">{w.achievements}</p>}
          </div>
        ))}
      </Sec>}

      {(eduL.length > 0 || eduLabel) && <Sec label="Education" accent={accent}>
        {eduL.length > 0 ? eduL.map((e: any, i: number) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold text-[11px]">{e.degree}{e.field ? `, ${e.field}` : ""}</p>
              <p className="text-gray-400 text-[10px] ml-2">{e.startYear}{e.endYear ? `–${e.endYear}` : ""}</p>
            </div>
            <p className="text-gray-500 text-[10px]">{e.institution}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
            {e.activities && <p className="text-gray-400 text-[10px] italic">{e.activities}</p>}
          </div>
        )) : <p className="text-[11px] text-gray-600">{eduLabel}</p>}
      </Sec>}

      {projs.length > 0 && <Sec label="Projects" accent={accent}>
        {projs.map((p: any, i: number) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold text-[11px]">{p.name}</p>
              {p.role && <p className="text-gray-400 text-[10px] ml-2">{p.role}</p>}
            </div>
            {p.tech        && <p className="text-gray-500 text-[10px]">{p.tech}</p>}
            {p.description && <p className="text-gray-600 text-[10px] mt-0.5">{p.description}</p>}
            {p.link        && <p className="text-[10px]" style={{ color: accent }}>{p.link}</p>}
          </div>
        ))}
      </Sec>}

      {certs.length > 0 && <Sec label="Certifications" accent={accent}>
        {certs.map((c: any, i: number) => (
          <div key={i} className="mb-1.5 flex justify-between items-baseline">
            <div><p className="font-semibold text-[11px]">{c.name}</p><p className="text-gray-500 text-[10px]">{c.issuer}{c.credentialId ? ` · ${c.credentialId}` : ""}</p></div>
            <p className="text-gray-400 text-[10px] ml-2 whitespace-nowrap">{c.date}</p>
          </div>
        ))}
      </Sec>}

      {achiev.length > 0 && <Sec label="Achievements & Awards" accent={accent}>
        {achiev.map((a: any, i: number) => (
          <div key={i} className="mb-1.5">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold text-[11px]">{a.title}</p>
              <p className="text-gray-400 text-[10px] ml-2">{a.year}</p>
            </div>
            {a.description && <p className="text-gray-600 text-[10px]">{a.description}</p>}
          </div>
        ))}
      </Sec>}

      {!twoCol && skills.length > 0 && <Sec label="Skills" accent={accent}>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s: string) => <span key={s} className="px-2 py-0.5 rounded-full text-white text-[9px]" style={{ background: accent }}>{s}</span>)}
        </div>
      </Sec>}

      {!twoCol && softs.length > 0 && <Sec label="Soft Skills" accent={accent}>
        <div className="flex flex-wrap gap-2">
          {softs.map((s: string, i: number) => <span key={i} className="text-gray-600 text-[10px]">• {s}</span>)}
        </div>
      </Sec>}

      {!twoCol && langs.length > 0 && <Sec label="Languages" accent={accent}>
        <div className="flex flex-wrap gap-4">
          {langs.map((l: any, i: number) => <span key={i} className="text-[10px] text-gray-600">{l.lang}{l.level ? ` · ${l.level}` : ""}</span>)}
        </div>
      </Sec>}

      {refs.length > 0 && <Sec label="References" accent={accent}>
        <div className={`grid ${twoCol ? "" : "grid-cols-2"} gap-2`}>
          {refs.map((r: any, i: number) => (
            <div key={i}>
              <p className="font-semibold text-[11px]">{r.name}</p>
              <p className="text-gray-500 text-[10px]">{r.title}{r.company ? `, ${r.company}` : ""}</p>
              {r.email && <p className="text-gray-400 text-[10px]">{r.email}</p>}
              {r.phone && <p className="text-gray-400 text-[10px]">{r.phone}</p>}
            </div>
          ))}
        </div>
      </Sec>}
    </>
  );

  const sidebarContent = (
    <>
      {skills.length > 0 && <Sec label="Technical Skills" accent={accent}>
        <div className="flex flex-wrap gap-1">
          {skills.map((s: string) => <span key={s} className="px-1.5 py-0.5 rounded text-white text-[9px] mb-0.5 inline-block" style={{ background: accent }}>{s}</span>)}
        </div>
      </Sec>}
      {softs.length > 0 && <Sec label="Soft Skills" accent={accent}>
        {softs.map((s: string, i: number) => <p key={i} className="text-gray-600 text-[10px]">• {s}</p>)}
      </Sec>}
      {langs.length > 0 && <Sec label="Languages" accent={accent}>
        {langs.map((l: any, i: number) => <p key={i} className="text-[10px] text-gray-600">{l.lang}{l.level ? ` · ${l.level}` : ""}</p>)}
      </Sec>}
    </>
  );

  return (
    <div ref={paperRef} style={{ background: bg, fontFamily: font, color: "#1a1a2e", width: "210mm", minHeight: "297mm" }}
      className="shadow-2xl">
      {/* Header */}
      <div className="px-10 py-7 text-white" style={{ background: accent }}>
        <div className="flex items-start gap-5">
          {photo && (
            draft?.photoDataUrl
              ? <img src={draft.photoDataUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white/40" />
              : <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 border-2 border-white/40"><User className="w-9 h-9 text-white/70" /></div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight">{name}</h1>
            <p className="text-white/80 text-sm mt-1">{title}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-white/70 text-[10.5px]">
              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{email}</span>
              {fd.phone    && <span className="flex items-center gap-1.5"><Phone  className="w-3 h-3" />{fd.phone}</span>}
              {fd.location && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{fd.location}</span>}
              {fd.linkedin && <span className="flex items-center gap-1.5"><Link2  className="w-3 h-3" />{fd.linkedin}</span>}
              {fd.github   && <span className="flex items-center gap-1.5"><Globe  className="w-3 h-3" />{fd.github}</span>}
              {fd.website  && <span className="flex items-center gap-1.5"><Globe  className="w-3 h-3" />{fd.website}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`px-10 py-7 ${twoCol ? "grid grid-cols-[5fr_8fr] gap-8" : ""}`}>
        {twoCol ? (<><div>{sidebarContent}</div><div>{mainContent}</div></>) : mainContent}
      </div>
    </div>
  );
}

// ─── Build clean inline-styled HTML for printing ─────────────────────────────
function buildPrintHtml(draft: any, accent: string, bg: string): string {
  if (!draft) return "<p style='padding:40px;color:#999'>No resume data found.</p>";
  const fd = draft.fd ?? {};
  const twoCol = draft.layoutColumns === "two-col";
  const photo  = draft.withPhoto === true || draft.withPhoto === "with-photo";
  const work   = (draft.workList ?? []).filter((w: any) => w.company || w.position);
  const eduL   = (draft.eduList  ?? []).filter((e: any) => e.institution || e.degree);
  const skills = (draft.skills   ?? []).filter(Boolean).slice(0, 14);
  const langs  = (draft.languages ?? []).filter((l: any) => l.lang);
  const projs  = (draft.projects ?? []).filter((p: any) => p.name);
  const certs  = (draft.certs    ?? []).filter((c: any) => c.name);
  const achiev = (draft.achievements ?? []).filter((a: any) => a.title);
  const refs   = (draft.refs    ?? []).filter((r: any) => r.name);
  const softs  = (draft.softSkills ?? []).filter(Boolean);

  const sec = (label: string, content: string) =>
    `<div class="rp-sec"><p class="rp-sec-label">${label}</p>${content}</div>`;

  const mainHTML = [
    fd.summary ? sec("Professional Summary", `<p style="font-size:11px;color:#374151;line-height:1.6">${fd.summary}</p>`) : "",
    work.length ? sec("Work Experience", work.map((w: any) =>
      `<div class="rp-job">
        <div class="rp-job-top"><span class="rp-job-title">${w.position || ""}</span>
        <span class="rp-job-date">${w.startDate || ""}${w.startDate ? (w.current ? "–Present" : w.endDate ? `–${w.endDate}` : "") : ""}</span></div>
        <p class="rp-job-company">${w.company || ""}</p>
        ${w.description ? `<p class="rp-job-desc">${w.description}</p>` : ""}
        ${w.achievements ? `<p class="rp-job-desc">${w.achievements.replace(/\n/g, "<br/>")}</p>` : ""}
      </div>`).join("")) : "",
    eduL.length ? sec("Education", eduL.map((e: any) =>
      `<div class="rp-edu">
        <div class="rp-edu-top"><span class="rp-edu-degree">${e.degree || ""}${e.field ? `, ${e.field}` : ""}</span>
        <span class="rp-edu-year">${e.startYear || ""}${e.endYear ? `–${e.endYear}` : ""}</span></div>
        <p class="rp-edu-school">${e.institution || ""}${e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
      </div>`).join("")) : "",
    projs.length ? sec("Projects", projs.map((p: any) =>
      `<div class="rp-item">
        <div class="rp-item-top"><span class="rp-item-title">${p.name}</span>${p.role ? `<span class="rp-item-sub">${p.role}</span>` : ""}</div>
        ${p.tech ? `<p class="rp-item-sub">${p.tech}</p>` : ""}
        ${p.description ? `<p class="rp-item-desc">${p.description}</p>` : ""}
        ${p.link ? `<p class="rp-item-link">${p.link}</p>` : ""}
      </div>`).join("")) : "",
    certs.length ? sec("Certifications", certs.map((c: any) =>
      `<div class="rp-item">
        <div class="rp-item-top"><span class="rp-item-title">${c.name}</span><span class="rp-item-sub">${c.date || ""}</span></div>
        <p class="rp-item-sub">${c.issuer || ""}${c.credentialId ? ` · ${c.credentialId}` : ""}</p>
      </div>`).join("")) : "",
    achiev.length ? sec("Achievements & Awards", achiev.map((a: any) =>
      `<div class="rp-item">
        <div class="rp-item-top"><span class="rp-item-title">${a.title}</span><span class="rp-item-sub">${a.year || ""}</span></div>
        ${a.description ? `<p class="rp-item-desc">${a.description}</p>` : ""}
      </div>`).join("")) : "",
    !twoCol && skills.length ? sec("Skills", `<div class="rp-skills">${skills.map((s: string) => `<span class="rp-skill">${s}</span>`).join("")}</div>`) : "",
    !twoCol && softs.length ? sec("Soft Skills", `<p class="rp-soft">${softs.join(" · ")}</p>`) : "",
    !twoCol && langs.length ? sec("Languages", `<p class="rp-soft">${langs.map((l: any) => `${l.lang}${l.level ? ` (${l.level})` : ""}`).join(" · ")}</p>`) : "",
    refs.length ? sec("References", `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${refs.map((r: any) =>
      `<div><p style="font-weight:600;font-size:11px">${r.name}</p>
      <p style="font-size:10px;color:#6b7280">${r.title || ""}${r.company ? `, ${r.company}` : ""}</p>
      ${r.email ? `<p style="font-size:10px;color:#9ca3af">${r.email}</p>` : ""}
      ${r.phone ? `<p style="font-size:10px;color:#9ca3af">${r.phone}</p>` : ""}</div>`).join("")}</div>`) : "",
  ].join("");

  const sideHTML = [
    skills.length ? sec("Technical Skills", `<div class="rp-skills">${skills.map((s: string) => `<span class="rp-skill">${s}</span>`).join("")}</div>`) : "",
    softs.length ? sec("Soft Skills", softs.map((s: string) => `<p class="rp-soft">• ${s}</p>`).join("")) : "",
    langs.length ? sec("Languages", langs.map((l: any) => `<p class="rp-soft">${l.lang}${l.level ? ` · ${l.level}` : ""}</p>`).join("")) : "",
  ].join("");

  const photoHtml = photo
    ? draft?.photoDataUrl
      ? `<div style="width:80px;height:80px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,0.4);flex-shrink:0;margin-right:20px"><img src="${draft.photoDataUrl}" style="width:100%;height:100%;object-fit:cover" /></div>`
      : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:32px;color:white;margin-right:20px">👤</div>`
    : "";

  return `
    <div class="rp-header">
      <div style="display:flex;align-items:center">
        ${photoHtml}
        <div>
          <h1>${fd.fullName || "Your Name"}</h1>
          <p class="subtitle">${fd.jobTitle || ""}</p>
          <div class="rp-contact">
            <span>${fd.email || ""}</span>
            ${fd.phone ? `<span>${fd.phone}</span>` : ""}
            ${fd.location ? `<span>${fd.location}</span>` : ""}
            ${fd.linkedin ? `<span>${fd.linkedin}</span>` : ""}
            ${fd.github ? `<span>${fd.github}</span>` : ""}
          </div>
        </div>
      </div>
    </div>
    <div class="rp-body">
      ${twoCol
        ? `<div class="rp-two-col"><div>${sideHTML}</div><div>${mainHTML}</div></div>`
        : mainHTML}
    </div>`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResumePreview() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const paperRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [savedId, setSavedId] = useState<number|null>(null);

  useEffect(() => { setDraft(getDraft()); }, []);

  const tpl = TEMPLATES[draft?.templateId] ?? TEMPLATES.modern;

  // ── Download as PDF (opens styled print window) ────────────────────────────
  const handleDownload = () => {
    if (!paperRef.current) return;

    // Increment downloadCount in localStorage for the matching resume
    try {
      const draftTitle = draft?.fd?.fullName
        ? `${draft.fd.fullName}${draft.fd.jobTitle ? ` – ${draft.fd.jobTitle}` : ""}`
        : null;
      const list = getLocalResumes();
      const updated = list.map(r => {
        const match = savedId ? r.id === savedId : (draftTitle && r.title === draftTitle);
        return match ? { ...r, downloadCount: (r.downloadCount ?? 0) + 1 } : r;
      });
      // If no match found, nothing to update — that's fine
      saveLocalResumes(updated);
    } catch (_) {}

    // Track on server too (best-effort, won't block UI)
    if (savedId) resumeApi.trackDownload(savedId).catch(() => {});

    // 🎉 Celebrate!
    launchConfetti();

    const accent = tpl.accent;
    const bg = tpl.bg;
    const paperHtml = paperRef.current.outerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${draft?.fd?.fullName || "Resume"}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { background:#f3f4f6; -webkit-print-color-adjust:exact; print-color-adjust:exact; font-family: Georgia, serif; }
    @page { size: A4; margin: 0; }
    @media print {
      html, body { background:white; }
      .no-print { display:none !important; }
      .paper { box-shadow:none !important; margin:0 !important; }
    }
    .print-bar {
      background:white; padding:12px 24px; display:flex; align-items:center;
      justify-content:space-between; border-bottom:1px solid #e5e7eb;
      position:sticky; top:0; z-index:10;
    }
    .print-bar span { font-family:sans-serif; font-size:14px; color:#374151; }
    .print-btn {
      font-family:sans-serif; font-size:14px; font-weight:600;
      background:${accent}; color:white; border:none; padding:8px 20px;
      border-radius:8px; cursor:pointer;
    }
    .paper-wrap { display:flex; justify-content:center; padding:24px; }
    .paper {
      width:210mm; min-height:297mm; background:${bg};
      box-shadow:0 4px 24px rgba(0,0,0,0.15); font-family:Georgia,serif;
      color:#1a1a2e;
    }
    /* Header */
    .rp-header { padding:28px 40px; color:white; background:${accent}; }
    .rp-header h1 { font-size:22px; font-weight:700; line-height:1.3; }
    .rp-header .subtitle { font-size:13px; opacity:0.85; margin-top:4px; }
    .rp-contact { display:flex; flex-wrap:wrap; gap:16px; margin-top:8px; font-size:10px; opacity:0.75; }
    /* Body */
    .rp-body { padding:28px 40px; }
    .rp-two-col { display:grid; grid-template-columns:5fr 8fr; gap:32px; }
    /* Section */
    .rp-sec-label {
      font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;
      color:${accent}; border-bottom:1px solid ${accent}40; padding-bottom:2px; margin-bottom:6px;
    }
    .rp-sec { margin-bottom:16px; }
    /* Work */
    .rp-job { margin-bottom:12px; }
    .rp-job-top { display:flex; justify-content:space-between; align-items:baseline; }
    .rp-job-title { font-weight:600; font-size:11.5px; }
    .rp-job-date { font-size:10px; color:#9ca3af; white-space:nowrap; margin-left:8px; }
    .rp-job-company { font-size:10.5px; color:#6b7280; }
    .rp-job-desc { font-size:10px; color:#4b5563; margin-top:2px; line-height:1.5; }
    /* Edu */
    .rp-edu { margin-bottom:8px; }
    .rp-edu-top { display:flex; justify-content:space-between; align-items:baseline; }
    .rp-edu-degree { font-weight:600; font-size:11px; }
    .rp-edu-year { font-size:10px; color:#9ca3af; }
    .rp-edu-school { font-size:10px; color:#6b7280; }
    /* Skills */
    .rp-skills { display:flex; flex-wrap:wrap; gap:6px; }
    .rp-skill { font-size:9px; color:white; padding:2px 8px; border-radius:9999px; background:${accent}; }
    /* Soft skills / langs */
    .rp-soft { font-size:10px; color:#4b5563; }
    /* Projects / Certs / Achievements */
    .rp-item { margin-bottom:8px; }
    .rp-item-top { display:flex; justify-content:space-between; }
    .rp-item-title { font-weight:600; font-size:11px; }
    .rp-item-sub { font-size:10px; color:#6b7280; }
    .rp-item-desc { font-size:10px; color:#4b5563; margin-top:2px; }
    .rp-item-link { font-size:10px; color:${accent}; }
    p { margin:0; }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <span>📄 ${draft?.fd?.fullName || "Resume"} — Ready to save as PDF</span>
    <button class="print-btn" onclick="window.print()">⬇ Save as PDF / Print</button>
  </div>
  <div class="paper-wrap">
    <div class="paper">${buildPrintHtml(draft, accent, bg)}</div>
  </div>
  <script>
    // Auto-open print dialog after a short delay
    setTimeout(() => window.print(), 800);
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Save to cloud / local ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveStatus("saving");
    // Always save locally
    try { localStorage.setItem("rp_draft", JSON.stringify({ ...draft, savedAt: new Date().toISOString() })); } catch (_) {}

    if (getToken() && draft) {
      try {
        const payload = {
          title: draft.fd?.fullName ? `${draft.fd.fullName}${draft.fd.jobTitle ? ` – ${draft.fd.jobTitle}` : ""}` : "Untitled Resume",
          templateId: draft.templateId,
          domain: draft.domain,
          experienceLevel: draft.experienceLevel,
          isStudent: draft.isStudent,
          educationLevel: draft.educationLevel,
          layoutColumns: draft.layoutColumns,
          withPhoto: draft.withPhoto === true || draft.withPhoto === "with-photo",
          jobTitle: draft.fd?.jobTitle,
          phone: draft.fd?.phone,
          location: draft.fd?.location,
          summary: draft.fd?.summary,
          skills: (draft.skills ?? []).filter(Boolean),
          status: "complete" as const,
        };
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
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const name = draft?.fd?.fullName || "Your Resume";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Top bar ── */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <Link to="/ai-suggestions" className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground smooth-transition mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to AI Suggestions
              </Link>
              <h1 className="text-3xl font-bold gradient-text">{name}</h1>
              <p className="text-foreground/50 text-sm mt-1">
                Template: <span className="text-foreground/80 font-medium">{tpl.name}</span>
                {draft?.layoutColumns && <> · {draft.layoutColumns === "two-col" ? "Two Column" : "Single Column"}</>}
                {(draft?.withPhoto === true || draft?.withPhoto === "with-photo") && <> · With Photo</>}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Save */}
              <motion.button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm smooth-transition
                  ${saveStatus === "saved"  ? "bg-green-500/15 text-green-500 border border-green-500/30"
                  : saveStatus === "error"  ? "bg-red-500/15 text-red-500 border border-red-500/30"
                  : saveStatus === "saving" ? "card-blur opacity-60 cursor-not-allowed"
                  : "card-blur hover:border-primary/40"}`}
              >
                {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
                {saveStatus === "saved"  && <Check className="w-4 h-4" />}
                {saveStatus === "error"  && <CloudOff className="w-4 h-4" />}
                {saveStatus === "idle"   && <Save className="w-4 h-4" />}
                {saveStatus === "saving" ? "Saving…"
                  : saveStatus === "saved"  ? (isAuthenticated ? "Saved to Cloud ✓" : "Saved Locally ✓")
                  : saveStatus === "error"  ? "Retry Save"
                  : isAuthenticated ? "Save to Cloud" : "Save Draft"}
              </motion.button>

              {/* Print */}
              <motion.button
                onClick={handlePrint}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm card-blur hover:border-primary/40 smooth-transition"
              >
                <Printer className="w-4 h-4" /> Print
              </motion.button>

              {/* Download */}
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl hover:shadow-primary/40 smooth-transition"
              >
                <Download className="w-4 h-4" /> Download Resume
              </motion.button>
            </div>
          </motion.div>

          {/* ── Stats row ── */}
          {draft && (
            <motion.div
              className="flex flex-wrap gap-3 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {[
                { label: "Work Entries",    value: (draft.workList ?? []).filter((w: any) => w.company).length },
                { label: "Skills",          value: (draft.skills ?? []).filter(Boolean).length },
                { label: "Projects",        value: (draft.projects ?? []).filter((p: any) => p.name).length },
                { label: "Certifications",  value: (draft.certs ?? []).filter((c: any) => c.name).length },
                { label: "Achievements",    value: (draft.achievements ?? []).filter((a: any) => a.title).length },
              ].map(stat => (
                <div key={stat.label} className="card-blur px-4 py-2 rounded-xl text-sm">
                  <span className="font-bold text-foreground">{stat.value}</span>
                  <span className="text-foreground/50 ml-1.5">{stat.label}</span>
                </div>
              ))}
              <div className="card-blur px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: tpl.accent }} />
                <span className="text-foreground/70">{tpl.name} Template</span>
              </div>
            </motion.div>
          )}

          {/* ── Resume paper preview ── */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="w-full overflow-x-auto">
              <div className="min-w-[210mm] mx-auto">
                {draft ? (
                  <ResumePaper draft={draft} paperRef={paperRef} />
                ) : (
                  <div className="card-blur rounded-2xl p-20 text-center">
                    <p className="text-foreground/40 text-lg mb-4">No resume data found.</p>
                    <Link to="/create-resume" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg smooth-transition">
                      Build Your Resume
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Bottom CTA ── */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 card-blur rounded-2xl font-semibold hover:border-primary/40 smooth-transition"
            >
              {saveStatus === "saved" ? <><Check className="w-4 h-4 text-green-500" /> Saved!</> : <><Save className="w-4 h-4" /> Save Resume</>}
            </motion.button>

            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/40 smooth-transition"
            >
              <Download className="w-5 h-5" /> Download as HTML/PDF
            </motion.button>

            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-3.5 card-blur rounded-2xl font-semibold hover:border-primary/40 smooth-transition cursor-pointer"
              >
                Go to Dashboard →
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, .no-print, button, a { display: none !important; }
          body { background: white; }
          .shadow-2xl { box-shadow: none; }
        }
      `}</style>
    </div>
  );
}
