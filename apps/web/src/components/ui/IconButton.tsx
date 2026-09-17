import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button, type ButtonVariant } from './Button'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Accessible name: icon buttons are never unlabeled. */
  label: string
  variant?: ButtonVariant
}

export function IconButton({ children, label, variant = 'ghost', className, ...props }: IconButtonProps) {
  return (
    <Button variant={variant} aria-label={label} title={label} className={cn('w-9 px-0', className)} {...props}>
      {children}
    </Button>
  )
}
