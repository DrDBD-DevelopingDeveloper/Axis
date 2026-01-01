import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useExpenses() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(5000); 
  const [isLoaded, setIsLoaded] = useState(false); // Added state to break the loop

  // FETCH ON LOAD
  useEffect(() => {
    // If there's no user (logged out), we are technically "loaded" with empty data
    if (!user) {
      setIsLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        if (data) setTransactions(data);
      } catch (error) {
        console.error("Error loading expenses:", error.message);
      } finally {
        // This ensures that even if there is an error, the loading screen disappears
        setIsLoaded(true);
      }
    };

    load();
  }, [user]);

  // ADD
  const addTransaction = async (tx) => {
    if (!user) return;
    
    const newTx = { 
      user_id: user.id, 
      amount: parseFloat(tx.amount), 
      category: tx.category, 
      type: tx.type || 'EXPENSE',
      date: new Date().toISOString() 
    };
    
    const tempId = Date.now();
    setTransactions([{ ...newTx, id: tempId }, ...transactions]);

    const { data, error } = await supabase.from('transactions').insert([newTx]).select();
    
    if (data) {
      setTransactions(prev => prev.map(t => t.id === tempId ? data[0] : t));
    }
    if (error) console.error("Sync error:", error);
  };

  // DELETE
  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.error("Delete error:", error);
  };

  // Ensure isLoaded is returned so Home.jsx can see it
  return { 
    transactions, 
    budgetLimit, 
    setBudgetLimit, 
    addTransaction, 
    deleteTransaction, 
    isLoaded 
  };
}