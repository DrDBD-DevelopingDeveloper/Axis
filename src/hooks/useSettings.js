import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export const THEMES = {
  default: "Graphite (Pro Dark)",
  paper: "Paper (Clean Light)",
  obsidian: "Obsidian (Purple Night)" 
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ userName: "DrBOT", theme: "default" });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from('user_settings').select('settings_json').eq('user_id', user.id).single();
        if (data) setSettings(data.settings_json);
      } catch (e) {
        console.log("Using default settings");
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, [user]);

  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    if (user) {
      await supabase.from('user_settings').upsert({ 
        user_id: user.id, 
        settings_json: newSettings,
        updated_at: new Date().toISOString()
      });
    }
  };

  return { settings, updateSettings, isLoaded };
}