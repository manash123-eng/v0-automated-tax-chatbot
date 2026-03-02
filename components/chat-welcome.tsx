"use client"

import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react"

const QUICK_PROMPTS = [
  "I want to file my taxes as a single filer",
  "What deductions am I eligible for?",
  "Show me the 2025 tax brackets",
  "I have 2 children - what credits can I get?",
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
            TaxBot AI
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-md text-pretty leading-relaxed">
            Your intelligent tax filing assistant. I will guide you through understanding
            your 2025 federal tax obligations step by step.
          </p>
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Shield className="h-3 w-3" />
          IRS 2025 Data
        </Badge>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Clock className="h-3 w-3" />
          Real-time Calculations
        </Badge>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Sparkles className="h-3 w-3" />
          AI-Powered Guidance
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
        personalized tax advice. Based on 2025 U.S. federal tax data.
      </p>
    </div>
  )
}
