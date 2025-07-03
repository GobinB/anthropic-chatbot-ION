'use client'

import dynamic from 'next/dynamic'
import { StockSkeleton } from './stock-skeleton'
import { StocksSkeleton } from './stocks-skeleton'
import { EventsSkeleton } from './events-skeleton'

export { spinner } from './spinner'
export { BotCard, BotMessage, SystemMessage } from './message'

const Stock = dynamic(() => import('./stock').then(mod => mod.Stock), {
  ssr: false,
  loading: () => <StockSkeleton />
})

const Purchase = dynamic(
  () => import('./stock-purchase').then(mod => mod.Purchase),
  {
    ssr: false,
    loading: () => (
      <div className="h-[375px] rounded-xl border bg-zinc-950 p-4 text-green-400 sm:h-[314px]" />
    )
  }
)

const Stocks = dynamic(() => import('./stocks').then(mod => mod.Stocks), {
  ssr: false,
  loading: () => <StocksSkeleton />
})

const Events = dynamic(() => import('./events').then(mod => mod.Events), {
  ssr: false,
  loading: () => <EventsSkeleton />
})

// Device components
const DeviceCard = dynamic(() => import('../devices').then(mod => mod.DeviceCard), {
  ssr: false,
  loading: () => <div className="h-[200px] rounded-xl border bg-gray-50 p-4 animate-pulse" />
})

const DeviceList = dynamic(() => import('../devices').then(mod => mod.DeviceList), {
  ssr: false,
  loading: () => <div className="h-[400px] rounded-xl border bg-gray-50 p-4 animate-pulse" />
})

export { Stock, Purchase, Stocks, Events, DeviceCard, DeviceList }
