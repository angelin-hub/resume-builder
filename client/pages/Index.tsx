import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useSpring } from "framer-motion";
import { ChevronDown, ArrowRight, Zap, BarChart3, Lock, Sparkles, Users, Check, Star, Brain, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Tilt3DCard from "@/components/Tilt3DCard";
import AIAssistant from "@/components/AIAssistant";
import TypewriterText from "@/components/TypewriterText";
import BackToTop from "@/components/BackToTop";

const HeroScene3D = lazy(() => import("@/components/HeroScene3D"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));
const FloatingShapes3D = lazy(() => import("@/components/FloatingShapes3D"));

/* ── animated counter ───────────────────────────────────────────────── */
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useSpring(0, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) count.set(to);
  }, [isInView, to, count]);

  useEffect(() => {
    const unsub = count.on("change", (v) => setDisplay(Math.round(v).toLocaleString()));
    return unsub;
  }, [count]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── main page ──────────────────────────────────────────────────────── */
const Index = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  const words = ["Dream Job", "Next Role", "Career Goal", "Promotion"];
  // wordIndex managed by TypewriterText component

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />
      <Navigation />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">

        {/* Ambient gradient blobs — background only */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
            animate={{ scale: [1, 1.3, 1], y: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]"
            animate={{ scale: [1.2, 1, 1.2], y: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        {/* ── 2-column grid ─────────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen py-20">

          {/* LEFT — 3D Scene */}
          <motion.div
            className="relative h-[420px] sm:h-[520px] lg:h-[640px] w-full order-2 lg:order-1"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, type: "spring", stiffness: 60 }}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <motion.div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary"
                  animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
              </div>
            }>
              <HeroScene3D />
            </Suspense>

            {/* Floating pills anchored to the 3D panel */}
            <motion.div className="absolute bottom-6 left-0 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              {[
                { icon: "🤖", label: "AI Suggestions" },
                { icon: "⚡", label: "ATS Optimised" },
                { icon: "🎨", label: "9 Templates" },
              ].map((item, i) => (
                <motion.div key={i}
                  className="card-blur px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl border border-primary/20"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}>
                  <span>{item.icon}</span> {item.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Text content */}
          <motion.div
            className="order-1 lg:order-2 flex flex-col items-start text-left"
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, type: "spring", stiffness: 100 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 card-blur px-5 py-2.5 rounded-full text-sm font-semibold border border-primary/30 backdrop-blur-xl">
                <motion.span animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}>✨</motion.span>
                AI-Powered Resume Builder — Free to Start
                <motion.span className="w-2 h-2 rounded-full bg-green-400 inline-block" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, type: "spring", stiffness: 80 }}
            >
              <span className="gradient-text">Land Your</span>
              <br />
              <TypewriterText
                words={["Dream Job", "Next Role", "Career Goal", "Promotion", "Big Break"]}
                className="gradient-text"
                typingSpeed={75}
                deletingSpeed={40}
                pauseMs={2000}
              />
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-foreground/60 mt-8 mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              Build a stunning, ATS-optimised resume in minutes — with AI suggestions,
              a 12-step guided builder, and beautiful templates.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  to="/template-picker"
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/50 smooth-transition inline-flex items-center gap-2 text-lg overflow-hidden"
                >
                  <motion.span className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-12 group-hover:translate-x-[200%] transition-transform duration-700" />
                  Start Building Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  to="/template-picker"
                  className="px-8 py-4 card-blur text-foreground rounded-2xl font-bold hover:border-primary/50 smooth-transition inline-flex items-center gap-2 text-lg backdrop-blur-xl"
                >
                  <Palette className="w-5 h-5 text-primary" />
                  Browse Templates
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-4 w-full max-w-md mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
            >
              {[
                { value: 50000, suffix: "+", label: "Job Seekers" },
                { value: 98, suffix: "%", label: "ATS Pass Rate" },
                { value: 4.9, suffix: "★", label: "User Rating" },
              ].map((stat, i) => (
                <div key={i} className="card-blur rounded-2xl py-3 px-4 backdrop-blur-xl text-center">
                  <div className="text-xl font-bold gradient-text">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-foreground/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div className="flex flex-wrap gap-4 text-sm text-foreground/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.75 }}>
              <span>✓ No credit card required</span>
              <span>✓ Export to PDF instantly</span>
              <span>✓ Cancel anytime</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          <span className="text-xs text-foreground/30 uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Stats Banner ──────────────────────────────────────────────── */}
      <StatsBanner />

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <CTASection />

      {/* ── Meet the Team ─────────────────────────────────────────────────── */}
      <MeetTheTeam />

      <Footer />
      <AIAssistant />
      <BackToTop />
    </div>
  );
};

/* ── Features Section ───────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, index, color }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3DCard className="group h-full" glowColor={color}>
        <div className="card-blur p-8 rounded-2xl hover:border-primary/50 smooth-transition cursor-pointer h-full relative overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{ background: `radial-gradient(circle at 50% 0%, ${color} 0%, transparent 70%)` }}
          />
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative"
            style={{ background: `linear-gradient(135deg, ${color}, rgba(59,130,246,0.6))` }}
          >
            <Icon className="w-7 h-7 text-white" />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: `2px solid ${color}` }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
            />
          </div>
          <h3 className="text-xl font-bold mb-2 relative">{title}</h3>
          <p className="text-foreground/70 relative">{description}</p>
        </div>
      </Tilt3DCard>
    </motion.div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Particle bg */}
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Why Choose Us
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Powerful Features</h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Everything you need to create a resume that stands out and gets noticed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "AI-Powered Suggestions", description: "Smart recommendations to improve your resume content and measurable impact scores.", color: "rgba(249,115,22,0.5)" },
            { icon: BarChart3, title: "ATS-Optimized", description: "Pass applicant tracking systems with optimized formatting and keyword density.", color: "rgba(251,191,36,0.5)" },
            { icon: Sparkles, title: "Beautiful Templates", description: "Modern, professionally designed templates crafted to impress any recruiter.", color: "rgba(249,115,22,0.4)" },
            { icon: Lock, title: "Secure & Private", description: "Your data is encrypted at rest and in transit, never shared with third parties.", color: "rgba(107,114,128,0.5)" },
            { icon: Users, title: "Expert Reviews", description: "Get actionable feedback from seasoned HR professionals on your resume.", color: "rgba(251,191,36,0.4)" },
            { icon: Brain, title: "Smart Job Matching", description: "AI matches your profile with relevant job opportunities in real time.", color: "rgba(249,115,22,0.45)" },
          ].map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ───────────────────────────────────────────────────── */
