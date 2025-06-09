"use client";

import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { BarChart, PieChart as PieChartIcon, LineChart } from "lucide-react";
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Expense, Income, Budget, Category } from "@/types";
import { defaultCategories } from "@/data/categories";
import { useMemo } from "react";

const initialExpenses: Expense[] = [];

export default function ReportsPage() {
  const [expenses] = useLocalStorage<Expense[]>("expenses", initialExpenses);
  const [categories] = useLocalStorage<Category[]>("categories", defaultCategories);

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

  const monthlySpending = useMemo(() => {
    const dataMap = new Map<string, number>();
    expenses.forEach(exp => {
      const monthYear = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      dataMap.set(monthYear, (dataMap.get(monthYear) || 0) + exp.amount);
    });
    // Sort by date for line chart
    return Array.from(dataMap, ([name, value]) => ({ name, value }))
                .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [expenses]);


  return (
    <AppShell>
      <PageHeader title="Financial Reports" description="Visualize your spending patterns and budget adherence." />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
            <CardDescription>Breakdown of expenses by category.</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categories.find(c => c.name === entry.name)?.color || '#82ca9d'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] text-center">
                <PieChartIcon className="w-16 h-16 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No data for pie chart.</p>
                <p className="text-sm text-muted-foreground">Add expenses to see distribution.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Track your total expenses over time.</CardDescription>
          </CardHeader>
          <CardContent>
             {monthlySpending.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <RechartsLineChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Total Spending" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] text-center">
                <LineChart className="w-16 h-16 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No data for spending trend.</p>
                 <p className="text-sm text-muted-foreground">Record expenses over time to see trends.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for more charts like category bar chart, income vs expense etc. */}
      <Card className="mt-6 shadow-lg">
        <CardHeader>
            <CardTitle>Additional Reports</CardTitle>
            <CardDescription>More detailed financial insights.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <BarChart className="w-16 h-16 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">More charts and reports coming soon.</p>
            </div>
        </CardContent>
      </Card>

    </AppShell>
  );
}
