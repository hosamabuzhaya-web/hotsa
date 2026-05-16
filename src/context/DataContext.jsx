import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount and when auth state changes
  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time changes
    const txSubscription = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
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
      
      const [branchesRes, txRes, empRes, loansRes] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('employees').select('*').order('name'),
        supabase.from('loans').select('*').order('start_date', { ascending: false })
      ]);
      
      if (branchesRes.error) throw branchesRes.error;
      if (txRes.error) throw txRes.error;

      setBranches(branchesRes.data || []);
      setTransactions(txRes.data || []);
      setEmployees(empRes.data || []);
      setLoans(loansRes.data || []);
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

  const addLoan = async (loanData) => {
    try {
      // 1. Insert loan
      const { data: newLoan, error: loanError } = await supabase
        .from('loans')
        .insert([{
          name: loanData.name,
          principal_amount: Number(loanData.principal_amount),
          interest_amount: Number(loanData.interest_amount),
          total_payments: Number(loanData.total_payments),
          start_date: loanData.start_date,
          billing_day: loanData.billing_day ? Number(loanData.billing_day) : null,
          branch_id: loanData.branch_id ? Number(loanData.branch_id) : null
        }])
        .select()
        .single();
        
      if (loanError) throw loanError;

      // 2. Generate future transactions for repayment
      const totalAmount = Number(loanData.principal_amount) + Number(loanData.interest_amount);
      const monthlyPayment = totalAmount / Number(loanData.total_payments);
      
      const transactionsToInsert = [];
      let currentDate = new Date(loanData.start_date);

      for (let i = 1; i <= Number(loanData.total_payments); i++) {
        transactionsToInsert.push({
          date: currentDate.toISOString().split('T')[0],
          amount: monthlyPayment,
          branch_id: loanData.branch_id ? Number(loanData.branch_id) : null,
          category: 'הלוואות בנק',
          type: 'loan_repayment',
          description: `${loanData.name} - תשלום ${i} מתוך ${loanData.total_payments}`,
          loan_id: newLoan.id
        });
        
        // Add 1 month exactly
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // 3. Insert all transactions to cascade into forecasting
      const { error: txError } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);
        
      if (txError) {
        console.error("Failed inserting transactions, deleting loan to rollback", txError);
        await supabase.from('loans').delete().eq('id', newLoan.id);
        throw txError;
      }
      
      fetchData();
    } catch (error) {
      console.error("Error adding loan:", error);
      alert("שגיאה ביצירת ההלוואה. אנא ודא שהרצת את פקודת ה-SQL לעדכון מסד הנתונים.");
    }
  };

  const deleteLoan = async (loanId) => {
    try {
      setLoans(prev => prev.filter(l => l.id !== loanId));
      // This will cascade delete associated transactions in DB if set up correctly
      const { error } = await supabase.from('loans').delete().eq('id', loanId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting loan:", error);
      fetchData();
    }
  };

  const deleteTransaction = async (txId) => {
    try {
      setTransactions(prev => prev.filter(t => t.id !== txId));
      const { error } = await supabase.from('transactions').delete().eq('id', txId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      fetchData();
    }
  };

  const addEmployeesBatch = async (employeesList) => {
    try {
      const { error } = await supabase.from('employees').insert(employeesList);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error adding employees:", error);
    }
  };

  const updateEmployeeBranch = async (employeeId, branchId) => {
    try {
      setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, branch_id: branchId } : emp));
      const { error } = await supabase.from('employees').update({ branch_id: branchId }).eq('id', employeeId);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating employee branch:", error);
      fetchData();
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      const { error } = await supabase.from('employees').delete().eq('id', employeeId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting employee:", error);
      fetchData();
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
    employees,
    loans,
    loading,
    addTransaction,
    deleteTransaction,
    addBranch,
    addLoan,
    deleteLoan,
    addEmployeesBatch,
    updateEmployeeBranch,
    deleteEmployee,
    getDashboardStats,
    refreshData: fetchData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
