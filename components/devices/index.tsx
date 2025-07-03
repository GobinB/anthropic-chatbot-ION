'use client'

import dynamic from 'next/dynamic'
import { DeviceCardSkeleton, DeviceListSkeleton } from './device-skeleton'

// Dynamic imports with loading states
const DeviceCard = dynamic(() => import('./device-card').then(mod => mod.DeviceCard), {
  ssr: false,
  loading: () => <DeviceCardSkeleton />
})

const DeviceList = dynamic(() => import('./device-list').then(mod => mod.DeviceList), {
  ssr: false,
  loading: () => <DeviceListSkeleton />
})

// Export skeletons for direct use
export { DeviceCardSkeleton, DeviceListSkeleton }

// Export dynamic components
export { DeviceCard, DeviceList }