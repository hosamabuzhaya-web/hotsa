import React from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { transactions, getDashboardStats } = useData();
  const stats = getDashboardStats();

  // Process data for charts
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Process monthly data for bar chart (mock for now, grouping by month)
  const monthlyData = [
    { name: 'ינואר', הכנסות: 150000, הוצאות: 90000 },
    { name: 'פברואר', הכנסות: 165000, הוצאות: 95000 },
    { name: 'מרץ', הכנסות: 140000, הוצאות: 110000 },
    { name: 'אפריל', הכנסות: 180000, הוצאות: 105000 },
    { name: 'מאי', הכנסות: stats.totalIncome, הוצאות: stats.totalExpenses },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>יתרת תזרים (מאזן)</h3>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stats.balance >= 0 ? 'var(--text-primary)' : 'var(--accent-danger)' }}>
            {formatCurrency(stats.balance)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>סך הכנסות (חודש נוכחי)</h3>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--accent-success)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>
            {formatCurrency(stats.totalIncome)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>סך הוצאות (חודש נוכחי)</h3>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--accent-danger)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
            {formatCurrency(stats.totalExpenses)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>שולי רווח (%)</h3>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--accent-warning)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
            {stats.profitMargin}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4" style={{ fontSize: '1.2rem' }}>הכנסות מול הוצאות - חצי שנתון</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                />
                <Bar dataKey="הכנסות" fill="var(--accent-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="הוצאות" fill="var(--accent-danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4" style={{ fontSize: '1.2rem' }}>התפלגות הוצאות לפי קטגוריה</h3>
          <div style={{ height: 300 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary">
                אין מספיק נתונים להצגה
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2" style={{ flexWrap: 'wrap' }}>
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
