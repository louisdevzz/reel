import { Toaster as HotToaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastIconProps {
  type: 'success' | 'error' | 'loading' | 'custom'
}

const ToastIcon = ({ type }: ToastIconProps) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />
    case 'loading':
      return (
        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      )
    default:
      return <Info className="w-5 h-5 text-purple-400" />
  }
}

export const CustomToaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#18181b',
          color: '#ffffff',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontFamily: 'Space Grotesk, sans-serif',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          maxWidth: '400px',
          minWidth: '300px',
        },
        success: {
          icon: <ToastIcon type="success" />,
          style: {
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)',
          },
        },
        error: {
          icon: <ToastIcon type="error" />,
          style: {
            borderLeft: '4px solid #ef4444',
            background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)',
          },
        },
        loading: {
          icon: <ToastIcon type="loading" />,
          style: {
            borderLeft: '4px solid #8b5cf6',
            background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)',
          },
        },
      }}
    />
  )
} 