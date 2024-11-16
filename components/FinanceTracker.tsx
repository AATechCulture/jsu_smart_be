'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import VoiceInput from './VoiceInput';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  date: string;
  category: string;
  amount: number;
}

const FinanceTracker = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { date: '2024-01-01', category: 'Groceries', amount: -120 },
    { date: '2024-01-02', category: 'Salary', amount: 3000 },
    { date: '2024-01-03', category: 'Entertainment', amount: -50 },
    { date: '2024-01-04', category: 'Utilities', amount: -200 },
    { date: '2024-01-05', category: 'Shopping', amount: -150 },
  ]);

  const [newTransaction, setNewTransaction] = useState<Transaction>({
    date: '',
    category: '',
    amount: 0,
  });

  const [aiAdvice, setAiAdvice] = useState<string[]>([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const categories = [
    'Groceries',
    'Salary',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Transportation',
    'Healthcare',
  ];

  // Calculate metrics
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const income = transactions.reduce((sum, t) => t.amount > 0 ? sum + t.amount : sum, 0);
  const expenses = Math.abs(transactions.reduce((sum, t) => t.amount < 0 ? sum + t.amount : sum, 0));

  const handleNewTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    getAIAdvice();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransaction.date && newTransaction.category && newTransaction.amount) {
      handleNewTransaction(newTransaction);
      setNewTransaction({ date: '', category: '', amount: 0 });
    }
  };

  const getAIAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const income = transactions.reduce((sum, t) => t.amount > 0 ? sum + t.amount : sum, 0);
      const expenses = Math.abs(transactions.reduce((sum, t) => t.amount < 0 ? sum + t.amount : sum, 0));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'financial-advice',  // Specify this is a financial advice request
          transactions,
          totalBalance,
          income,
          expenses
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get AI advice');
      }
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
  
      setAiAdvice(data.advice);
    } catch (error) {
      console.error('Error getting AI advice:', error);
      setAiAdvice(['Unable to generate advice at the moment. Please try again later.']);
    } finally {
      setIsLoadingAdvice(false);
    }
  };
  useEffect(() => {
    getAIAdvice();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${income.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${expenses.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Input</CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceInput onTransactionAdd={handleNewTransaction} />
        </CardContent>
      </Card>

      {/* Manual Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className="border rounded p-2"
                required
              />
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                className="border rounded p-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                  className="border rounded p-2 flex-grow"
                  required
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Transaction Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {typeof window !== 'undefined' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    name="Transaction Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Advice Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              AI Financial Advice
            </div>
            <button
              onClick={getAIAdvice}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
              disabled={isLoadingAdvice}
            >
              {isLoadingAdvice ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Refresh Advice'
              )}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingAdvice ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Analyzing your financial data...</span>
            </div>
          ) : (
            aiAdvice.map((advice, index) => (
              <Alert key={index}>
                <AlertDescription>{advice}</AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceTracker;