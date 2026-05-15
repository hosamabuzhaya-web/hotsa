import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, Calculator, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Forecasting() {
  const { transactions, getDashboardStats } = useData();
  const stats = getDashboardStats();
  
  const [monthsAhead, setMonthsAhead] = useState(3);

  // Calculate monthly averages based on existing data
  const calculateAverages = () => {
    // In a real scenario, this would aggregate past months. 
    // Here we use the total numbers (assuming they represent 1 month of mock data)
    const avgIncome = stats.totalIncome;
    const avgExpenses = stats.totalExpenses;
    
    // Fixed expenses (rent, loans, etc.) vs Variable
    const fixedExpenses = transactions
      .filter(t => t.category === 'שכירות' || t.category === 'ארנונה' || t.type === 'loan_repayment' || t.category === 'משכורות')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const variableExpenses = avgExpenses - fixedExpenses;

    return { avgIncome, fixedExpenses, variableExpenses };
  };

  const averages = calculateAverages();

  // Generate forecast data
  const generateForecastData = () => {
    const data = [];
    let currentBalance = stats.balance;
    const currentMonth = new Date().getMonth(); // 0-11
    
    const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    // Add current month state
    data.push({
      name: monthNames[currentMonth],
      תזרים_משוער: currentBalance,
      הכנסות_צפויות: averages.avgIncome,
      הוצאות_צפויות: averages.fixedExpenses + averages.variableExpenses
    });

    // Project future months
    for (let i = 1; i <= monthsAhead; i++) {
      const futureMonthIndex = (currentMonth + i) % 12;
      
      // Simulate slight variations (e.g. 2% growth in income, 1% growth in variable expenses)
      const projectedIncome = averages.avgIncome * Math.pow(1.02, i);
      const projectedVariable = averages.variableExpenses * Math.pow(1.01, i);
      const projectedExpenses = averages.fixedExpenses + projectedVariable;
      
      currentBalance += (projectedIncome - projectedExpenses);

      data.push({
        name: monthNames[futureMonthIndex],
        תזרים_משוער: Math.round(currentBalance),
        הכנסות_צפויות: Math.round(projectedIncome),
        הוצאות_צפויות: Math.round(projectedExpenses)
      });
    }

    return data;
  };

  const forecastData = generateForecastData();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>תכנון תזרים עתידי (Forecasting)</h2>
          <p style={{ color: 'var(--text-secondary)' }}>אלגוריתם תחזית המבוסס על ממוצע הכנסות והוצאות קבועות.</p>
        </div>
        <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>הצג תחזית ל-</span>
          <select 
            value={monthsAhead} 
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none' }}
          >
            <option style={{color: 'black'}} value={3}>3 חודשים</option>
            <option style={{color: 'black'}} value={6}>6 חודשים</option>
            <option style={{color: 'black'}} value={12}>12 חודשים</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>הכנסה ממוצעת חזויה (לחודש)</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>
            {formatCurrency(averages.avgIncome)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>הוצאות קבועות (ברזל)</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
            {formatCurrency(averages.fixedExpenses)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>שכירות, ארנונה, הלוואות, משכורות</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>תזרים משוער לעוד {monthsAhead} חודשים</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: forecastData[forecastData.length - 1].תזרים_משוער > 0 ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
            {formatCurrency(forecastData[forecastData.length - 1].תזרים_משוער)}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
        <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
          <LineChartIcon className="text-primary" />
          גרף צפי תזרים מזומנים מול הכנסות והוצאות
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="תזרים_משוער" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="הכנסות_צפויות" stroke="var(--accent-success)" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="הוצאות_צפויות" stroke="var(--accent-danger)" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
