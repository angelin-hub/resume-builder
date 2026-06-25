import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) { document.documentElement.classList.add("dark"); setIsDark(true); }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "glassmorphism shadow-lg"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scroll progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-primary origin-left z-50"
        style={{ scaleX }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold gradient-text">
          ResumePro
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground/70 hover:text-foreground smooth-transition">
            Features
          </a>
          <a href="#how-it-works" className="text-foreground/70 hover:text-foreground smooth-transition">
            How it Works
          </a>
          <Link to="/template-picker" className="text-foreground/70 hover:text-foreground smooth-transition">
            Templates
          </Link>
          <Link to="/interview-prep" className="text-foreground/70 hover:text-foreground smooth-transition">
            Interview Prep
          </Link>
          <a href="#testimonials" className="text-foreground/70 hover:text-foreground smooth-transition">
            Testimonials
          </a>
          <a href="#pricing" className="text-foreground/70 hover:text-foreground smooth-transition">
            Pricing
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-foreground/10 smooth-transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Link to="/dashboard" className="hidden md:block px-4 py-2 text-foreground/70 hover:text-foreground smooth-transition font-medium">
            Dashboard
          </Link>
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-foreground/60 font-medium">
                Hi, {user?.fullName?.split(" ")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-foreground/70 hover:text-foreground smooth-transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <Link to="/signin" className="hidden md:block px-4 py-2 text-foreground/70 hover:text-foreground smooth-transition font-medium">
              Sign In
            </Link>
          )}
          <Link to="/create-resume" className="hidden md:block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 smooth-transition text-center">
            Start Building
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-foreground/10"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden glassmorphism border-t"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-foreground/70 hover:text-foreground smooth-transition">
              Features
            </a>
            <a href="#how-it-works" className="block text-foreground/70 hover:text-foreground smooth-transition">
              How it Works
            </a>
            <a href="#testimonials" className="block text-foreground/70 hover:text-foreground smooth-transition">
              Testimonials
            </a>
            <a href="#pricing" className="block text-foreground/70 hover:text-foreground smooth-transition">
              Pricing
            </a>
            <Link to="/dashboard" className="block text-foreground/70 hover:text-foreground smooth-transition font-medium">
              Dashboard
            </Link>
            <Link to="/create-resume" className="w-full block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg smooth-transition text-center">
              Start Building
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
