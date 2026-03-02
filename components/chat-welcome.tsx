"use client"

import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react"

const QUICK_PROMPTS = [
  "My income is 8 lakh and expenses are 1 lakh",
  "What deductions can I claim under 80C?",
  "Show me the Indian tax slabs",
  "How can I save tax on 12 lakh salary?",
]

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void
}

export function ChatWelcome({ onPromptClick }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-12 px-4">
      {/* Logo / Icon */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Calculator className="h-8 w-8" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">
            SmartTax AI
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-md text-pretty leading-relaxed">
            Your intelligent Indian income tax filing assistant. I will guide you through
            calculating your tax liability, finding deductions, and saving tax step by step.
          </p>
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Shield className="h-3 w-3" />
          Indian Tax Slabs
        </Badge>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Clock className="h-3 w-3" />
          Real-time Calculations
        </Badge>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Sparkles className="h-3 w-3" />
          80C, 80D & More
        </Badge>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Get started with a question
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              className="rounded-xl border bg-card px-4 py-3 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground/70 max-w-sm text-center leading-relaxed">
        For educational purposes only. Consult a qualified tax professional for
        personalized tax advice. Based on Indian Income Tax Act.
      </p>
    </div>
  )
}
