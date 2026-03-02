"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (text: string) => void
  isDisabled: boolean
  isStreaming: boolean
}

export function ChatInput({ onSend, isDisabled, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isDisabled) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-lg"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your taxes, deductions, or income..."
        className={cn(
          "flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed",
          "placeholder:text-muted-foreground focus:outline-none",
          "min-h-[40px] max-h-[120px] text-foreground"
        )}
        rows={1}
        disabled={isDisabled}
        aria-label="Tax question input"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isDisabled || !input.trim()}
        className="h-10 w-10 shrink-0 rounded-xl"
        aria-label="Send message"
      >
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}
