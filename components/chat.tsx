'use client'

import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { CSVUploader, DeviceData } from '@/components/csv-uploader'
import { Message } from '@/lib/chat/types'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { Session } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAIState, useUIState, useActions } from 'ai/rsc'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
}

export function Chat({ id, className, session }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const { setCSVAnalysis } = useActions()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)
  const [csvData, setCsvData] = useState<DeviceData[]>([])
  const [csvAnalysis, setCsvAnalysis] = useState<string>('')
  const [csvFileName, setCsvFileName] = useState<string>('')

  const handleDataLoad = useCallback(async (data: DeviceData[], summary: string) => {
    setCsvData(data)
    setCsvAnalysis(summary)
    setCsvFileName('uploaded-data.csv')

    // Store CSV analysis in AI state for persistence
    await setCSVAnalysis(summary)

    // Show a welcome message with the data analysis
    toast.success(`CSV loaded: ${data.length} devices analyzed`)
  }, [setCSVAnalysis])

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div className={cn('pb-[200px] pt-4', className)} ref={messagesRef}>
        {messages.length ? (
          <ChatList messages={messages} isShared={false} session={session} />
        ) : (
          <div className="space-y-6">
            <EmptyScreen />
            <div className="mx-auto max-w-2xl px-4">
              <CSVUploader
                onDataLoad={handleDataLoad}
                currentFileName={csvFileName}
                deviceCount={csvData.length}
              />
            </div>
          </div>
        )}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        csvAnalysis={csvAnalysis}
      />
    </div>
  )
}
