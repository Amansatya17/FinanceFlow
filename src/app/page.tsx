"use client";

import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/common/PageHeader";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DollarSign, TrendingUp, TrendingDown, ListChecks } from 'lucide-react';
import Image from 'next/image';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Expense, Income, Budget, Category, FinancialSummary } from "@/types";
import { defaultCategories } from "@/data/categories";
import { useEffect, useState, useMemo } from "react";

const initialExpenses: Expense[] = [];
const initialIncomes: Income[] = [];
const initialBudgets: Budget[] = [];

export default function DashboardPage() {
  const [expenses] = useLocalStorage<Expense[]>("expenses", initialExpenses);
  const [incomes] = useLocalStorage<Income[]>("incomes", initialIncomes);
  const [budgets] = useLocalStorage<Budget[]>("budgets", initialBudgets);
  const [categories] = useLocalStorage<Category[]>("categories", defaultCategories);

  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });

  useEffect(() => {
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    setSummary({ totalIncome, totalExpenses, netBalance });
  }, [expenses, incomes]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const expenseByCategory = useMemo(() => {
    const dataMap = new Map<string, number>();
    expenses.forEach(exp => {
      const category = categories.find(cat => cat.id === exp.categoryId);
      const categoryName = category ? category.name : "Uncategorized";
      dataMap.set(categoryName, (dataMap.get(categoryName) || 0) + exp.amount);
    });
    return Array.from(dataMap, ([name, value]) => ({ name, value }));
  }, [expenses, categories]);

  const budgetStatusData = useMemo(() => {
    return budgets.map(budget => {
      const category = categories.find(cat => cat.id === budget.categoryId);
      const categoryName = category ? category.name : "Overall";
      const spent = expenses
        .filter(exp => exp.categoryId === budget.categoryId)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return {
        name: categoryName,
        budgeted: budget.amount,
        spent: spent,
        remaining: budget.amount - spent,
      };
    });
  }, [budgets, expenses, categories]);


  return (
    <AppShell>
      <PageHeader title="Dashboard" description="Welcome back! Here's your financial overview." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <SummaryCard title="Total Income" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} trend="+2.5% this month" trendColor="text-green-600" />
        <SummaryCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} trend="-1.2% this month" trendColor="text-red-600" />
        <SummaryCard title="Net Balance" value={formatCurrency(summary.netBalance)} icon={DollarSign} />
        <SummaryCard title="Budgets Active" value={budgets.length} icon={ListChecks} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>How your expenses are distributed.</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={defaultCategories.find(c => c.name === entry.name)?.color || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <BarChart className="w-16 h-16 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No expense data available yet.</p>
                <p className="text-sm text-muted-foreground">Add some expenses to see your spending breakdown.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Budget vs. Actual Spending</CardTitle>
            <CardDescription>Track your spending against your budget goals.</CardDescription>
          </CardHeader>
          <CardContent>
             {budgetStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={budgetStatusData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                 <Image src="https://placehold.co/300x200.png" alt="Placeholder chart" width={150} height={100} data-ai-hint="chart graph" className="opacity-50 mb-4 rounded-md" />
                <p className="text-muted-foreground">No budget data to display.</p>
                <p className="text-sm text-muted-foreground">Set up your budgets to see this chart.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for recent transactions */}
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ListChecks className="w-12 h-12 mx-auto mb-2" />
            Recent transactions will appear here.
          </div>
        </CardContent>
      </Card>

    </AppShell>
  );
}
