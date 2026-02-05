'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useModal } from '@/context/ModalContext'

export default function BookingDetailPage({ params }) {
  const { showModal, showConfirm } = useModal()
  const router = useRouter()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [])

  async function fetchBooking() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          packages (
            *
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
      showModal('Errore', 'Impossibile caricare la prenotazione.')
      router.push('/prenotazioni')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelBooking() {
    const confirmed = await showConfirm('Cancella Prenotazione', 'Sei sicuro di voler cancellare questa prenotazione? L\'operazione è irreversibile.')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id)

      if (error) throw error

      setBooking({ ...booking, status: 'cancelled' })
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

  if (!booking) return null

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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/prenotazioni" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Torna alle mie prenotazioni
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Image */}
          <div className="relative h-64 md:h-80 w-full">
            <Image
              src={pkg.foto_url || '/placeholder-package.jpg'}
              alt={pkg.titolo}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white w-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{pkg.titolo}</h1>
                <p className="text-lg opacity-90 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {pkg.citta}, {pkg.paese}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Status Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">ID Prenotazione</p>
                <p className="text-gray-900 font-mono text-sm">{booking.id}</p>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-3 font-medium">Stato:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Trip Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-primary-500 pl-3">
                  Dettagli Viaggio
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Periodo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(pkg.data_inizio).toLocaleDateString('it-IT')} — {new Date(pkg.data_fine).toLocaleDateString('it-IT')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {pkg.giorni} giorni / {pkg.giorni - 1} notti
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Voli</p>
                    <div className="mb-2">
                       <p className="text-xs text-gray-500 uppercase">Andata</p>
                       <p className="font-medium">{pkg.volo_partenza} ➔ {pkg.volo_destinazione}</p>
                       <p className="text-sm text-gray-600">Partenza ore {pkg.orario_partenza?.substring(0, 5)}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 uppercase">Ritorno</p>
                       <p className="font-medium">{pkg.volo_destinazione} ➔ {pkg.volo_partenza}</p>
                       <p className="text-sm text-gray-600">Partenza ore {pkg.orario_ritorno?.substring(0, 5)}</p>
                    </div>
                  </div>

                   <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Alloggio</p>
                    <p className="font-semibold text-gray-900">{pkg.hotel}</p>
                  </div>
                </div>
              </div>

              {/* Payment & Agency Notes */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-primary-500 pl-3">
                  Riepilogo e Pagamento
                </h2>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Prezzo Totale</span>
                      <span className="text-2xl font-bold text-primary-600">€ {booking.total_price}</span>
                   </div>
                   <div className="text-sm text-gray-500">
                      Prenotato il: {new Date(booking.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>

                {booking.note_agenzia && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                    <h3 className="flex items-center text-blue-800 font-bold mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Note dall'Agenzia
                    </h3>
                    <div className="prose prose-sm text-blue-900 whitespace-pre-line">
                      {booking.note_agenzia}
                    </div>
                  </div>
                )}
                
                {!booking.note_agenzia && booking.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800">
                    <p className="font-semibold mb-1">In attesa di conferma</p>
                    La tua prenotazione è stata ricevuta. Riceverai presto aggiornamenti e istruzioni per il pagamento in questa sezione.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-100">
               <a 
                href={`mailto:info@travelliamo.it?subject=Assistenza Prenotazione #${booking.id}`}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-center"
              >
                Bisogno di aiuto? Contattaci
              </a>
              
              {booking.status !== 'cancelled' && (
                <button
                  onClick={handleCancelBooking}
                  className="px-6 py-3 border border-red-200 text-red-600 bg-white rounded-lg font-medium hover:bg-red-50 transition"
                >
                  Cancella Prenotazione
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
