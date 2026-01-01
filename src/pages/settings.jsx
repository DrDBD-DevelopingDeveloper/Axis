import React from "react";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../context/AuthContext";
import { Palette, LogOut, User, Moon, Sun } from "lucide-react";

// Expanded Theme List with Paired Light/Dark options
const THEMES = [
  // Base
  { id: 'graphite', name: 'Graphite', type: 'Dark', color: '#18181b', border: '#27272a' },
  { id: 'paper', name: 'Paper', type: 'Light', color: '#f5f5f4', border: '#d6d3cc' },
  
  // Crimson Pair
  { id: 'bloodlust', name: 'Bloodlust', type: 'Dark', color: '#0f0505', accent: '#f43f5e' },
  { id: 'bloodlust-light', name: 'Rose', type: 'Light', color: '#fff1f2', accent: '#e11d48' },
  
  // Purple Pair
  { id: 'obsidian', name: 'Obsidian', type: 'Dark', color: '#020005', accent: '#d8b4fe' },
  { id: 'obsidian-light', name: 'Lilac', type: 'Light', color: '#fdf4ff', accent: '#c084fc' },
  
  // Blue Pair
  { id: 'blueberry', name: 'Blueberry', type: 'Dark', color: '#020617', accent: '#3b82f6' },
  { id: 'blueberry-light', name: 'Sky', type: 'Light', color: '#f0f9ff', accent: '#0ea5e9' },
  
  // Green Pair
  { id: 'olive', name: 'Olive', type: 'Dark', color: '#050a05', accent: '#4ade80' },
  { id: 'olive-light', name: 'Sage', type: 'Light', color: '#f0fdf4', accent: '#65a30d' },
];

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { signOut } = useAuth();

  const handleThemeChange = (themeId) => {
    updateSettings({ ...settings, theme: themeId });
  };

  const handleNameChange = (e) => {
    updateSettings({ ...settings, userName: e.target.value });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8 text-text">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
      </div>

      {/* Identity Section */}
      <section className="premium-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <User size={24} />
          </div>
          <h2 className="text-2xl font-bold">Identity</h2>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Display Name</label>
          <input 
            type="text" 
            value={settings.userName || ""} 
            onChange={handleNameChange}
            className="w-full text-lg px-6 py-4 rounded-xl font-bold bg-bg border-border focus:border-accent transition-all placeholder-text-muted"
            placeholder="Enter your name"
          />
        </div>
      </section>

      {/* Theme Section */}
      <section className="premium-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <Palette size={24} />
          </div>
          <h2 className="text-2xl font-bold">Aesthetics</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 group overflow-hidden ${
                settings.theme === theme.id 
                  ? 'border-accent bg-surface-hover shadow-lg shadow-accent/10 scale-[1.02]' 
                  : 'border-border bg-bg hover:border-text-muted/50 hover:-translate-y-1'
              }`}
            >
              {/* Theme Preview Circle */}
              <div 
                className="w-16 h-16 rounded-full shadow-inner relative flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                style={{ backgroundColor: theme.color }}
              >
                {/* Accent Dot inside */}
                {theme.accent && (
                  <div 
                    className="w-6 h-6 rounded-full shadow-lg" 
                    style={{ backgroundColor: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }}
                  />
                )}
              </div>

              <div className="text-center z-10">
                <span className={`block font-bold text-sm ${settings.theme === theme.id ? 'text-accent' : 'text-text'}`}>
                  {theme.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted opacity-60 flex items-center justify-center gap-1 mt-1">
                  {theme.type === 'Light' ? <Sun size={10}/> : <Moon size={10}/>} {theme.type}
                </span>
              </div>
              
              {/* Active Indicator Glow */}
              {settings.theme === theme.id && (
                <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-8 border-t border-border">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-8 py-4 bg-rose-500/10 text-rose-500 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </section>
    </div>
  );
}