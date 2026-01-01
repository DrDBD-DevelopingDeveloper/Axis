import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { exportDataForAI } from "../utils/dataHelper";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, Dumbbell, BookOpen, Calendar } from "lucide-react";

export default function Insights() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('academic');
  const [attendanceData, setAttendanceData] = useState({});
  const [gymLogs, setGymLogs] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');

  useEffect(() => {
    if (user) {
      // 1. Fetch Attendance
      supabase.from('user_data').select('attendance_data').eq('user_id', user.id).single()
        .then(({ data }) => setAttendanceData(data?.attendance_data || {}));

      // 2. Fetch Gym Logs (Assuming a 'gym_logs' table exists as per standard schema)
      supabase.from('gym_logs').select('*').eq('user_id', user.id).order('date', { ascending: true })
        .then(({ data }) => setGymLogs(data || []));
    }
  }, [user]);

  // Format Attendance for Chart
  const attendanceChartData = Object.entries(attendanceData).map(([subject, data]) => {
    // Handle both old (number) and new (object) formats
    const present = typeof data === 'number' ? data : data.present;
    const total = typeof data === 'number' ? data : data.total; // Old format didn't track total well
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { subject, percentage, present, total };
  });

  // Format Gym Data
  const uniqueExercises = [...new Set(gymLogs.map(log => log.exercise_name))];
  const gymChartData = gymLogs.filter(log => log.exercise_name === selectedExercise).map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
    weight: log.weight
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[var(--app-text)]">Insights</h1>
          <p className="text-sm text-[var(--app-text-muted)]">Track your consistency and progress</p>
        </div>
        <button 
          onClick={() => exportDataForAI(attendanceData, gymLogs)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--app-accent)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all"
        >
          <Download size={18} /> Export for AI
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--app-border)]">
        <button 
          onClick={() => setActiveTab('academic')}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'academic' ? 'border-[var(--app-accent)] text-[var(--app-text)]' : 'border-transparent text-[var(--app-text-muted)]'}`}
        >
          Academic
        </button>
        <button 
          onClick={() => setActiveTab('gym')}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'gym' ? 'border-[var(--app-accent)] text-[var(--app-text)]' : 'border-transparent text-[var(--app-text-muted)]'}`}
        >
          Gym
        </button>
      </div>

      {/* ACADEMIC TAB */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 premium-card p-6 min-h-[400px]">
            <h3 className="text-lg font-bold mb-6">Attendance Overview (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="subject" stroke="var(--app-text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--app-text-muted)" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: 'var(--app-surface-hover)'}} contentStyle={{backgroundColor: 'var(--app-surface)', borderRadius: '8px', border:'none'}} />
                <Bar dataKey="percentage" fill="var(--app-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Details List */}
          <div className="premium-card p-6 overflow-y-auto max-h-[400px]">
            <h3 className="text-lg font-bold mb-4">Subject Breakdown</h3>
            <div className="space-y-3">
              {attendanceChartData.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)]">
                  <div>
                    <div className="font-bold text-sm">{item.subject}</div>
                    <div className="text-[10px] text-[var(--app-text-muted)]">
                      {item.present} Present / {item.total} Total
                    </div>
                  </div>
                  <div className={`text-sm font-black ${item.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GYM TAB */}
      {activeTab === 'gym' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <select 
              className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] font-bold text-sm outline-none focus:border-[var(--app-accent)]"
              onChange={(e) => setSelectedExercise(e.target.value)}
              value={selectedExercise}
            >
              <option value="">Select Exercise</option>
              {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>

          <div className="premium-card p-6 min-h-[400px]">
            {selectedExercise ? (
              <>
                <h3 className="text-lg font-bold mb-6">Progress: {selectedExercise}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={gymChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="var(--app-text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--app-text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: 'var(--app-surface)', borderRadius: '8px', border:'none'}} />
                    <Line type="monotone" dataKey="weight" stroke="var(--app-accent)" strokeWidth={3} dot={{r: 4, fill: 'var(--app-bg)', strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--app-text-muted)] opacity-50 py-20">
                <Dumbbell size={48} className="mb-4" />
                <p>Select an exercise to view your strength trends</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}