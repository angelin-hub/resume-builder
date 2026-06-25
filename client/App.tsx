import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Component, ReactNode } from "react";
import ConfettiCanvas from "@/components/Confetti";
import PageTransition from "@/components/PageTransition";

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ResumeBuilder from "./pages/ResumeBuilder";
import Dashboard from "./pages/Dashboard";
import TemplatePicker from "./pages/TemplatePicker";
import AISuggestions from "./pages/AISuggestions";
import Templates from "./pages/Templates";
import ResumePreview from "./pages/ResumePreview";
import InterviewPrep from "./pages/InterviewPrep";

const queryClient = new QueryClient();

// ── Simple error boundary so one broken page never kills the whole app ─────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background text-foreground">
          <h1 className="text-3xl font-bold text-red-500">Something went wrong</h1>
          <p className="text-foreground/60 max-w-md">{this.state.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, message: "" }); window.location.href = "/"; }}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold"
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Animated routes wrapper — needs useLocation inside BrowserRouter
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="/create-resume" element={<PageTransition><ResumeBuilder /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/template-picker" element={<PageTransition><TemplatePicker /></PageTransition>} />
        <Route path="/ai-suggestions" element={<PageTransition><AISuggestions /></PageTransition>} />
        <Route path="/templates" element={<PageTransition><Templates /></PageTransition>} />
        <Route path="/resume-preview" element={<PageTransition><ResumePreview /></PageTransition>} />
        <Route path="/interview-prep" element={<PageTransition><InterviewPrep /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(
  <div className="relative">
    <ConfettiCanvas />
    <App />
  </div>
);
