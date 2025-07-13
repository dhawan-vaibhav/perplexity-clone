import * as React from "react"
import { X } from "lucide-react"

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  }[type]

  const textColor = {
    error: 'text-red-800 dark:text-red-200',
    success: 'text-green-800 dark:text-green-200',
    info: 'text-blue-800 dark:text-blue-200',
  }[type]

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border ${bgColor} ${textColor} shadow-lg animate-in slide-in-from-bottom-2 duration-300`}>
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}