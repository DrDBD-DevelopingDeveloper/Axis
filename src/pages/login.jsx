import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // "Magic Link" login (Passwordless - easiest to setup)
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for the login link!');
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--app-bg)]">
      <div className="premium-card p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-[var(--app-text)] mb-4">Axis Sync</h1>
        <p className="text-[var(--app-text-muted)] mb-6">Enter your email to sign in.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="bits.email@pilani.bits-pilani.ac.in" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="premium-input w-full"
            required
          />
          <button disabled={loading} className="w-full p-3 bg-[var(--app-accent)] text-white rounded-lg font-bold">
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}