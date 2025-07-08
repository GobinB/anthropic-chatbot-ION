'use client'

import { useState } from 'react'
import { DeviceCard } from './device-card'
import { DeviceData } from '@/components/csv-uploader'

interface DeviceListProps {
  devices: DeviceData[]
  title?: string
  maxDevices?: number
  showFilters?: boolean
  onTroubleshoot?: (deviceId: string) => void
}

export function DeviceList({ 
  devices = [], 
  title, 
  maxDevices = 10,
  showFilters = false,
  onTroubleshoot 
}: DeviceListProps) {
  // Early return if no devices provided
  if (!Array.isArray(devices)) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">Invalid device data provided</div>
      </div>
    )
  }
  const [filter, setFilter] = useState<'all' | 'gateway' | 'router' | 'coordinator' | 'meter'>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'delay' | 'type'>('priority')

  // Priority mapping for devices
  const getDevicePriority = (device: DeviceData): 'critical' | 'high' | 'medium' | 'low' => {
    if (device.device_type === 'gateway') return 'critical'
    if (device.device_type === 'router' && device.status === 'coordinator delayed') return 'critical'
    if (device.device_type === 'router') return 'high'
    if (device.device_type === 'coordinator') return 'high'
    return 'medium'
  }

  // Filter devices
  const filteredDevices = devices.filter(device => {
    if (filter === 'all') return true
    return device.device_type === filter
  })

  // Sort devices
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const aPriority = getDevicePriority(a)
      const bPriority = getDevicePriority(b)
      return priorityOrder[aPriority] - priorityOrder[bPriority]
    }
    
    if (sortBy === 'delay') {
      try {
        const aTime = new Date(a.last_creation_time)
        const bTime = new Date(b.last_creation_time)
        const aDelay = isNaN(aTime.getTime()) ? 0 : new Date().getTime() - aTime.getTime()
        const bDelay = isNaN(bTime.getTime()) ? 0 : new Date().getTime() - bTime.getTime()
        return bDelay - aDelay // Most delayed first
      } catch {
        return 0
      }
    }
    
    if (sortBy === 'type') {
      const typeOrder = { gateway: 0, router: 1, coordinator: 2, meter: 3 }
      return typeOrder[a.device_type as keyof typeof typeOrder] - typeOrder[b.device_type as keyof typeof typeOrder]
    }
    
    return 0
  })

  // Limit devices shown
  const displayDevices = sortedDevices.slice(0, maxDevices)
  const hasMore = sortedDevices.length > maxDevices

  // Get summary stats
  const stats = {
    total: devices.length,
    critical: devices.filter(d => getDevicePriority(d) === 'critical').length,
    high: devices.filter(d => getDevicePriority(d) === 'high').length,
    gateways: devices.filter(d => d.device_type === 'gateway').length,
    routers: devices.filter(d => d.device_type === 'router').length,
    coordinators: devices.filter(d => d.device_type === 'coordinator').length,
    meters: devices.filter(d => d.device_type === 'meter').length
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            {displayDevices.length} of {filteredDevices.length} devices
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-600 text-sm font-medium">Critical</div>
          <div className="text-red-800 text-lg font-bold">{stats.critical}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-orange-600 text-sm font-medium">High Priority</div>
          <div className="text-orange-800 text-lg font-bold">{stats.high}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-blue-600 text-sm font-medium">Gateways</div>
          <div className="text-blue-800 text-lg font-bold">{stats.gateways}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-gray-600 text-sm font-medium">Total Offline</div>
          <div className="text-gray-800 text-lg font-bold">{stats.total}</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter devices by type"
            >
              <option value="all">All Devices</option>
              <option value="gateway">Gateways</option>
              <option value="router">Routers</option>
              <option value="coordinator">Coordinators</option>
              <option value="meter">Meters</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Sort devices by criteria"
            >
              <option value="priority">Priority</option>
              <option value="delay">Delay Time</option>
              <option value="type">Device Type</option>
            </select>
          </div>
        </div>
      )}

      {/* Device Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayDevices.map((device) => (
          <DeviceCard
            key={device.meter_serial_number}
            device={device}
            priority={getDevicePriority(device)}
            onTroubleshoot={onTroubleshoot}
          />
        ))}
      </div>

      {/* Show More Indicator */}
      {hasMore && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">
            Showing {displayDevices.length} of {filteredDevices.length} devices
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {filteredDevices.length - displayDevices.length} more devices available
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayDevices.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">No devices found</div>
          <div className="text-sm text-gray-400 mt-1">
            Try adjusting your filters
          </div>
        </div>
      )}
    </div>
  )
}