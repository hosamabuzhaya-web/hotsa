import React from 'react';
import { useData } from '../context/DataContext';
import { X, TrendingUp, TrendingDown, Users, CreditCard, Landmark, DollarSign } from 'lucide-react';

export default function BranchDetailsModal({ branch, onClose }) {
  const { transactions, employees } = useData();

  if (!branch) return null;

  // Filter branch specific data
  const branchTxs = transactions.filter(t => t.branch_id === branch.id);
  const branchEmployees = employees.filter(e => e.branch_id === branch.id);

  // Group transactions by category
  const expenses = branchTxs.filter(t => t.type === 'expense' || t.type === 'loan_repayment');
  const incomes = branchTxs.filter(t => t.type === 'income');

  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
      <div className="glass-panel w-full max-w-4xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark className="text-primary" />
              {branch.name}
            </h2>
            <span style={{ color: 'var(--text-secondary)' }}>פירוט נתונים מלא לסניף זה</span>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>סך הכנסות</span>
                <TrendingUp size={20} className="text-success" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-success)' }}>{formatCurrency(totalIncome)}</div>
            </div>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>סך הוצאות</span>
                <TrendingDown size={20} className="text-danger" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-danger)' }}>{formatCurrency(totalExpense)}</div>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>רווח נקי סופי</span>
                <DollarSign size={20} className="text-primary" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: netProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {formatCurrency(netProfit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            
            {/* Left Column - Expenses Breakdown */}
            <div>
              <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
                <CreditCard className="text-warning" />
                התפלגות הוצאות
              </h3>
              <div className="space-y-3">
                {Object.keys(expensesByCategory).length === 0 ? (
                  <div className="text-secondary py-4 text-center">אין נתוני הוצאות לסניף זה.</div>
                ) : (
                  Object.entries(expensesByCategory)
                    .sort((a, b) => b[1] - a[1]) // Sort by amount descending
                    .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{category}</span>
                      <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>{formatCurrency(amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Employees */}
            <div>
              <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
                <Users className="text-primary" />
                מצבת עובדים לסניף ({branchEmployees.length})
              </h3>
              <div className="space-y-3" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {branchEmployees.length === 0 ? (
                  <div className="text-secondary py-4 text-center">לא שויכו עובדים לסניף זה.</div>
                ) : (
                  branchEmployees.map(emp => (
                    <div key={emp.id} className="flex justify-between items-center p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{emp.name}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
