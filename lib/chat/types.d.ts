import { AI } from './actions'
import { ValueOrUpdater, CoreMessage } from 'ai/rsc'

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
  display?: {
    name: string
    props: Record<string, any>
  }
}

export type AIState = {
  chatId: string
  interactions?: string[]
  messages: Message[]
  csvAnalysis?: string
}

export type UIState = {
  id: string
  display: React.ReactNode
  spinner?: React.ReactNode
  attachments?: React.ReactNode
}[]

export type MutableAIState<T extends AIState = AIState> = {
  get: () => AIState
  update: (newState: ValueOrUpdater<AIState>) => void
  done: ((newState: AIState) => void) | (() => void)
}

export type AIProvider = typeof AI

export type PrepareHistory = (history: CoreMessage[]) => CoreMessage[]
