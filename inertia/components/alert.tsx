import React from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
  className?: string
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className }) => {
  // Définir les couleurs et icônes en fonction du type
  const alertConfig = {
    success: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    },
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      icon: <ExclamationCircleIcon className="h-5 w-5 text-red-400" />,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
    },
    info: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
    },
  }

  const { bgColor, textColor, icon } = alertConfig[type]

  return (
    <div className={`rounded-md p-4 ${bgColor} ${className} animate-fade-in`} role="alert">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`rounded-md ${bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor.replace('800', '400')}`}
            >
              <span className="sr-only">Fermer</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
