import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  validateUIMessages,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai"
import { openai } from "@ai-sdk/openai"
import * as z from "zod"
import {
  calculateIndianTax,
  getTaxSavingSuggestions,
  NEW_REGIME_SLABS,
  DEDUCTION_CATEGORIES,
  EMPLOYMENT_LABELS,
  formatINR,
  type EmploymentType,
} from "@/lib/tax-data"

export const maxDuration = 30

const calculateTaxTool = tool({
  description:
    "Calculate Indian income tax based on gross income and total deductions/expenses. Use this when the user provides their income and expense/deduction information.",
  inputSchema: z.object({
    grossIncome: z
      .number()
      .describe("Total annual gross income in INR"),
    totalDeductions: z
      .number()
      .describe("Total deductions/expenses in INR"),
    employmentType: z
      .enum(["salaried", "business", "freelancer"])
      .describe("Employment type of the user"),
  }),
  async *execute({ grossIncome, totalDeductions, employmentType }) {
    yield { state: "calculating" as const, message: "Calculating your income tax..." }

    await new Promise((resolve) => setTimeout(resolve, 800))

    const result = calculateIndianTax(grossIncome, totalDeductions)
    const suggestions = getTaxSavingSuggestions(grossIncome)

    yield {
      state: "complete" as const,
      ...result,
      grossIncome,
      totalDeductions,
      employmentType,
      employmentLabel: EMPLOYMENT_LABELS[employmentType],
      suggestions,
    }
  },
})

const getDeductionInfoTool = tool({
  description:
    "Get information about available Indian tax deductions and their limits under various sections (80C, 80D, etc.). Use when the user asks about deductions or wants to know how to save tax.",
  inputSchema: z.object({
    section: z
      .string()
      .nullable()
      .describe("Specific section like '80C', '80D', or null for all deductions"),
  }),
  async *execute({ section }) {
    yield { state: "loading" as const }

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (section) {
      const filtered = DEDUCTION_CATEGORIES.filter(
        (d) =>
          d.section.toLowerCase().includes(section.toLowerCase()) ||
          d.id.toLowerCase().includes(section.toLowerCase())
      )
      if (filtered.length > 0) {
        yield { state: "ready" as const, deductions: filtered }
        return
      }
    }

    yield { state: "ready" as const, deductions: DEDUCTION_CATEGORIES }
  },
})

const getTaxSlabsTool = tool({
  description:
    "Show the Indian income tax slabs (default New Regime). Use when the user asks about tax rates, slabs, or brackets.",
  inputSchema: z.object({
    regime: z
      .enum(["new", "old"])
      .describe("Tax regime - 'new' for default new regime, 'old' for old regime"),
  }),
  async *execute({ regime }) {
    yield { state: "loading" as const }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const slabs = NEW_REGIME_SLABS

    yield {
      state: "ready" as const,
      regime,
      regimeLabel: regime === "new" ? "New Tax Regime (Default)" : "Old Tax Regime",
      slabs: slabs.map((s) => ({
        rate: `${s.rate * 100}%`,
        range: s.max
          ? `${formatINR(s.min)} - ${formatINR(s.max)}`
          : `Above ${formatINR(s.min)}`,
      })),
      note:
        regime === "new"
          ? "Rebate under Section 87A: No tax if net income is up to Rs 5,00,000"
          : "Old regime allows deductions under 80C, 80D, HRA, etc.",
    }
  },
})

const getTaxSavingTipsTool = tool({
  description:
    "Provide personalized tax saving suggestions based on the user's income level. Use this after calculating tax or when user asks for saving tips.",
  inputSchema: z.object({
    grossIncome: z.number().describe("User's annual gross income in INR"),
  }),
  async *execute({ grossIncome }) {
    yield { state: "loading" as const }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const suggestions = getTaxSavingSuggestions(grossIncome)

    yield {
      state: "ready" as const,
      grossIncome,
      suggestions,
    }
  },
})

const tools = {
  calculateTax: calculateTaxTool,
  getDeductionInfo: getDeductionInfoTool,
  getTaxSlabs: getTaxSlabsTool,
  getTaxSavingTips: getTaxSavingTipsTool,
} as const

export type TaxChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

const SYSTEM_PROMPT = `You are SmartTax AI, a professional and intelligent tax filing assistant designed to guide users step-by-step through estimating their income tax based on their income and expenses.

Your responsibilities:

1. Collect Required Information
- Ask the user for:
  - Annual gross income
  - Total deductions or expenses
  - Employment type (salaried / business / freelancer)
  - Country of tax filing (default: India unless specified)

2. Calculate Net Taxable Income
- Net Income = Gross Income - Deductions

3. Apply Indian Tax Slabs (Default New Regime)
Use the following slab structure:
  0 - 2,50,000 -> 0%
  2,50,001 - 5,00,000 -> 5%
  5,00,001 - 10,00,000 -> 20%
  Above 10,00,000 -> 30%
Plus 4% Health & Education Cess on total tax.
Rebate under 87A: If net taxable income <= 5,00,000, no tax payable.

4. Provide Results Clearly
Always respond with:
  - Net Taxable Income
  - Estimated Tax Amount
  - Slab breakdown (if applicable)
  - Brief explanation in simple language

5. Provide Tax Saving Suggestions
Based on income level, suggest:
  - Section 80C investments (PPF, ELSS, LIC, EPF)
  - Health insurance (80D)
  - ELSS, PPF, NPS options
  - Other common deductions

6. Conversational Rules
- Be professional but friendly.
- Ask one question at a time.
- Do not assume missing values.
- If numbers are unclear, ask for clarification.
- Always format currency in Indian Rupees with the symbol.
- Always use the tools to compute accurate numbers - never estimate tax amounts manually.

7. Important
- Keep explanations simple and practical.
- If user gives only income and expenses, calculate directly using the calculateTax tool.
- If user asks unrelated question, gently redirect to tax assistance.

Always introduce yourself first as SmartTax AI and start by asking the user about their income and employment type.`

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<TaxChatMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
