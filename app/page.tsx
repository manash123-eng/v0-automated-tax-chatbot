"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { TaxChatMessage } from "@/app/api/tax-chat/route"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ChatWelcome } from "@/components/chat-welcome"
import { Calculator, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TaxChatPage() {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } =
    useChat<TaxChatMessage>({
      transport: new DefaultChatTransport({ api: "/api/tax-chat" }),
    })

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (text: string) => {
    if (status !== "ready") return
    sendMessage({ text })
  }

  const handleReset = () => {
    setMessages([])
  }

  const hasMessages = messages.length > 0
  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">SmartTax AI</h1>
            <p className="text-xs text-muted-foreground">
              Indian Income Tax Assistant
            </p>
          </div>
        </div>
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Chat
          </Button>
        )}
      </header>

      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-2xl px-4">
          {!hasMessages ? (
            <ChatWelcome onPromptClick={handleSend} />
          ) : (
            <div className="flex flex-col py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex gap-3 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <ChatInput
            onSend={handleSend}
            isDisabled={status !== "ready"}
            isStreaming={isStreaming}
          />
          <p className="mt-2 text-center text-[10px] text-muted-foreground/60">
            SmartTax AI uses Indian Income Tax Act data. For educational purposes only.
          </p>
        </div>
      </div>
    </div>
  )
}
