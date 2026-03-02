// Indian Income Tax Slabs (New Regime - Default, FY 2025-26)
export type EmploymentType = "salaried" | "business" | "freelancer"

export interface TaxSlab {
  rate: number
  min: number
  max: number | null
}

// New Tax Regime (Default)
export const NEW_REGIME_SLABS: TaxSlab[] = [
  { rate: 0.00, min: 0, max: 250000 },
  { rate: 0.05, min: 250001, max: 500000 },
  { rate: 0.20, min: 500001, max: 1000000 },
  { rate: 0.30, min: 1000001, max: null },
]

// Old Tax Regime
export const OLD_REGIME_SLABS: TaxSlab[] = [
  { rate: 0.00, min: 0, max: 250000 },
  { rate: 0.05, min: 250001, max: 500000 },
  { rate: 0.20, min: 500001, max: 1000000 },
  { rate: 0.30, min: 1000001, max: null },
]

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  salaried: "Salaried",
  business: "Business",
  freelancer: "Freelancer",
}

// Common Indian deductions
export const DEDUCTION_CATEGORIES = [
  {
    id: "80c",
    section: "80C",
    label: "Investments (PPF, ELSS, LIC, NSC, 5-yr FD, etc.)",
    maxDeduction: 150000,
    description: "Most popular deduction. Includes EPF, PPF, ELSS, life insurance premiums, tuition fees, NSC, and more.",
  },
  {
    id: "80d_self",
    section: "80D",
    label: "Health Insurance Premium (Self & Family)",
    maxDeduction: 25000,
    description: "Premium paid for self, spouse, and dependent children. Rs 50,000 if you are a senior citizen.",
  },
  {
    id: "80d_parents",
    section: "80D",
    label: "Health Insurance Premium (Parents)",
    maxDeduction: 50000,
    description: "Premium for parents. Rs 25,000 if parents are below 60, Rs 50,000 if senior citizens.",
  },
  {
    id: "80ccd_nps",
    section: "80CCD(1B)",
    label: "NPS Contribution (Additional)",
    maxDeduction: 50000,
    description: "Additional deduction for NPS contributions over and above 80C limit.",
  },
  {
    id: "80e",
    section: "80E",
    label: "Education Loan Interest",
    maxDeduction: null,
    description: "Interest paid on education loan for higher studies. No upper limit, available for up to 8 years.",
  },
  {
    id: "80tta",
    section: "80TTA",
    label: "Savings Account Interest",
    maxDeduction: 10000,
    description: "Interest earned on savings bank account (not FD). Rs 50,000 for senior citizens under 80TTB.",
  },
  {
    id: "hra",
    section: "HRA",
    label: "House Rent Allowance",
    maxDeduction: null,
    description: "Exemption under section 10(13A) for salaried individuals paying rent. Calculation depends on salary, rent paid, and city.",
  },
  {
    id: "standard_deduction",
    section: "Sec 16",
    label: "Standard Deduction (Salaried)",
    maxDeduction: 50000,
    description: "Flat deduction of Rs 50,000 for salaried employees under old regime.",
  },
] as const

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateIndianTax(
  grossIncome: number,
  totalDeductions: number,
): {
  netTaxableIncome: number
  totalTax: number
  effectiveRate: number
  cess: number
  taxBeforeCess: number
  slabBreakdown: { rate: number; taxableAtRate: number; taxAtRate: number; range: string }[]
} {
  const netTaxableIncome = Math.max(0, grossIncome - totalDeductions)
  const slabs = NEW_REGIME_SLABS

  let taxBeforeCess = 0
  const slabBreakdown: { rate: number; taxableAtRate: number; taxAtRate: number; range: string }[] = []

  for (const slab of slabs) {
    const upper = slab.max ?? Infinity
    if (netTaxableIncome <= slab.min) break

    const taxableAtRate = Math.min(netTaxableIncome, upper) - slab.min
    const taxAtRate = taxableAtRate * slab.rate

    slabBreakdown.push({
      rate: slab.rate,
      taxableAtRate: Math.round(taxableAtRate),
      taxAtRate: Math.round(taxAtRate),
      range: slab.max
        ? `${formatINR(slab.min)} - ${formatINR(slab.max)}`
        : `Above ${formatINR(slab.min)}`,
    })

    taxBeforeCess += taxAtRate
  }

  // Tax rebate under 87A: If net taxable income <= 5,00,000 then full rebate
  if (netTaxableIncome <= 500000) {
    taxBeforeCess = 0
    // Clear slab breakdown tax amounts since rebate applies
    slabBreakdown.forEach((s) => (s.taxAtRate = 0))
  }

  // Health & Education Cess = 4%
  const cess = Math.round(taxBeforeCess * 0.04)
  const totalTax = Math.round(taxBeforeCess + cess)
  const effectiveRate = grossIncome > 0 ? Math.round((totalTax / grossIncome) * 10000) / 100 : 0

  return {
    netTaxableIncome: Math.round(netTaxableIncome),
    totalTax,
    effectiveRate,
    cess,
    taxBeforeCess: Math.round(taxBeforeCess),
    slabBreakdown,
  }
}

// Tax saving suggestions based on income level
export function getTaxSavingSuggestions(grossIncome: number): string[] {
  const suggestions: string[] = []
  suggestions.push("Invest up to Rs 1.5 lakh under Section 80C (PPF, ELSS, LIC, EPF)")
  suggestions.push("Get health insurance for self & family (Section 80D - up to Rs 25,000)")

  if (grossIncome > 500000) {
    suggestions.push("Consider NPS contribution for additional Rs 50,000 deduction under 80CCD(1B)")
    suggestions.push("Claim HRA exemption if you are salaried and paying rent")
  }
  if (grossIncome > 1000000) {
    suggestions.push("Explore ELSS mutual funds for tax-efficient investing with 3-year lock-in")
    suggestions.push("Consider health insurance for parents (Section 80D - up to Rs 50,000 for senior citizen parents)")
  }
  if (grossIncome > 1500000) {
    suggestions.push("Review if Old Regime with full deductions gives you a lower tax than New Regime")
  }

  return suggestions
}
