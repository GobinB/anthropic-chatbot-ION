'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DeviceData {
  meter_serial_number: string
  device_type: 'meter' | 'gateway' | 'router' | 'coordinator'
  attached_to: string
  status: string
  last_creation_time: string
  first_creation_time: string
  state: string
  last_7_days_gallons: number
  dbt_scd_id: string
  dbt_updated_at: string
  property_name: string
  unit_details: string
  developer_name: string
  developer_id: string
  property_id: string
  line_entry_type: string
  bathroom_count: number
  bedroom_count: number
  location: string
}

interface CSVUploaderProps {
  onDataLoad: (data: DeviceData[], summary: string) => void
  currentFileName?: string
  deviceCount?: number
}

export function CSVUploader({ onDataLoad, currentFileName, deviceCount }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredColumns = [
    'meter_serial_number',
    'device_type',
    'status',
    'dbt_updated_at',
    'property_name'
  ]

  const parseCSV = useCallback((csvText: string): DeviceData[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) throw new Error('CSV file is empty')

    const headers = lines[0].split(',').map(h => h.trim())

    // Validate required columns
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    const devices: DeviceData[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length !== headers.length) continue

      const device: any = {}
      headers.forEach((header, index) => {
        const key = header.trim()
        let value = values[index]?.trim() || ''

        // Parse numeric fields
        if (key === 'last_7_days_gallons' || key === 'bathroom_count' || key === 'bedroom_count') {
          device[key] = value === '' ? 0 : parseFloat(value)
        } else {
          device[key] = value
        }
      })

      devices.push(device as DeviceData)
    }

    return devices
  }, [])

  const analyzeDevices = useCallback((devices: DeviceData[]): string => {
    // Get current status for each device (latest dbt_updated_at)
    const deviceGroups = new Map<string, DeviceData[]>()
    devices.forEach(device => {
      const serial = device.meter_serial_number
      if (!deviceGroups.has(serial)) {
        deviceGroups.set(serial, [])
      }
      deviceGroups.get(serial)!.push(device)
    })

    const currentDevices = Array.from(deviceGroups.values()).map(snapshots => {
      return snapshots.reduce((latest, current) => {
        return new Date(current.dbt_updated_at) > new Date(latest.dbt_updated_at) ? current : latest
      })
    })

    // Analyze status - devices are offline if status contains "delayed"
    const totalDevices = currentDevices.length
    const offlineDevices = currentDevices.filter(d => d.status.includes('delayed'))
    const onlineDevices = totalDevices - offlineDevices.length

    // Count by device type
    const devicesByType: Record<string, number> = {}
    const offlineByType: Record<string, number> = {}

    currentDevices.forEach(device => {
      devicesByType[device.device_type] = (devicesByType[device.device_type] || 0) + 1
      if (device.status.includes('delayed')) {
        offlineByType[device.device_type] = (offlineByType[device.device_type] || 0) + 1
      }
    })

    // Find critical infrastructure issues
    const criticalIssues: string[] = []
    const offlineGateways = offlineDevices.filter(d => d.device_type === 'gateway')
    const offlineRouters = offlineDevices.filter(d => d.device_type === 'router')
    const offlineCoordinators = offlineDevices.filter(d => d.device_type === 'coordinator')

    // Also count routers acting as coordinators (status = "coordinator delayed")
    const routersActingAsCoordinators = offlineDevices.filter(d => d.device_type === 'router' && d.status === 'coordinator delayed')

    if (offlineGateways.length > 0) {
      criticalIssues.push(`${offlineGateways.length} gateway(s) offline - this affects multiple downstream devices`)
    }
    if (routersActingAsCoordinators.length > 0) {
      criticalIssues.push(`${routersActingAsCoordinators.length} router(s) acting as coordinators are offline - CRITICAL for mesh network`)
    }
    if (offlineRouters.length - routersActingAsCoordinators.length > 0) {
      criticalIssues.push(`${offlineRouters.length - routersActingAsCoordinators.length} standard router(s) offline - affects connected meters`)
    }
    if (offlineCoordinators.length > 0) {
      criticalIssues.push(`${offlineCoordinators.length} coordinator(s) offline - affects local meter clusters`)
    }

    // Generate analysis summary
    let summary = `DEVICE STATUS ANALYSIS:\n\n`
    summary += `Total Devices: ${totalDevices}\n`
    summary += `Online: ${onlineDevices}\n`
    summary += `Offline: ${offlineDevices.length}\n\n`

    summary += `DEVICES BY TYPE:\n`
    Object.entries(devicesByType).forEach(([type, count]) => {
      const offline = offlineByType[type] || 0
      summary += `- ${type}: ${count} total (${offline} offline)\n`
    })

    if (criticalIssues.length > 0) {
      summary += `\nCRITICAL INFRASTRUCTURE ISSUES:\n`
      criticalIssues.forEach(issue => summary += `- ${issue}\n`)
    }

    // Property analysis
    const properties = new Set(currentDevices.map(d => d.property_name))
    summary += `\nPROPERTIES AFFECTED: ${properties.size}\n`

    // Detailed device listings with actual serial numbers
    summary += `\nOFFLINE DEVICES BY TYPE:\n`

    if (offlineGateways.length > 0) {
      summary += `\nOFFLINE GATEWAYS (CRITICAL - affects multiple devices):\n`
      offlineGateways.slice(0, 10).forEach(gateway => {
        summary += `- ${gateway.meter_serial_number} at ${gateway.property_name} (${gateway.location || gateway.attached_to})\n`
      })
    }

    if (routersActingAsCoordinators.length > 0) {
      summary += `\nROUTERS ACTING AS COORDINATORS (CRITICAL - mesh network control):\n`
      routersActingAsCoordinators.slice(0, 10).forEach(router => {
        summary += `- ${router.meter_serial_number} at ${router.property_name} (${router.location || router.attached_to}) - STATUS: ${router.status}\n`
      })
    }

    const standardOfflineRouters = offlineRouters.filter(r => r.status !== 'coordinator delayed')
    if (standardOfflineRouters.length > 0) {
      summary += `\nOFFLINE ROUTERS (HIGH PRIORITY - affects connected meters):\n`
      standardOfflineRouters.slice(0, 10).forEach(router => {
        summary += `- ${router.meter_serial_number} at ${router.property_name} (${router.location || router.attached_to}) - STATUS: ${router.status}\n`
      })
    }

    if (offlineCoordinators.length > 0) {
      summary += `\nOFFLINE COORDINATORS (affects local clusters):\n`
      offlineCoordinators.slice(0, 10).forEach(coord => {
        summary += `- ${coord.meter_serial_number} at ${coord.property_name} (${coord.location || coord.attached_to})\n`
      })
    }

    const offlineMeters = offlineDevices.filter(d => d.device_type === 'meter')
    if (offlineMeters.length > 0) {
      summary += `\nOFFLINE METERS (${offlineMeters.length} total):\n`
      offlineMeters.forEach(meter => {
        summary += `- ${meter.meter_serial_number} at ${meter.property_name} (${meter.attached_to})\n`
      })
    }

    // Hierarchy impact analysis with specific devices
    if (offlineGateways.length > 0) {
      summary += `\nHIERARCHY IMPACT ANALYSIS:\n`
      offlineGateways.forEach(gateway => {
        const affectedDevices = currentDevices.filter(d =>
          d.property_name === gateway.property_name &&
          d.meter_serial_number !== gateway.meter_serial_number &&
          d.status === 'meter delayed'
        )
        if (affectedDevices.length > 0) {
          summary += `- Gateway ${gateway.meter_serial_number} at ${gateway.property_name} is potentially affecting ${affectedDevices.length} other devices:\n`
          affectedDevices.slice(0, 5).forEach(device => {
            summary += `  * ${device.device_type} ${device.meter_serial_number} (${device.attached_to})\n`
          })
          if (affectedDevices.length > 5) {
            summary += `  * ... and ${affectedDevices.length - 5} more devices\n`
          }
        }
      })
    }

    // Priority recommendations with specific devices
    summary += `\nRECOMMENDED PRIORITY ORDER:\n`
    if (offlineGateways.length > 0) {
      summary += `1. FIX GATEWAYS FIRST (affects most devices):\n`
      offlineGateways.slice(0, 3).forEach((gateway, i) => {
        summary += `   ${i + 1}. ${gateway.meter_serial_number} at ${gateway.property_name}\n`
      })
    }
    if (offlineRouters.length > 0) {
      summary += `2. FIX ROUTERS NEXT (affects connected meters):\n`
      offlineRouters.slice(0, 5).forEach((router, i) => {
        summary += `   ${i + 1}. ${router.meter_serial_number} at ${router.property_name}\n`
      })
    }

    return summary
  }, [])

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const text = await file.text()
      const devices = parseCSV(text)
      const summary = analyzeDevices(devices)

      onDataLoad(devices, summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file')
    } finally {
      setIsProcessing(false)
    }
  }, [parseCSV, analyzeDevices, onDataLoad])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      processFile(file)
    } else {
      setError('Please drop a CSV file')
    }
  }, [processFile])

  return (
    <div className="w-full space-y-4">
      {/* File Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          isProcessing && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className="text-4xl">📊</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Upload Device Data CSV
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop your CSV file here, or click to browse
            </p>
          </div>

          <Button
            variant="outline"
            disabled={isProcessing}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            {isProcessing ? 'Processing...' : 'Select CSV File'}
          </Button>

          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Current File Info */}
      {currentFileName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm font-medium text-green-800">
              Loaded: {currentFileName}
            </span>
            {deviceCount && (
              <span className="text-sm text-green-600">
                ({deviceCount} devices)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500">
        <p><strong>Required columns:</strong> meter_serial_number, device_type, status, dbt_updated_at, property_name</p>
        <p><strong>Supported device types:</strong> meter, gateway, router, coordinator</p>
      </div>
    </div>
  )
}
