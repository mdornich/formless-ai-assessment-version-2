import React from 'react'
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting?: boolean
  showFullStatus?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting = false,
  showFullStatus = false
}) => {
  if (isConnecting) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="animate-spin">
          <Wifi size={16} />
        </div>
        {showFullStatus && <span className="text-sm">Connecting...</span>}
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <WifiOff size={16} />
        {showFullStatus && (
          <div className="flex items-center space-x-1">
            <AlertTriangle size={14} />
            <span className="text-sm">Connection lost</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-green-600">
      <Wifi size={16} />
      {showFullStatus && <span className="text-sm">Connected</span>}
    </div>
  )
}

export default ConnectionStatus