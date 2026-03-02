"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  Receipt,
  Award,
  Loader2,
} from "lucide-react"

// Tax Calculation Result Card
export function TaxResultCard({
  data,
}: {
  data: {
    state: string
    grossIncome?: number
    taxableIncome?: number
    totalTax?: number
    effectiveRate?: number
    marginalRate?: number
    deductionUsed?: number
    deductionType?: string
    filingStatusLabel?: string
    bracketBreakdown?: { rate: number; taxableAtRate: number; taxAtRate: number }[]
    message?: string
  }
}) {
  if (data.state === "calculating") {
    return (
      <Card className="my-3 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  if (data.state !== "complete") return null

  const takeHome = (data.grossIncome ?? 0) - (data.totalTax ?? 0)

  return (
    <Card className="my-3 border-primary/20 overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5 text-primary" />
            Tax Calculation Summary
          </CardTitle>
          <Badge variant="secondary">{data.filingStatusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox
            icon={<DollarSign className="h-4 w-4" />}
            label="Gross Income"
            value={formatCurrency(data.grossIncome ?? 0)}
          />
          <MetricBox
            icon={<FileText className="h-4 w-4" />}
            label={`${data.deductionType} Deduction`}
            value={formatCurrency(data.deductionUsed ?? 0)}
          />
          <MetricBox
            icon={<Receipt className="h-4 w-4" />}
            label="Taxable Income"
            value={formatCurrency(data.taxableIncome ?? 0)}
          />
          <MetricBox
            icon={<TrendingUp className="h-4 w-4" />}
            label="Federal Tax Owed"
            value={formatCurrency(data.totalTax ?? 0)}
            highlight
          />
        </div>

        {/* Rates */}
        <div className="flex gap-4 rounded-lg bg-secondary/50 p-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Effective Rate</p>
            <p className="text-lg font-semibold text-foreground">{data.effectiveRate}%</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Marginal Rate</p>
            <p className="text-lg font-semibold text-foreground">{data.marginalRate}%</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Take-Home</p>
            <p className="text-lg font-semibold text-primary">{formatCurrency(takeHome)}</p>
          </div>
        </div>

        {/* Bracket breakdown */}
        {data.bracketBreakdown && data.bracketBreakdown.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Bracket Breakdown
            </p>
            {data.bracketBreakdown.map((b, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{(b.rate * 100).toFixed(0)}% bracket</span>
                  <span className="font-medium text-foreground">{formatCurrency(b.taxAtRate)}</span>
                </div>
                <Progress
                  value={
                    data.bracketBreakdown
                      ? (b.taxAtRate / Math.max(data.totalTax ?? 1, 1)) * 100
                      : 0
                  }
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Tax Brackets Display Card
export function TaxBracketsCard({
  data,
}: {
  data: {
    state: string
    filingStatusLabel?: string
    brackets?: { rate: string; range: string }[]
    standardDeduction?: number
  }
}) {
  if (data.state === "loading") {
    return (
      <Card className="my-3 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading tax brackets...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-3 border-primary/20 overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            2025 Tax Brackets
          </CardTitle>
          <Badge variant="secondary">{data.filingStatusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-2 bg-secondary/50 p-2.5">
            <span className="text-xs font-medium text-muted-foreground">Rate</span>
            <span className="text-xs font-medium text-muted-foreground">Income Range</span>
          </div>
          {data.brackets?.map((b, i) => (
            <div
              key={i}
              className="grid grid-cols-2 p-2.5 border-t bg-card hover:bg-accent/30 transition-colors"
            >
              <span className="font-semibold text-sm text-primary">{b.rate}</span>
              <span className="text-sm text-foreground">{b.range}</span>
            </div>
          ))}
        </div>
        {data.standardDeduction && (
          <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm text-accent-foreground">
              Standard Deduction: <strong>{formatCurrency(data.standardDeduction)}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Deduction Info Card
export function DeductionInfoCard({
  data,
}: {
  data: {
    state: string
    deductions?: { id: string; label: string; maxDeduction: number | null }[]
  }
}) {
  if (data.state === "loading") {
    return (
      <Card className="my-3 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading deduction info...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-3 border-primary/20 overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-5 w-5 text-primary" />
          Available Deductions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.deductions?.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-lg border p-3 bg-card hover:bg-accent/30 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">{d.label}</span>
            <Badge variant="outline" className="text-xs">
              {d.maxDeduction ? `Max ${formatCurrency(d.maxDeduction)}` : "No limit"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Tax Credits Card
export function TaxCreditsCard({
  data,
}: {
  data: {
    state: string
    eitc?: number
    childCredit?: number
    totalCredits?: number
    numChildren?: number
    message?: string
  }
}) {
  if (data.state === "calculating") {
    return (
      <Card className="my-3 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  if (data.state !== "complete") return null

  return (
    <Card className="my-3 border-primary/20 overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-primary" />
          Tax Credits Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 bg-card">
            <p className="text-xs text-muted-foreground">Earned Income Credit</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(data.eitc ?? 0)}</p>
          </div>
          <div className="rounded-lg border p-3 bg-card">
            <p className="text-xs text-muted-foreground">
              Child Tax Credit ({data.numChildren} {data.numChildren === 1 ? "child" : "children"})
            </p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(data.childCredit ?? 0)}
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total Credits</span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(data.totalCredits ?? 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper components
function MetricBox({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? "border-primary/30 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-primary">{icon}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
