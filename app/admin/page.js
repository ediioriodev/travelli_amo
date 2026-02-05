'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useModal } from '@/context/ModalContext'

export default function AdminPage() {
  const { showModal, showConfirm } = useModal()
  const [user, setUser] = useState(null)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      router.push('/')
      return
    }

    setUser(user)
    fetchPackages()
  }

  async function fetchPackages() {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })

    setPackages(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm('Elimina Pacchetto', 'Sei sicuro di voler eliminare questo pacchetto?')
    if (!confirmed) return

    const { error } = await supabase
      .from('packages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      fetchPackages()
      showModal('Successo', 'Pacchetto eliminato con successo')
    } else {
      console.error('Error deleting package:', error)
      showModal('Errore', 'Errore durante l\'eliminazione del pacchetto')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">Dashboard Admin</h1>
          <div className="space-x-4">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              Vai al Sito
            </Link>
            {/* <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              Logout
            </button> */}
          </div>
        </header>

        {/* Add Package Button */}
        <div className="mb-6">
          <Link
            href="/admin/pacchetti/nuovo"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
          >
            + Aggiungi Nuovo Pacchetto
          </Link>
        </div>

        {/* Packages List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Pacchetti Viaggio</h2>
            {packages.length === 0 ? (
              <p className="text-gray-500">Nessun pacchetto disponibile</p>
            ) : (
              <div className="space-y-4 text-gray-700">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700">{pkg.titolo}</h3>
                      <p className="text-gray-600">
                        {pkg.citta}, {pkg.paese} • {pkg.giorni} giorni • €{pkg.prezzo}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(pkg.data_inizio).toLocaleDateString('it-IT')} -{' '}
                        {new Date(pkg.data_fine).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/pacchetti/${pkg.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                      >
                        Modifica
                      </Link>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
