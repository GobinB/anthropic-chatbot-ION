'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './stocks/message'
import { type AIProvider } from '@/lib/chat/types'
import { Button } from '@/components/ui/button'
import { IconArrowElbow } from '@/components/ui/icons'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

export function PromptForm({
  input,
  setInput,
  csvAnalysis
}: {
  input: string
  setInput: (value: string) => void
  csvAnalysis?: string
}) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage, submitUserMessageWithCSV } = useActions()
  const [_, setMessages] = useUIState<AIProvider>()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])


  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        // Optimistically add user message UI
        setMessages((currentMessages: any) => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          }
        ])

        try {
          // Submit and get response message - use CSV-aware action if CSV data is available
          const responseMessage = csvAnalysis 
            ? await submitUserMessageWithCSV(value, csvAnalysis)
            : await submitUserMessage(value)
          setMessages((currentMessages: any) => [...currentMessages, responseMessage])
        } catch {
          toast(
            <div className="text-red-600">
              You have reached your message limit! Please try again later.
            </div>
          )
        }
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-zinc-100 sm:rounded-full sm:px-4">{/* File upload removed - CSV upload is handled in the main interface */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full bg-transparent placeholder:text-zinc-900 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-4 top-[13px] sm:right-4">
          <Button
            type="submit"
            size="icon"
            disabled={input === ''}
            className="bg-transparent shadow-none text-zinc-950 rounded-full hover:bg-zinc-200"
          >
            <IconArrowElbow />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
