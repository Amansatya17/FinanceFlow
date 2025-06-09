"use client";

import { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, ShoppingCart } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Expense, Category } from "@/types";
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
} from "@/components/ui/alert-dialog"

const initialExpenses: Expense[] = [];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", initialExpenses);
  const [categories] = useLocalStorage<Category[]>("categories", defaultCategories);
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense> | null>(null);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const openModal = (expense?: Expense) => {
    if (expense) {
      setCurrentExpense(expense);
      setAmount(String(expense.amount));
      setCategoryId(expense.categoryId);
      setDate(expense.date);
      setDescription(expense.description || '');
    } else {
      setCurrentExpense({});
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const newExpense: Expense = {
      id: currentExpense?.id || crypto.randomUUID(),
      amount: parseFloat(amount),
      categoryId,
      date,
      description,
    };

    if (currentExpense?.id) {
      setExpenses(prev => prev.map(exp => exp.id === newExpense.id ? newExpense : exp));
      toast({ title: "Success", description: "Expense updated successfully." });
    } else {
      setExpenses(prev => [...prev, newExpense]);
      toast({ title: "Success", description: "Expense added successfully." });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast({ title: "Success", description: "Expense deleted successfully." });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || "N/A";
  }

  return (
    <AppShell>
      <PageHeader
        title="Manage Expenses"
        description="Track and categorize your spending."
        action={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentExpense?.id ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                <DialogDescription>
                  {currentExpense?.id ? 'Update the details of your expense.' : 'Enter the details of your new expense.'}
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
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Lunch with clients" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{currentExpense?.id ? 'Save Changes' : 'Add Expense'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
          <CardDescription>View and manage your recorded expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No expenses recorded yet.</p>
              <p className="text-sm text-muted-foreground">Click "Add Expense" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                    <th className="text-center p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="p-3">{expense.description || "-"}</td>
                      <td className="p-3">{getCategoryName(expense.categoryId)}</td>
                      <td className="p-3 text-right">{formatCurrency(expense.amount)}</td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="icon" onClick={() => openModal(expense)} className="mr-2">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this expense.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
