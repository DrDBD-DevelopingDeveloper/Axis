import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // Animation Lib

// Hooks & Context
import { useSettings } from "./hooks/useSettings";
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from "./components/Sidebar";

// Pages
import Login from './pages/Login';
import Home from "./pages/home";
import Timetable from "./pages/timetable";
import Gym from "./pages/gym";
import Expenses from "./pages/expenses";
import Settings from "./pages/settings";
import Insights from "./pages/insights"; // <--- NEW IMPORT

// Animated Page Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/timetable" element={<PageTransition><Timetable /></PageTransition>} />
        <Route path="/gym" element={<PageTransition><Gym /></PageTransition>} />
        <Route path="/expenses" element={<PageTransition><Expenses /></PageTransition>} />
        <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} /> {/* <--- NEW ROUTE */}
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { settings } = useSettings();
  const { user, loading } = useAuth(); // Check Auth Status

  // Theme Logic
  useEffect(() => {
    document.body.className = "";
    if (settings.theme !== 'graphite') {
      document.body.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme]);
  
  // 1. Loading State (Prevents flash of Login screen)
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--app-bg)] text-[var(--app-text-muted)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium animate-pulse">Syncing Axis...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Show Login)
  if (!user) {
    return <Login />;
  }

  // 3. Authenticated App (Show Sidebar + Routes)
  return (
    <BrowserRouter>
      <div className="bg-app-bg text-app-text min-h-screen font-sans selection:bg-app-accent selection:text-white transition-colors duration-200">
        <Sidebar>
          <AnimatedRoutes />
        </Sidebar>
      </div>
    </BrowserRouter>
  );
}

export default App;