function StepCard({ step, index }: { step: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, y: 20 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3DCard>
        <motion.div
          className={`card-blur p-8 rounded-2xl text-center h-full relative overflow-hidden group ${
            step.highlight ? "border-2 border-primary/50 shadow-xl shadow-primary/20" : "border border-border/40"
          }`}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {step.highlight && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mb-4 ${
            step.highlight
              ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/40"
              : "bg-foreground/10 text-foreground/60"
          }`}>
            {step.number}
          </div>
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {step.emoji}
          </motion.div>
          <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
            {step.title}
            {step.highlight && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white">New</span>
            )}
          </h3>
          <p className="text-foreground/60 text-sm leading-relaxed mb-4">{step.description}</p>
          {step.link && (
            <Link to={step.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 smooth-transition">
              Try it <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </motion.div>
      </Tilt3DCard>
    </motion.div>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: "1", emoji: "🔑", title: "Sign Up / Log In", description: "Create a free account or log in to access your personalized dashboard." },
    { number: "2", emoji: "🏠", title: "Go to Dashboard", description: "View your resumes, track progress, and manage all your projects in one place." },
    { number: "3", emoji: "✏️", title: "Add Your Content", description: "Fill in your experience, skills, education, and achievements with AI guidance." },
    { number: "4", emoji: "🤖", title: "Get AI Suggestions", description: "Improve your resume with smart, role-specific AI-powered recommendations.", link: "/ai-suggestions" },
    { number: "5", emoji: "🎨", title: "Pick a Template", description: "Choose from industry-specific templates designed for your career domain.", highlight: true, link: "/template-picker" },
    { number: "6", emoji: "🚀", title: "Download & Apply", description: "Export as PDF and start applying to jobs with a resume that gets noticed." },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-foreground/[0.03]" />
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(249,115,22,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* 3D shapes */}
      <Suspense fallback={null}>
        <FloatingShapes3D density="low" className="opacity-40" />
      </Suspense>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div ref={ref} className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-4"
            initial={{ opacity: 0, scale: 0.8 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, delay: 0.1 }}>
            Simple Process
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text">How It Works</h2>
          <p className="text-foreground/60 text-lg mt-4 max-w-xl mx-auto">From sign-up to job-ready resume in minutes.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {steps.slice(0, 3).map((step, i) => <StepCard key={i} step={step} index={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.slice(3).map((step, i) => <StepCard key={i + 3} step={step} index={i + 3} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Stats Banner ───────────────────────────────────────────────────── */
function StatsBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 50000, suffix: "+", label: "Resumes Created" },
            { value: 98, suffix: "%", label: "ATS Pass Rate" },
            { value: 12, suffix: "+", label: "Resume Sections" },
            { value: 9, suffix: "", label: "Pro Templates" },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}>
              <div className="text-4xl sm:text-5xl font-bold gradient-text">
                <AnimatedCounter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-foreground/60 mt-1 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials Section ───────────────────────────────────────────── */
function TestimonialsSection() {
  const testimonials = [
    { author: "Sarah Chen", role: "Product Manager at Tech Co", avatar: "SC", content: "ResumePro helped me land my dream job at a top tech company. The AI suggestions were incredibly accurate and targeted!", rating: 5, color: "from-orange-500 to-amber-400" },
    { author: "Marcus Johnson", role: "Senior Developer", avatar: "MJ", content: "The ATS optimization is a game-changer. I went from zero callbacks to 3 interviews in my first week.", rating: 5, color: "from-amber-500 to-orange-400" },
    { author: "Emma Davis", role: "Marketing Executive", avatar: "ED", content: "Beautiful templates and super easy to use. My resume looks completely professional without any design skills.", rating: 5, color: "from-orange-600 to-amber-500" },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="testimonials" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div ref={ref} className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text">What Our Users Say</h2>
          <p className="text-foreground/60 text-lg mt-4 max-w-xl mx-auto">Real results from real job seekers</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <Tilt3DCard>
                <div className="card-blur p-8 rounded-2xl h-full relative overflow-hidden group">
                  <motion.div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${t.color.replace("from-", "").replace(" to-", ", ")})` }} />
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.author}</p>
                      <p className="text-xs text-foreground/50">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <motion.div key={j} initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.1 + j * 0.05, type: "spring" }}>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-foreground/80 italic leading-relaxed text-sm">"{t.content}"</p>
                </div>
              </Tilt3DCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Section ────────────────────────────────────────────────── */
