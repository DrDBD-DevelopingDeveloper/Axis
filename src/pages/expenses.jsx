import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Wallet, TrendingUp, PieChart, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [monthlyLimit] = useState(5000); 

  useEffect(() => {
    if (user) {
      const fetchExpenses = async () => {
        const { data } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false });
        if (data) setExpenses(data);
      };
      fetchExpenses();
    }
  }, [user]);

  const addExpense = async () => {
    if (!amount) return;
    const newExpense = {
      user_id: user.id,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString()
    };
    setExpenses([newExpense, ...expenses]);
    setAmount("");
    await supabase.from('expenses').insert([newExpense]);
  };

  const deleteExpense = async (id, index) => {
    const newExpenses = [...expenses];
    newExpenses.splice(index, 1);
    setExpenses(newExpenses);
    if (id) await supabase.from('expenses').delete().eq('id', id);
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = monthlyLimit - totalSpent;
  const progress = Math.min((totalSpent / monthlyLimit) * 100, 100);

  const categoryData = Object.entries(expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8 text-text">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-8 bg-surface border-accent/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Total Spent</p>
              <h2 className="text-5xl font-black text-text mt-2">₹{totalSpent.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-accent/20 rounded-xl text-accent">
              <Wallet size={24} />
            </div>
          </div>
          <div className="w-full bg-bg h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : 'bg-accent'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-text-muted mt-2 font-mono">
            {Math.round(progress)}% of ₹{monthlyLimit.toLocaleString()} Budget
          </p>
        </div>

        <div className="premium-card p-8 flex flex-col justify-center bg-surface">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
               <TrendingUp size={24}/>
             </div>
             <div>
               <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Remaining</p>
               <h3 className={`text-3xl font-bold ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                 ₹{remaining.toLocaleString()}
               </h3>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT SECTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 bg-surface">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-text-muted font-bold">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-3 outline-none focus:border-accent text-text font-mono font-bold transition-all placeholder-text-muted"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2 ml-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 outline-none focus:border-accent text-text font-bold transition-all appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button 
                onClick={addExpense}
                className="w-full sm:w-auto bg-accent hover:opacity-90 text-bg p-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex justify-center items-center"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest pl-2">Recent Transactions</h3>
            {expenses.map((ex, i) => (
              <div key={i} className="group flex justify-between items-center p-4 bg-surface border border-border rounded-2xl hover:border-accent/50 transition-all hover:translate-x-1">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-text-muted font-bold border border-border">
                    {ex.category[0]}
                  </div>
                  <div>
                    <p className="font-bold text-text">{ex.category}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar size={10}/> {new Date(ex.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-text">₹{ex.amount}</span>
                  <button 
                    onClick={() => deleteExpense(ex.id, i)}
                    className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-12 text-text-muted border-2 border-dashed border-border rounded-2xl">
                No expenses logged yet.
              </div>
            )}
          </div>
        </div>

        {/* BREAKDOWN SECTION */}
        <div className="premium-card p-6 h-fit bg-surface">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={16} className="text-accent"/>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Breakdown</h3>
          </div>
          
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fill: 'var(--app-text-muted)', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'var(--app-surface)', borderRadius: '8px', border: '1px solid var(--app-border)', color: 'var(--app-text)'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} fill="var(--app-accent)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                Add expenses to see breakdown
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}