"use client"

import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import type { TaxChatMessage } from "@/app/api/tax-chat/route"
import {
  TaxResultCard,
  TaxBracketsCard,
  DeductionInfoCard,
  TaxCreditsCard,
} from "./tax-tool-cards"

export function ChatMessage({ message }: { message: TaxChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-3 py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[85%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <span className="text-xs font-medium text-muted-foreground px-1">
          {isUser ? "You" : "TaxBot AI"}
        </span>
        <div className="flex flex-col gap-0">
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                if (!part.text.trim()) return null
                return (
                  <div
                    key={index}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      isUser
                        ? "bg-foreground text-background rounded-tr-md"
                        : "bg-card border border-border text-card-foreground rounded-tl-md"
                    )}
                  >
                    <FormattedText text={part.text} />
                  </div>
                )

              case "tool-calculateTax":
                return (
                  <TaxResultCard
                    key={index}
                    data={
                      part.state === "output-available"
                        ? part.output
                        : part.state === "input-available"
                          ? { state: "calculating", message: "Calculating your taxes..." }
                          : { state: "unknown" }
                    }
                  />
                )

              case "tool-getTaxBrackets":
                return (
                  <TaxBracketsCard
                    key={index}
                    data={
                      part.state === "output-available"
                        ? part.output
                        : { state: "loading" }
                    }
                  />
                )

              case "tool-getDeductionInfo":
                return (
                  <DeductionInfoCard
                    key={index}
                    data={
                      part.state === "output-available"
                        ? part.output
                        : { state: "loading" }
                    }
                  />
                )

              case "tool-calculateCredits":
                return (
                  <TaxCreditsCard
                    key={index}
                    data={
                      part.state === "output-available"
                        ? part.output
                        : part.state === "input-available"
                          ? { state: "calculating", message: "Calculating your credits..." }
                          : { state: "unknown" }
                    }
                  />
                )

              default:
                return null
            }
          })}
        </div>
      </div>
    </div>
  )
}

// Format text with basic markdown-like styling
function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n")

  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />

        // Bold
        const formatted = line.split(/(\*\*.*?\*\*)/g).map((segment, j) => {
          if (segment.startsWith("**") && segment.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold">
                {segment.slice(2, -2)}
              </strong>
            )
          }
          return segment
        })

        // Bullet points
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-primary mt-1.5 text-[6px]">&#9679;</span>
              <span>{formatted}</span>
            </div>
          )
        }

        // Numbered lists
        const numMatch = line.trim().match(/^(\d+)\.\s/)
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-primary font-semibold text-xs min-w-[1rem]">
                {numMatch[1]}.
              </span>
              <span>{formatted}</span>
            </div>
          )
        }

        return <p key={i}>{formatted}</p>
      })}
    </div>
  )
}
