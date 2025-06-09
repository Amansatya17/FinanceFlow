"use client";

import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/common/PageHeader";
import BudgetOptimizer from "@/components/optimize/BudgetOptimizer";

export default function OptimizeBudgetPage() {
  return (
    <AppShell>
      <PageHeader
        title="Budget Optimization AI"
        description="Leverage AI to analyze your spending and goals for a smarter budget."
      />
      <div className="flex justify-center">
        <BudgetOptimizer />
      </div>
    </AppShell>
  );
}
