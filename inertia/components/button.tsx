import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import Spinner from './spinner'
import { isNil } from 'lodash'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ColorButton = 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'info'

interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  label: string
  size?: ButtonSize
  color?: ColorButton
  icon?: React.ReactNode
  isLoading?: boolean
  isLeft?: boolean
  className?: string
}
const sizeButton = {
  xs: ['px-3 py-2 text-xs'],
  sm: ['px-3 py-2 text-sm'],
  md: ['px-5 py-2.5 text-sm'],
  lg: ['px-5 py-2 text-base'],
  xl: ['px-6 py-3.5 text-base'],
}
export default function Button({
  size = 'sm',
  label,
  color = 'primary',
  icon,
  isLoading,
  className,
  isLeft,
  ...props
}: ButtonProps) {
  const colors = {
    secondary: 'bg-stone-600',
    danger: 'bg-red-600',
    warning: 'bg-orange-600',
    primary: 'bg-green-600',
    outline: 'bg-white text-gray-500 border',
    info: 'bg-blue-600',
  }
  return (
    <button
      type="button"
      className={classNames(
        className,
        sizeButton[size],
        colors[color],
        { 'opacity-50 cursor-not-allowed': props.disabled },
        { 'hover:opacity-90': !props.disabled },
        'text-white font-light inline-flex items-center gap-1 justify-center focus:ring-4 focus:outline-none focus:ring-transparent rounded-md text-center'
      )}
      {...props}
    >
      {isLoading ? <Spinner size={size} /> : (!isLeft ? icon : '') && icon}
      {label}
      {isLeft ? icon : ''}
    </button>
  )
}
