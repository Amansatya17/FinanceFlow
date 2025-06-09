"use client";

import { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit3, Trash2, Briefcase, AlertTriangle } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Budget, Category, Expense } from "@/types";
import { defaultCategories } from "@/data/categories";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const initialBudgets: Budget[] = [];
const initialExpenses: Expense[] = [];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useLocalStorage<Budget[]>("budgets", initialBudgets);
  const [expenses] = useLocalStorage<Expense[]>("expenses", initialExpenses);
  const [categories] = useLocalStorage<Category[]>("categories", defaultCategories);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const openModal = (budget?: Budget) => {
    if (budget) {
      setCurrentBudget(budget);
      setAmount(String(budget.amount));
      setCategoryId(budget.categoryId);
      setPeriod(budget.period);
      setStartDate(budget.startDate);
    } else {
      setCurrentBudget({});
      setAmount('');
      setCategoryId('');
      setPeriod('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBudget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !startDate) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const newBudget: Budget = {
      id: currentBudget?.id || crypto.randomUUID(),
      amount: parseFloat(amount),
      categoryId,
      period,
      startDate,
    };

    if (currentBudget?.id) {
      setBudgets(prev => prev.map(b => b.id === newBudget.id ? newBudget : b));
      toast({ title: "Success", description: "Budget updated successfully." });
    } else {
      setBudgets(prev => [...prev, newBudget]);
      toast({ title: "Success", description: "Budget added successfully." });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast({ title: "Success", description: "Budget deleted successfully." });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const getCategoryDetails = (catId: string) => {
    return categories.find(c => c.id === catId) || { name: "N/A", icon: Briefcase, color: 'hsl(var(--foreground))' };
  };

  const calculateBudgetProgress = (budget: Budget) => {
    const relevantExpenses = expenses.filter(
      (exp) => exp.categoryId === budget.categoryId &&
               new Date(exp.date) >= new Date(budget.startDate)
    );
    const totalSpent = relevantExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const progress = (totalSpent / budget.amount) * 100;
    const isOverBudget = totalSpent > budget.amount;
    return { totalSpent, progress, isOverBudget };
  };

  return (
    <AppShell>
      <PageHeader
        title="Manage Budgets"
        description="Set and track your financial goals."
        action={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentBudget?.id ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
                <DialogDescription>
                  {currentBudget?.id ? 'Update the details of your budget.' : 'Enter the details for your new budget goal.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== 'income').map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="period" className="text-right">Period</Label>
                    <Select value={period} onValueChange={(val) => setPeriod(val as 'monthly' | 'yearly')} required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">Start Date</Label>
                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline" onClick={closeModal}>Cancel</Button></DialogClose>
                  <Button type="submit">{currentBudget?.id ? 'Save Changes' : 'Add Budget'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {budgets.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-10">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No budgets set yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Budget" to create your financial goals.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map(budget => {
            const categoryDetails = getCategoryDetails(budget.categoryId);
            const { totalSpent, progress, isOverBudget } = calculateBudgetProgress(budget);
            const CategoryIcon = categoryDetails.icon;
            return (
              <Card key={budget.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <CategoryIcon className="h-6 w-6" style={{color: categoryDetails.color || 'hsl(var(--foreground))'}} />
                       <CardTitle>{categoryDetails.name}</CardTitle>
                    </div>
                    {isOverBudget && <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Over Budget</Badge>}
                  </div>
                  <CardDescription>
                    {formatCurrency(budget.amount)} per {budget.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spent: {formatCurrency(totalSpent)}</span>
                      <span>Remaining: {formatCurrency(Math.max(0, budget.amount - totalSpent))}</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className={isOverBudget ? "[&>div]:bg-destructive" : ""} />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => openModal(budget)}>
                      <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="bg-destructive hover:bg-destructive/90">
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this budget.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(budget.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
