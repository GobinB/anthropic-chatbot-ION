'use client'

import { differenceInHours } from 'date-fns'
import { cn } from '@/lib/utils'
import { DeviceData } from '@/components/csv-uploader'

interface DeviceCardProps {
  device: DeviceData
  priority?: 'critical' | 'high' | 'medium' | 'low'
  onTroubleshoot?: (deviceId: string) => void
}

export function DeviceCard({ device, priority = 'medium', onTroubleshoot }: DeviceCardProps) {
  // Calculate delay time in hours with error handling
  const delayHours = (() => {
    try {
      const lastTime = new Date(device.last_creation_time)
      if (isNaN(lastTime.getTime())) return 0
      return Math.max(0, differenceInHours(new Date(), lastTime))
    } catch {
      return 0
    }
  })()
  
  // Get status-based styling
  const getStatusColor = (status: string, deviceType: string) => {
    if (status.includes('delayed')) {
      if (deviceType === 'gateway') return 'border-red-500 bg-red-50'
      if (deviceType === 'router' || deviceType === 'coordinator') return 'border-orange-500 bg-orange-50'
      return 'border-yellow-500 bg-yellow-50'
    }
    return 'border-green-500 bg-green-50'
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200', 
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const formatDelayTime = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }

  return (
    <div 
      className={cn(
        'rounded-lg border-2 p-4 transition-all hover:shadow-md',
        getStatusColor(device.status, device.device_type)
      )}
    >
      {/* Header with priority badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {device.device_type.toUpperCase()}
          </span>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            getPriorityBadge(priority)
          )}>
            {priority.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Offline for</div>
          <div className="text-sm font-bold text-red-600">
            {formatDelayTime(delayHours)}
          </div>
        </div>
      </div>

      {/* Serial Number */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Serial Number</div>
        <div className="font-mono text-sm font-medium break-all">
          {device.meter_serial_number}
        </div>
      </div>

      {/* Location Info */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="text-xs text-gray-500">Unit Details</div>
          <div className="text-sm">{device.unit_details || 'Not specified'}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500">Attached To</div>
          <div className="text-sm">{device.attached_to || 'Not specified'}</div>
        </div>
        
        {device.location && device.location !== 'None' && device.location.trim() && (
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="text-sm">{device.location}</div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="text-xs text-gray-500">Status</div>
        <div className={cn(
          'text-sm font-medium',
          device.status.includes('delayed') ? 'text-red-600' : 'text-green-600'
        )}>
          {device.status}
        </div>
      </div>

      {/* Troubleshoot Button */}
      {onTroubleshoot && (
        <button
          onClick={() => onTroubleshoot(device.meter_serial_number)}
          className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={`Start troubleshooting device ${device.meter_serial_number}`}
        >
          Start Troubleshooting
        </button>
      )}
    </div>
  )
}