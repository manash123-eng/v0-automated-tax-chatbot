"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  TrendingUp,
  IndianRupee,
  FileText,
  Receipt,
  Lightbulb,
  Loader2,
  BookOpen,
  ShieldCheck,
} from "lucide-react"

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Tax Calculation Result Card
export function TaxResultCard({
  data,
}: {
  data: {
    state: string
    grossIncome?: number
    totalDeductions?: number
    netTaxableIncome?: number
    totalTax?: number
    effectiveRate?: number
    taxBeforeCess?: number
    cess?: number
    employmentLabel?: string
    slabBreakdown?: { rate: number; taxableAtRate: number; taxAtRate: number; range: string }[]
    suggestions?: string[]
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
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <Calculator className="h-5 w-5 text-primary" />
            Tax Calculation Summary
          </CardTitle>
          <Badge variant="secondary">{data.employmentLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox
            icon={<IndianRupee className="h-4 w-4" />}
            label="Gross Income"
            value={formatINR(data.grossIncome ?? 0)}
          />
          <MetricBox
            icon={<FileText className="h-4 w-4" />}
            label="Total Deductions"
            value={formatINR(data.totalDeductions ?? 0)}
          />
          <MetricBox
            icon={<Receipt className="h-4 w-4" />}
            label="Net Taxable Income"
            value={formatINR(data.netTaxableIncome ?? 0)}
          />
          <MetricBox
            icon={<TrendingUp className="h-4 w-4" />}
            label="Total Tax Payable"
            value={formatINR(data.totalTax ?? 0)}
            highlight
          />
        </div>

        {/* Rates & Cess */}
        <div className="flex gap-4 rounded-lg bg-secondary/50 p-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Tax Before Cess</p>
            <p className="text-lg font-semibold text-foreground">{formatINR(data.taxBeforeCess ?? 0)}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Cess (4%)</p>
            <p className="text-lg font-semibold text-foreground">{formatINR(data.cess ?? 0)}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Effective Rate</p>
            <p className="text-lg font-semibold text-primary">{data.effectiveRate}%</p>
          </div>
        </div>

        {/* Take Home */}
        <div className="rounded-lg bg-primary/10 p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Estimated Take-Home</span>
          <span className="text-lg font-bold text-primary">{formatINR(takeHome)}</span>
        </div>

        {/* Slab breakdown */}
        {data.slabBreakdown && data.slabBreakdown.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Slab Breakdown
            </p>
            {data.slabBreakdown.map((b, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {(b.rate * 100).toFixed(0)}% ({b.range})
                  </span>
                  <span className="font-medium text-foreground">{formatINR(b.taxAtRate)}</span>
                </div>
                <Progress
                  value={
                    data.taxBeforeCess && data.taxBeforeCess > 0
                      ? (b.taxAtRate / data.taxBeforeCess) * 100
                      : 0
                  }
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tax saving tips */}
        {data.suggestions && data.suggestions.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                Tax Saving Tips
              </p>
            </div>
            {data.suggestions.map((tip, i) => (
              <div key={i} className="flex gap-2 pl-1">
                <span className="text-primary mt-1.5 text-[6px]">&#9679;</span>
                <span className="text-xs text-foreground leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Tax Slabs Display Card
export function TaxSlabsCard({
  data,
}: {
  data: {
    state: string
    regimeLabel?: string
    slabs?: { rate: string; range: string }[]
    note?: string
  }
}) {
  if (data.state === "loading") {
    return (
      <Card className="my-3 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading tax slabs...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-3 border-primary/20 overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Income Tax Slabs
          </CardTitle>
          <Badge variant="secondary">{data.regimeLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-2 bg-secondary/50 p-2.5">
            <span className="text-xs font-medium text-muted-foreground">Rate</span>
            <span className="text-xs font-medium text-muted-foreground">Income Range</span>
          </div>
          {data.slabs?.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-2 p-2.5 border-t bg-card hover:bg-accent/30 transition-colors"
            >
              <span className="font-semibold text-sm text-primary">{s.rate}</span>
              <span className="text-sm text-foreground">{s.range}</span>
            </div>
          ))}
        </div>
        {data.note && (
          <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-accent-foreground">{data.note}</span>
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
    deductions?: {
      id: string
      section: string
      label: string
      maxDeduction: number | null
      description: string
    }[]
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
        <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Tax Deductions & Sections
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.deductions?.map((d) => (
          <div
            key={d.id}
            className="flex flex-col gap-1 rounded-lg border p-3 bg-card hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs text-primary border-primary/30">
                  {d.section}
                </Badge>
                <span className="text-sm font-medium text-foreground">{d.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {d.maxDeduction ? `Max ${formatINR(d.maxDeduction)}` : "No limit"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-0.5">
              {d.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Tax Saving Tips Card
export function TaxSavingTipsCard({
  data,
}: {
  data: {
    state: string
    grossIncome?: number
    suggestions?: string[]
  }
}) {
  if (data.state === "loading") {
    return (
      <Card className="my-3 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Generating tax saving tips...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-3 border-primary/20 overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <Lightbulb className="h-5 w-5 text-primary" />
            Tax Saving Suggestions
          </CardTitle>
          {data.grossIncome && (
            <Badge variant="secondary">Income: {formatINR(data.grossIncome)}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.suggestions?.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border p-3 bg-card hover:bg-accent/30 transition-colors"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </div>
            <span className="text-sm text-foreground leading-relaxed">{tip}</span>
          </div>
        ))}
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
