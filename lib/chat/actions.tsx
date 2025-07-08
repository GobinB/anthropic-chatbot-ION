import 'server-only'

import {
  createStreamableUI,
  getMutableAIState,
  createStreamableValue
} from 'ai/rsc'
import { nanoid, sleep } from '@/lib/utils'
import { CheckIcon, SpinnerIcon } from '@/components/ui/icons'
import { rateLimit } from './ratelimit'
import * as prompts from './prompts'
import AIService from './service'
import type { AIProvider } from './types'


export async function submitUserMessageWithCSV(content: string, csvAnalysis?: string) {
  'use server'

  await rateLimit()

  const aiState = getMutableAIState<AIProvider>()
  const service: AIService = new AIService(aiState)

  service.appendMessage({
    role: 'user',
    content,
    id: nanoid()
  })

  // Store CSV analysis in AI state for persistence across messages
  if (csvAnalysis) {
    aiState.update({
      ...aiState.get(),
      csvAnalysis
    })
  }

  // Use prompt with CSV analysis - either from parameter or from AI state
  const currentAnalysis = csvAnalysis || aiState.get().csvAnalysis
  service.processAIState(prompts.ionWaterSupport(currentAnalysis))

  return {
    id: nanoid(),
    attachments: service.streams.ui.value,
    spinner: service.streams.spinner.value,
    display: service.streams.message.value
  }
}

export async function submitUserMessage(content: string) {
  'use server'

  await rateLimit()

  const aiState = getMutableAIState<AIProvider>()
  const service: AIService = new AIService(aiState)

  service.appendMessage({
    role: 'user',
    content,
    id: nanoid()
  })

  // Use CSV analysis from AI state if available
  const csvAnalysis = aiState.get().csvAnalysis
  service.processAIState(prompts.ionWaterSupport(csvAnalysis))

  return {
    id: nanoid(),
    attachments: service.streams.ui.value,
    spinner: service.streams.spinner.value,
    display: service.streams.message.value
  }
}

export async function getInitialDeviceAnalysis() {
  'use server'

  await rateLimit()

  const service: AIService = new AIService(getMutableAIState<AIProvider>())

  // Add initial analysis message
  service.appendMessage({
    role: 'user',
    content: 'Please provide an initial device status summary and analysis of our current connectivity situation.',
    id: nanoid()
  })

  // Process the AI state with ION Water support context
  service.processAIState(prompts.ionWaterSupport())

  return {
    id: nanoid(),
    attachments: service.streams.ui.value,
    spinner: service.streams.spinner.value,
    display: service.streams.message.value
  }
}

export async function requestCode() {
  'use server'

  const aiState = getMutableAIState<AIProvider>()

  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: 'assistant',
        content:
          "A code has been sent to user's phone. They should enter it in the user interface to continue."
      }
    ]
  })

  const ui = createStreamableUI(
    <div className="animate-spin">
      <SpinnerIcon />
    </div>
  )

  ;(async () => {
    await sleep(2000)
    ui.done()
  })()

  return {
    status: 'requires_code',
    display: ui.value
  }
}

export async function setCSVAnalysis(csvAnalysis: string) {
  'use server'

  const aiState = getMutableAIState<AIProvider>()

  aiState.update({
    ...aiState.get(),
    csvAnalysis
  })
}

export async function showDeviceCards(devices: import('@/components/csv-uploader').DeviceData[], title?: string) {
  'use server'

  try {
    // Validate input
    if (!Array.isArray(devices) || devices.length === 0) {
      const ui = createStreamableUI(
        <div className="text-center py-8">
          <div className="text-gray-500">No devices to display</div>
        </div>
      )
      return {
        id: nanoid(),
        display: ui.value
      }
    }

    const { DeviceList } = await import('@/components/devices')
    
    const ui = createStreamableUI(
      <div className="space-y-4">
        <DeviceList
          devices={devices}
          title={title || 'Device Status'}
          maxDevices={12}
          showFilters={true}
          onTroubleshoot={(deviceId) => {
            // Troubleshooting will be handled by the chat interface
          }}
        />
      </div>
    )

    return {
      id: nanoid(),
      display: ui.value
    }
  } catch (error) {
    console.error('Error rendering device cards:', error)
    const ui = createStreamableUI(
      <div className="text-center py-8">
        <div className="text-red-500">Error displaying device cards</div>
      </div>
    )
    return {
      id: nanoid(),
      display: ui.value
    }
  }
}

export async function validateCode() {
  'use server'

  const aiState = getMutableAIState<AIProvider>()

  const status = createStreamableValue('in_progress')
  const ui = createStreamableUI(
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-zinc-500">
      <div className="animate-spin">
        <SpinnerIcon />
      </div>
      <div className="text-sm text-zinc-500">
        Please wait while we fulfill your order.
      </div>
    </div>
  )

  ;(async () => {
    await sleep(2000)

    ui.done(
      <div className="flex flex-col items-center text-center justify-center gap-3 p-4 text-emerald-700">
        <CheckIcon />
        <div>Payment Succeeded</div>
        <div className="text-sm text-zinc-600">
          Thanks for your purchase! You will receive an email confirmation
          shortly.
        </div>
      </div>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          role: 'assistant',
          content: 'The purchase has completed successfully.'
        }
      ]
    })

    status.done('completed')
  })()

  return {
    status: status.value,
    display: ui.value
  }
}
