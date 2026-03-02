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
import * as z from "zod"
import {
  calculateFederalTax,
  calculateEITC,
  calculateChildTaxCredit,
  STANDARD_DEDUCTIONS,
  FILING_STATUS_LABELS,
  TAX_BRACKETS,
  DEDUCTION_CATEGORIES,
  type FilingStatus,
} from "@/lib/tax-data"

export const maxDuration = 30

const calculateTaxTool = tool({
  description:
    "Calculate federal income tax based on gross income, filing status, and deductions. Use this when the user provides their income and filing information.",
  inputSchema: z.object({
    grossIncome: z.number().describe("Total gross annual income in USD"),
    filingStatus: z
      .enum(["single", "married_jointly", "head_of_household"])
      .describe("Tax filing status"),
    deductions: z
      .number()
      .describe("Total itemized deductions in USD, 0 to use standard deduction"),
    useItemized: z
      .boolean()
      .describe("Whether to use itemized deductions instead of standard"),
  }),
  async *execute({ grossIncome, filingStatus, deductions, useItemized }) {
    yield { state: "calculating" as const, message: "Calculating your federal tax..." }

    await new Promise((resolve) => setTimeout(resolve, 800))

    const result = calculateFederalTax(grossIncome, filingStatus, deductions, useItemized)

    yield {
      state: "complete" as const,
      ...result,
      grossIncome,
      filingStatus,
      filingStatusLabel: FILING_STATUS_LABELS[filingStatus],
    }
  },
})

const getDeductionInfoTool = tool({
  description:
    "Get information about available tax deductions and their limits. Use this when the user asks about deductions or wants to know what they can deduct.",
  inputSchema: z.object({
    category: z
      .string()
      .nullable()
      .describe("Specific deduction category to get info about, or null for all categories"),
  }),
  async *execute({ category }) {
    yield { state: "loading" as const }

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (category) {
      const found = DEDUCTION_CATEGORIES.find(
        (d) => d.id === category || d.label.toLowerCase().includes(category.toLowerCase())
      )
      if (found) {
        yield {
          state: "ready" as const,
          deductions: [found],
        }
        return
      }
    }

    yield {
      state: "ready" as const,
      deductions: DEDUCTION_CATEGORIES,
    }
  },
})

const getTaxBracketsTool = tool({
  description:
    "Show the 2025 federal income tax brackets for a given filing status. Use this when the user asks about tax rates or brackets.",
  inputSchema: z.object({
    filingStatus: z
      .enum(["single", "married_jointly", "head_of_household"])
      .describe("Filing status to show brackets for"),
  }),
  async *execute({ filingStatus }) {
    yield { state: "loading" as const }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const brackets = TAX_BRACKETS[filingStatus]
    const standardDeduction = STANDARD_DEDUCTIONS[filingStatus]

    yield {
      state: "ready" as const,
      filingStatus,
      filingStatusLabel: FILING_STATUS_LABELS[filingStatus],
      brackets: brackets.map((b) => ({
        rate: `${b.rate * 100}%`,
        range: b.max
          ? `$${b.min.toLocaleString()} - $${b.max.toLocaleString()}`
          : `$${b.min.toLocaleString()}+`,
      })),
      standardDeduction,
    }
  },
})

const calculateCreditsTool = tool({
  description:
    "Calculate available tax credits including EITC and Child Tax Credit. Use this when the user asks about credits or has children.",
  inputSchema: z.object({
    earnedIncome: z.number().describe("Total earned income in USD"),
    filingStatus: z
      .enum(["single", "married_jointly", "head_of_household"])
      .describe("Filing status"),
    numChildren: z.number().describe("Number of qualifying children"),
  }),
  async *execute({ earnedIncome, filingStatus, numChildren }) {
    yield { state: "calculating" as const, message: "Calculating your tax credits..." }

    await new Promise((resolve) => setTimeout(resolve, 600))

    const eitc = calculateEITC(earnedIncome, filingStatus, numChildren)
    const childCredit = calculateChildTaxCredit(numChildren)

    yield {
      state: "complete" as const,
      eitc,
      childCredit,
      totalCredits: eitc + childCredit,
      numChildren,
    }
  },
})

const tools = {
  calculateTax: calculateTaxTool,
  getDeductionInfo: getDeductionInfoTool,
  getTaxBrackets: getTaxBracketsTool,
  calculateCredits: calculateCreditsTool,
} as const

export type TaxChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

const SYSTEM_PROMPT = `You are TaxBot AI, an expert tax filing assistant for U.S. federal taxes (Tax Year 2025). You guide users step-by-step through understanding their tax obligations based on their income and expenses.

Your role:
1. WELCOME the user and ask about their filing status (Single, Married Filing Jointly, Head of Household)
2. ASK about their gross annual income from all sources (wages, freelance, investments, etc.)
3. EXPLORE deductions - ask about common deductions (mortgage interest, SALT, charitable, medical, retirement contributions)
4. CALCULATE their taxes using the calculateTax tool with the gathered information
5. CHECK for applicable tax credits (EITC, Child Tax Credit) by asking about children
6. PROVIDE a comprehensive summary with actionable advice

Guidelines:
- Always use the tools to compute accurate numbers - never estimate tax amounts manually
- Explain concepts in simple, plain language - avoid jargon
- When discussing deductions, compare itemized vs standard and recommend the better option
- Mention important deadlines and tips when relevant
- Remind users this is for educational purposes and suggest consulting a tax professional for complex situations
- Format currency values with $ and commas
- Be warm, encouraging, and patient - many people find taxes stressful

Tax Year: 2025
Standard Deductions: Single $15,000 | Married Filing Jointly $30,000 | Head of Household $22,500
Tax Brackets: 10%, 12%, 22%, 24%, 32%, 35%, 37%

Always introduce yourself first and start by asking the user about their filing situation.`

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<TaxChatMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