function PricingSection() {
  const plans = [
    {
      name: "Starter", price: "$0", period: "Forever Free",
      features: ["1 Resume", "Basic Templates", "Download as PDF", "Email Support"],
      color: "from-gray-400 to-gray-500",
    },
    {
      name: "Professional", price: "$9.99", period: "/month",
      features: ["Unlimited Resumes", "All Templates", "AI Suggestions", "Priority Support", "Cover Letters"],
      highlighted: true, color: "from-primary to-secondary",
    },
    {
      name: "Premium", price: "$19.99", period: "/month",
      features: ["Everything in Pro", "Expert Reviews", "Job Matching", "Unlimited Downloads", "LinkedIn Integration"],
      color: "from-orange-600 to-amber-400",
    },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-foreground/[0.03]" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div ref={ref} className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text">Simple Pricing</h2>
          <p className="text-foreground/60 text-lg mt-4 max-w-xl mx-auto">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {plans.map((plan, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 50, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: plan.highlighted ? 1.05 : 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
              <Tilt3DCard glowColor={plan.highlighted ? "rgba(124,58,237,0.4)" : "rgba(100,100,100,0.2)"}>
                <div className={`card-blur rounded-2xl overflow-hidden relative ${plan.highlighted ? "border-2 border-primary/60 shadow-2xl shadow-primary/30" : ""}`}>
                  <div className={`h-1.5 bg-gradient-to-r ${plan.color}`} />
                  {plan.highlighted && (
                    <motion.div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary"
                      animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      Most Popular
                    </motion.div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-foreground/50 text-sm"> {plan.period}</span>
                    </div>
                    <motion.button
                      className={`w-full py-3 rounded-xl font-semibold mb-8 smooth-transition ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/50"
                          : "bg-foreground/10 hover:bg-foreground/20"
                      }`}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      Get Started
                    </motion.button>
                    <ul className="space-y-3">
                      {plan.features.map((f, j) => (
                        <motion.li key={j} className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 + j * 0.05 }}>
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-foreground/80 text-sm">{f}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Tilt3DCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Section ────────────────────────────────────────────────────── */
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/30"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "300% 300%" }}
      />
      {/* Animated blobs */}
      <motion.div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.4, 1], x: [0, 50, 0] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity }} />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div className="card-blur p-12 sm:p-16 rounded-3xl text-center backdrop-blur-xl border border-primary/20"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="text-6xl mb-6" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            🚀
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text">Ready to Land Your Dream Job?</h2>
          <p className="text-foreground/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 50,000+ successful job seekers. Create your resume today and start applying with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link to="/template-picker" className="group relative px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/50 smooth-transition inline-flex items-center gap-2 text-lg overflow-hidden">
                <motion.span className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-12 group-hover:translate-x-[200%] transition-transform duration-700" />
                Create Your Resume Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link to="/template-picker" className="px-10 py-4 card-blur text-foreground rounded-2xl font-bold hover:border-primary/50 smooth-transition inline-flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                View Templates
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Index;

/* ── Meet the Team ──────────────────────────────────────────────────────────── */
function MeetTheTeam() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const team = [
    {
      name: "Paul Isak Brighttan",
      role: "Frontend Developer",
      email: "brighttanpaul@gmail.com",
      initials: "PB",
      gradient: "from-orange-500 to-amber-500",
      glow: "rgba(249,115,22,0.4)",
      icon: "⚡",
    },
    {
      name: "M. Srilaya",
      role: "Frontend Developer",
      email: "laya751707@gmail.com",
      initials: "MS",
      gradient: "from-amber-500 to-yellow-400",
      glow: "rgba(245,158,11,0.4)",
      icon: "🎨",
    },
    {
      name: "Gracy Angelin V",
      role: "Database Engineer",
      email: "angelinchrist76@gmail.com",
      initials: "GA",
      gradient: "from-teal-500 to-emerald-500",
      glow: "rgba(20,184,166,0.4)",
      icon: "🗄️",
    },
    {
      name: "Angelin Achsah S S",
      role: "Backend Developer",
      email: "angelinachsah@gmail.com",
      initials: "AA",
      gradient: "from-rose-500 to-orange-400",
      glow: "rgba(244,63,94,0.4)",
      icon: "🔧",
    },
    {
      name: "Joywin Algo",
      role: "Backend Developer",
      email: "joywin2007rj@gmail.com",
      initials: "JA",
      gradient: "from-violet-500 to-purple-500",
      glow: "rgba(139,92,246,0.4)",
      icon: "⚙️",
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-foreground/[0.02]" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        {/* Header */}
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}>
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}>
            👥 Our Team
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">Meet the Team</h2>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Built with passion, collaboration, and innovation by our amazing team.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {team.map((member, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative"
            >
              {/* Gradient border glow on hover */}
              <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 smooth-transition blur-sm"
                style={{ background: `linear-gradient(135deg, ${member.glow}, transparent)` }} />

              {/* Card */}
              <div className="relative card-blur rounded-2xl p-6 text-center h-full flex flex-col items-center backdrop-blur-xl border border-foreground/10 group-hover:border-primary/30 smooth-transition overflow-hidden">

                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${member.gradient} rounded-t-2xl`} />

                {/* Avatar */}
                <motion.div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4 shadow-xl relative`}
                  style={{ boxShadow: `0 8px 24px ${member.glow}` }}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white font-black text-xl tracking-tight">{member.initials}</span>
                  {/* Floating icon */}
                  <motion.span
                    className="absolute -top-1.5 -right-1.5 text-sm"
                    animate={{ y: [0, -3, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {member.icon}
                  </motion.span>
                </motion.div>

                {/* Name */}
                <h3 className="font-bold text-base mb-1 leading-tight">{member.name}</h3>

                {/* Role badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${member.gradient} mb-4 shadow-sm`}>
                  {member.role}
                </span>

                {/* Divider */}
                <div className="w-8 h-px bg-foreground/15 mb-4" />

                {/* Email button */}
                <motion.a
                  href={`mailto:${member.email}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className={`mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${member.gradient} hover:shadow-lg smooth-transition`}
                  style={{ boxShadow: `0 4px 12px ${member.glow}` }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div className="text-center mt-12"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>
          <p className="text-foreground/40 text-sm">
            🚀 Designed & developed with ❤️ — ResumePro {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
