"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, BarChart2 } from "lucide-react";
import { getOptimizedBudget } from '@/lib/actions';
import type { OptimizeBudgetOutput } from '@/ai/flows/budget-optimization'; // Removed PastSpending as it's not used directly here
import type { PastSpending } from '@/types'; // Import PastSpending from global types
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Expense, Category } from "@/types";
import { defaultCategories } from "@/data/categories";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';

const initialExpenses: Expense[] = [];

export default function BudgetOptimizer() {
  const [expenses] = useLocalStorage<Expense[]>("expenses", initialExpenses);
  const [categories] = useLocalStorage<Category[]>("categories", defaultCategories);

  const [financialGoals, setFinancialGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedBudget, setOptimizedBudget] = useState<OptimizeBudgetOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useTrackedExpenses, setUseTrackedExpenses] = useState(true);
  const [manualPastSpending, setManualPastSpending] = useState<PastSpending>({});

  const pastSpendingFromExpenses = useMemo(() => {
    const spending: PastSpending = {};
    expenses.forEach(exp => {
      const categoryName = categories.find(c => c.id === exp.categoryId)?.name || 'Other';
      spending[categoryName] = (spending[categoryName] || 0) + exp.amount;
    });
    return spending;
  }, [expenses, categories]);

  useEffect(() => {
    if (useTrackedExpenses) {
      setManualPastSpending({}); // Clear manual input if using tracked expenses
    }
  }, [useTrackedExpenses]);

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    setOptimizedBudget(null);

    let pastSpendingData: PastSpending;
    if (useTrackedExpenses) {
      if (Object.keys(pastSpendingFromExpenses).length === 0) {
         setError("No tracked expenses found. Please add some expenses or provide past spending manually.");
         setIsLoading(false);
         return;
      }
      pastSpendingData = pastSpendingFromExpenses;
    } else {
      // Basic validation for manual input (e.g., parse from a textarea or structured inputs)
      // For simplicity, we'll assume manualPastSpending is populated correctly if useTrackedExpenses is false.
      // In a real app, you'd have input fields for manualPastSpending.
      // For this version, if manual is selected and empty, we'll provide a default example.
      if (Object.keys(manualPastSpending).length === 0) {
        console.warn("Manual past spending is empty. Using a default example for AI.");
        pastSpendingData = { "Groceries": 300, "Dining Out": 150, "Entertainment": 100, "Transport": 80 };
      } else {
        pastSpendingData = manualPastSpending;
      }
    }

    if (!financialGoals.trim()) {
      setError("Please describe your financial goals.");
      setIsLoading(false);
      return;
    }

    const input = {
      pastSpending: pastSpendingData,
      financialGoals,
    };

    const result = await getOptimizedBudget(input);

    if ('error' in result) {
      setError(result.error);
    } else {
      setOptimizedBudget(result);
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const optimizedBudgetDataForChart = useMemo(() => {
    if (!optimizedBudget) return [];
    return Object.entries(optimizedBudget).map(([name, value]) => ({ name, value }));
  }, [optimizedBudget]);

  // Example for manual input field (very basic)
  const handleManualSpendingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        // Basic check if it's an object of category:amount
        const isValid = Object.entries(parsed).every(([key, value]) => typeof key === 'string' && typeof value === 'number');
        if (isValid) {
          setManualPastSpending(parsed);
          setError(null);
        } else {
          throw new Error("Invalid format. Must be { 'Category': amount }.");
        }
      } else {
        throw new Error("Invalid JSON format.");
      }
    } catch (err: any) {
      setError("Error parsing manual spending: " + err.message + ". Use JSON like: {\"Groceries\": 200, \"Rent\": 1000}");
    }
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent" /> AI Budget Optimizer</CardTitle>
        <CardDescription>
          Let AI help you create a smarter budget. Provide your past spending (or use tracked data) and financial goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="financialGoals">Financial Goals</Label>
          <Textarea
            id="financialGoals"
            value={financialGoals}
            onChange={(e) => setFinancialGoals(e.target.value)}
            placeholder="e.g., Save for a down payment, reduce debt, invest more..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label>Past Spending Data</Label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="checkbox"
              id="useTrackedExpenses"
              checked={useTrackedExpenses}
              onChange={(e) => setUseTrackedExpenses(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
            />
            <Label htmlFor="useTrackedExpenses" className="font-normal">Use my tracked expenses in FinanceFlow</Label>
          </div>
           {!useTrackedExpenses && (
            <div className="mt-2 space-y-2">
              <Label htmlFor="manualPastSpendingInput">Manual Past Spending (JSON format)</Label>
              <Textarea
                id="manualPastSpendingInput"
                placeholder='e.g., {"Groceries": 300, "Rent": 1200, "Entertainment": 150}'
                onChange={handleManualSpendingChange}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Enter spending as a JSON object, like: <code className="bg-muted px-1 rounded">{`{"Food": 250, "Utilities": 100}`}</code>
              </p>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleOptimize} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Optimize My Budget
        </Button>
      </CardFooter>

      {optimizedBudget && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 /> Suggested Budget Allocation</CardTitle>
            <CardDescription>Here's what our AI suggests for your budget:</CardDescription>
          </CardHeader>
          <CardContent>
            {optimizedBudgetDataForChart.length > 0 ? (
               <ResponsiveContainer width="100%" height={300}>
                <BarChart data={optimizedBudgetDataForChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} interval={0} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" name="Suggested Amount" radius={[0, 4, 4, 0]}>
                    {optimizedBudgetDataForChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categories.find(c=>c.name === entry.name)?.color || defaultCategories.find(c=>c.id === 'other')?.color || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <p>No budget suggestions available.</p>
            )}
            <ul className="mt-4 space-y-2">
              {Object.entries(optimizedBudget).map(([category, amount]) => (
                <li key={category} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                  <span className="font-medium">{category}</span>
                  <span className="text-primary font-semibold">{formatCurrency(amount)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
