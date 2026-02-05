'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkIfAdmin(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })

    // Click outside handler
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      await checkIfAdmin(user.id)
    }
  }

  async function checkIfAdmin(userId) {
    const { data } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    setIsAdmin(data?.is_admin || false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setIsMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
            Travelli Amo
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6 text-gray-700"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="text-xs text-gray-500">Ciao,</div>
                      <div className="font-semibold truncate">{user.user_metadata.nome}</div>
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          href="/prenotazioni"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Le mie prenotazioni
                        </Link>
                        <Link
                          href="/profilo"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Impostazioni utente
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Admin
                        </div>

                         <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Gestione pacchetti viaggio
                        </Link>
                        <Link
                          href="/admin/prenotazioni"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Gestione prenotazioni
                        </Link>
                      </>
                    ) : (
                      <>
                         <Link
                          href="/prenotazioni"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Le mie prenotazioni
                        </Link>
                        <Link
                          href="/profilo"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Impostazioni utente
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  href="/registrazione"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
