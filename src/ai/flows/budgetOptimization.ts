
// budget-optimization.ts
'use server';

/**
 * @fileOverview Budget optimization flow that analyzes past spending and financial goals to suggest an optimized budget allocation.
 *
 * - optimizeBudget - A function that takes in past spending data and financial goals and returns suggested budget allocations.
 * - OptimizeBudgetInput - The input type for the optimizeBudget function.
 * - OptimizeBudgetOutput - The return type for the optimizeBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeBudgetInputSchema = z.object({
  pastSpending: z.record(z.number()).describe('A record of past spending, with keys as spending categories and values as amounts spent.'),
  financialGoals: z.string().describe('A description of the user’s financial goals.'),
});
export type OptimizeBudgetInput = z.infer<typeof OptimizeBudgetInputSchema>;

const OptimizeBudgetOutputSchema = z.record(z.number()).describe('Suggested budget allocations for each category, with keys as spending categories and values as allocated amounts.');
export type OptimizeBudgetOutput = z.infer<typeof OptimizeBudgetOutputSchema>;

export async function optimizeBudget(input: OptimizeBudgetInput): Promise<OptimizeBudgetOutput> {
  return optimizeBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeBudgetPrompt',
  input: {schema: OptimizeBudgetInputSchema},
  output: {schema: OptimizeBudgetOutputSchema},
  prompt: `You are a financial advisor. Analyze the user's past spending and financial goals to suggest an optimized budget allocation across different categories.

Past Spending:
{{#each pastSpending}}{{{@key}}}: ${'$'}{{{this}}}
{{/each}}

Financial Goals: {{{financialGoals}}}

Based on this information, suggest a budget allocation for each category.  The total of all categories should not exceed the user's income.  The suggested budget allocation should be formatted as a JSON object where the keys are the spending categories and the values are the suggested budget amounts.
`,
});

const optimizeBudgetFlow = ai.defineFlow(
  {
    name: 'optimizeBudgetFlow',
    inputSchema: OptimizeBudgetInputSchema,
    outputSchema: OptimizeBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
