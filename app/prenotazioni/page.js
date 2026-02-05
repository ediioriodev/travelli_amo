'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useModal } from '@/context/ModalContext'

export default function PrenotazioniPage() {
  const { showModal, showConfirm } = useModal()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState({ future: [], past: [] })
  const [activeTab, setActiveTab] = useState('future')

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      fetchBookings(session.user.id)
    } catch (error) {
      console.error('Error checking authentication:', error)
      setLoading(false)
    }
  }

  async function fetchBookings(userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          packages (
            *
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const now = new Date()
      const future = []
      const past = []

      data.forEach(booking => {
        if (!booking.packages) return;

        const startDate = new Date(booking.packages.data_inizio)
        
        if (startDate >= now) {
          future.push(booking)
        } else {
          past.push(booking)
        }
      })

      future.sort((a, b) => new Date(a.packages.data_inizio) - new Date(b.packages.data_inizio))
      
      past.sort((a, b) => new Date(b.packages.data_inizio) - new Date(a.packages.data_inizio))

      setBookings({ future, past })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      showModal('Errore', 'Errore nel caricamento delle prenotazioni')
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(bookingId) {
    const confirmed = await showConfirm('Cancella Prenotazione', 'Sei sicuro di voler cancellare questa prenotazione?')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      fetchBookings(user.id)
      showModal('Successo', 'Prenotazione cancellata con successo')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      showModal('Errore', 'Errore durante la cancellazione della prenotazione')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const displayedBookings = bookings[activeTab]

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Le mie prenotazioni</h1>
      
      <div className="flex mb-8 border-b border-gray-200">
        <button
          className={`pb-4 px-6 font-medium text-lg focus:outline-none transition-colors ${
            activeTab === 'future'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('future')}
        >
          In Programma ({bookings.future.length})
        </button>
        <button
          className={`pb-4 px-6 font-medium text-lg focus:outline-none transition-colors ${
            activeTab === 'past'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('past')}
        >
          Storico Viaggi ({bookings.past.length})
        </button>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow sm:p-8">
          <p className="text-xl text-gray-500 mb-4">
            {activeTab === 'future' 
              ? 'Non hai viaggi in programma.' 
              : 'Non hai ancora effettuato viaggi.'}
          </p>
          {activeTab === 'future' && (
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Scopri le nostre offerte
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedBookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCancel={cancelBooking}
              isPast={activeTab === 'past'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, onCancel, isPast }) {
  const pkg = booking.packages
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    pending: 'In attesa',
    confirmed: 'Confermata',
    cancelled: 'Cancellata'
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition hover:shadow-lg">
      <div className="md:flex">
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <Image
            src={pkg.foto_url || '/placeholder-package.jpg'}
            alt={pkg.titolo}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6 md:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{pkg.titolo}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[booking.status] || booking.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{pkg.descrizione}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold block text-gray-900">Partenza:</span>
                {new Date(pkg.data_inizio).toLocaleDateString('it-IT')}
              </div>
              <div>
                <span className="font-semibold block text-gray-900">Ritorno:</span>
                {new Date(pkg.data_fine).toLocaleDateString('it-IT')}
              </div>
              <div>
                <span className="font-semibold block text-gray-900">Destinazione:</span>
                {pkg.citta}, {pkg.paese}
              </div>
              <div>
                <span className="font-semibold block text-gray-900">Prezzo Pagato:</span>
                € {booking.total_price}
              </div>
            </div>

            {booking.note_agenzia && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                  Note Agenzia / Comunicazioni
                </h4>
                <p className="text-sm text-blue-900 whitespace-pre-line">
                  {booking.note_agenzia}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link 
              href={`/prenotazioni/${booking.id}`}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition"
            >
              Vedi Dettagli Prenotazione
            </Link>
            
            <a 
              href={`mailto:info@travelliamo.it?subject=Richiesta info prenotazione ${booking.id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition"
            >
              Richiedi Info
            </a>

            {!isPast && booking.status !== 'cancelled' && (
              <button
                onClick={() => onCancel(booking.id)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition ml-auto"
              >
                Cancella Prenotazione
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
