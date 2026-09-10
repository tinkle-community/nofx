import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const MODAL_LAYERS = {
  primary: 'z-[100]',
  nested: 'z-[110]',
  critical: 'z-[120]',
} as const

interface ModalPortalProps {
  children: ReactNode
}

export function ModalPortal({ children }: ModalPortalProps) {
  if (typeof document === 'undefined') return null

  return createPortal(children, document.body)
}
