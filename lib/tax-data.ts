// 2025 Federal Tax Brackets (Source: IRS Revenue Procedure 2024-40, Tax Foundation)
export type FilingStatus = "single" | "married_jointly" | "head_of_household"

export interface TaxBracket {
  rate: number
  min: number
  max: number | null
}

export const TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48475 },
    { rate: 0.22, min: 48475, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250525 },
    { rate: 0.35, min: 250525, max: 626350 },
    { rate: 0.37, min: 626350, max: null },
  ],
  married_jointly: [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: null },
  ],
  head_of_household: [
    { rate: 0.10, min: 0, max: 17000 },
    { rate: 0.12, min: 17000, max: 64850 },
    { rate: 0.22, min: 64850, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 626350 },
    { rate: 0.37, min: 626350, max: null },
  ],
}

export const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 15000,
  married_jointly: 30000,
  head_of_household: 22500,
}

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  married_jointly: "Married Filing Jointly",
  head_of_household: "Head of Household",
}

// Common deduction categories
export const DEDUCTION_CATEGORIES = [
  { id: "mortgage_interest", label: "Mortgage Interest", maxDeduction: null },
  { id: "state_local_taxes", label: "State & Local Taxes (SALT)", maxDeduction: 10000 },
  { id: "charitable", label: "Charitable Contributions", maxDeduction: null },
  { id: "medical", label: "Medical Expenses (over 7.5% AGI)", maxDeduction: null },
  { id: "student_loan_interest", label: "Student Loan Interest", maxDeduction: 2500 },
  { id: "educator_expenses", label: "Educator Expenses", maxDeduction: 300 },
  { id: "hsa_contributions", label: "HSA Contributions", maxDeduction: null },
  { id: "retirement_401k", label: "401(k) Contributions", maxDeduction: 23500 },
  { id: "ira_contributions", label: "IRA Contributions", maxDeduction: 7000 },
] as const

export function calculateFederalTax(
  grossIncome: number,
  filingStatus: FilingStatus,
  totalDeductions: number,
  useItemized: boolean
): {
  taxableIncome: number
  totalTax: number
  effectiveRate: number
  marginalRate: number
  deductionUsed: number
  deductionType: string
  bracketBreakdown: { rate: number; taxableAtRate: number; taxAtRate: number }[]
} {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus]
  const useStandard = !useItemized || totalDeductions <= standardDeduction
  const deductionUsed = useStandard ? standardDeduction : totalDeductions
  const deductionType = useStandard ? "Standard" : "Itemized"

  const taxableIncome = Math.max(0, grossIncome - deductionUsed)
  const brackets = TAX_BRACKETS[filingStatus]

  let totalTax = 0
  let marginalRate = 0.10
  const bracketBreakdown: { rate: number; taxableAtRate: number; taxAtRate: number }[] = []

  for (const bracket of brackets) {
    const upper = bracket.max ?? Infinity
    if (taxableIncome <= bracket.min) break

    const taxableAtRate = Math.min(taxableIncome, upper) - bracket.min
    const taxAtRate = taxableAtRate * bracket.rate

    bracketBreakdown.push({
      rate: bracket.rate,
      taxableAtRate: Math.round(taxableAtRate * 100) / 100,
      taxAtRate: Math.round(taxAtRate * 100) / 100,
    })

    totalTax += taxAtRate
    marginalRate = bracket.rate
  }

  const effectiveRate = taxableIncome > 0 ? (totalTax / grossIncome) * 100 : 0

  return {
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate: marginalRate * 100,
    deductionUsed: Math.round(deductionUsed * 100) / 100,
    deductionType,
    bracketBreakdown,
  }
}

// EITC simplified calculation
export function calculateEITC(
  earnedIncome: number,
  filingStatus: FilingStatus,
  numChildren: number
): number {
  const maxCredits = [649, 4328, 7152, 8046]
  const maxCredit = maxCredits[Math.min(numChildren, 3)]

  // Simplified phaseout
  const phaseoutStart =
    filingStatus === "married_jointly"
      ? [17730, 30470, 30470, 30470]
      : [10620, 23350, 23350, 23350]

  const phaseoutEnd =
    filingStatus === "married_jointly"
      ? [26214, 57554, 64430, 68675]
      : [19104, 50434, 57310, 61555]

  const idx = Math.min(numChildren, 3)
  if (earnedIncome >= phaseoutEnd[idx]) return 0
  if (earnedIncome <= phaseoutStart[idx]) return maxCredit

  const phaseoutRate =
    maxCredit / (phaseoutEnd[idx] - phaseoutStart[idx])
  const reduction = (earnedIncome - phaseoutStart[idx]) * phaseoutRate

  return Math.max(0, Math.round((maxCredit - reduction) * 100) / 100)
}

// Child tax credit
export function calculateChildTaxCredit(numChildren: number): number {
  return numChildren * 2000
}
