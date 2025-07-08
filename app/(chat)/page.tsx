import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/provider'
import { auth } from '@/auth'
import { Session } from '@/lib/types'

export const metadata = {
  title: 'ION Water Support Assistant'
}

export default async function IndexPage() {
  const id = nanoid()
  const session = (await auth()) as Session

  return (
    <AI initialAIState={{ chatId: id, interactions: [], messages: [], csvAnalysis: undefined }}>
      <Chat id={id} session={session} />
    </AI>
  )
}
