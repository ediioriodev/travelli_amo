'use client'

import { ModalProvider } from '@/context/ModalContext'

export function Providers({ children }) {
  return (
    <ModalProvider>
      {children}
    </ModalProvider>
  )
}
