import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount and when auth state changes
  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time changes
    const txSubscription = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchData(); // Simplest approach: refetch all on any change
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(txSubscription);
    };
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [branchesRes, txRes] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('transactions').select('*').order('date', { ascending: false })
      ]);
      
      if (branchesRes.error) throw branchesRes.error;
      if (txRes.error) throw txRes.error;

      setBranches(branchesRes.data || []);
      setTransactions(txRes.data || []);
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      // Optimitic update
      const tempId = Date.now();
      const optimisticTx = { ...transaction, id: tempId };
      setTransactions(prev => [optimisticTx, ...prev]);

      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();
        
      if (error) {
        // Revert optimistic update
        setTransactions(prev => prev.filter(t => t.id !== tempId));
        throw error;
      }
      
      // Update with real ID from DB
      setTransactions(prev => prev.map(t => t.id === tempId ? data : t));
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("שגיאה בהוספת הנתון למערכת. בדוק חיבור לרשת.");
    }
  };

  const addBranch = async (branch) => {
    try {
      const { error } = await supabase.from('branches').insert([branch]);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error adding branch:", error);
    }
  };

  const getDashboardStats = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense' || t.type === 'loan_repayment').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      profitMargin: totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0
    };
  };

  const value = {
    branches,
    transactions,
    loading,
    addTransaction,
    addBranch,
    getDashboardStats,
    refreshData: fetchData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
