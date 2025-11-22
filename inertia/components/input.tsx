import classNames from 'classnames'
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  withMargin?: boolean
  block?: boolean
  endIcon?: React.ReactNode
  startIcon?: React.ReactNode
}

const Input: React.FC<InputProps> = ({
  withMargin = true,
  label,
  error,
  block,
  endIcon,
  startIcon,
  ...props
}) => {
  const errorBorderColor = 'border-red-500'
  const errorTextColor = 'text-red-500'

  return (
    <div className={classNames({ '': withMargin }, { 'w-full': block })}>
      {label && <label className={`block text-sm font-medium mb-1`}>{label}</label>}

      <div className="relative">
        {startIcon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
            {startIcon}
          </div>
        )}
        <input
          {...props}
          className={classNames(
            'w-full py-2 z-10 border rounded-lg focus:outline-none focus:ring-1',
            'bg-white text-gray-900',
            error ? errorBorderColor : 'border-gray-300',
            'focus:ring-green-500',
            'focus:border-green-500',
            startIcon ? 'px-10' : 'px-3',
            props.className
          )}
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{endIcon}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 text-red-500">Champ requis.</p>}
    </div>
  )
}

export default Input
