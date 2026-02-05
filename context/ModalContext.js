'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import Modal from '@/components/Modal'

const ModalContext = createContext({
  showModal: (title, message) => Promise.resolve(),
  showConfirm: (title, message) => Promise.resolve(false),
})

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
  })

  // Refs to hold the resolve functions for promises
  const resolveRef = useRef(null)

  const handleClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
    
    // Resolve with null/undefined for alerts, or whatever was passed for confirms if not handled by buttons
    if (resolveRef.current) {
      // If it was a confirm and closed via backdrop/etc (though my modal doesn't have that yet), default to false
      // But my modal buttons call resolve directly. This is a cleanup.
      if (modalState.type === 'alert') {
          resolveRef.current()
      } else {
          resolveRef.current(false)
      }
      resolveRef.current = null
    }
  }, [modalState.type])

  const showModal = useCallback((title, message) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
      })
    })
  }, [])

  const showConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
      })
    })
  }, [])

  const handleConfirm = (result) => {
    if (resolveRef.current) {
      resolveRef.current(result)
      resolveRef.current = null
    }
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ModalContext.Provider value={{ showModal, showConfirm }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => {
             // Only close if it's an alert or explicit cancel. 
             // Though my Modal component calls onConfirm(false) for cancel button.
             // This onClose is mostly for if I add click-outside logic later.
             // For now, let's just make it do the same as "Cancel" for confirm types.
             if(resolveRef.current) resolveRef.current(false);
             setModalState(prev => ({ ...prev, isOpen: false }))
        }}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={handleConfirm}
      />
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
