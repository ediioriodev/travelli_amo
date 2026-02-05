'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageCarousel from '@/components/ImageCarousel'
import { useModal } from '@/context/ModalContext'

export default function PackageDetailPage({ params }) {
  const { showModal } = useModal()
  const [package_, setPackage] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  
  // Booking Form State
  const [people, setPeople] = useState(1)
  const [notes, setNotes] = useState('')

  const router = useRouter()

  useEffect(() => {
    fetchPackage()
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchPackage() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setPackage(data)
      }
    } catch (error) {
      console.error('Error fetching package:', error)
      showModal('Errore', 'Impossibile caricare il pacchetto.')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleBooking() {
    if (!user) {
      router.push('/login')
      return
    }

    if (people > package_.disponibilita) {
      showModal('Attenzione', `Spiacenti, sono rimasti solo ${package_.disponibilita} posti disponibili.`)
      return
    }

    setBookingLoading(true)

    try {
      const totalPrice = package_.prezzo * people

      // 1. Crea la prenotazione
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            package_id: package_.id,
            status: 'pending',
            total_price: totalPrice,
            numero_persone: people,
            note: notes
          },
        ])

      if (bookingError) throw bookingError

      // 2. Aggiorna la disponibilità del pacchetto
      const { error: updateError } = await supabase
        .from('packages')
        .update({ disponibilita: package_.disponibilita - people })
        .eq('id', package_.id)

      if (updateError) {
        console.error('Errore aggiornamento disponibilità:', updateError)
        // Non blocchiamo l'utente qui, la prenotazione è comunque registrata
      }

      await showModal('Prenotazione Confermata', 'Prenotazione effettuata con successo! Verrai contattato a breve.')
      router.push('/prenotazioni') // Reindirizza alle MIE prenotazioni
    } catch (error) {
      showModal('Errore', 'Errore durante la prenotazione: ' + error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    )
  }

  if (!package_) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Pacchetto non trovato</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            ← Torna ai pacchetti
          </Link>
        </header>

        {/* Package Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Carousel */}
          <div>
            <ImageCarousel 
              images={package_.galleria && package_.galleria.length > 0 ? package_.galleria : (package_.foto_url ? [package_.foto_url] : [])} 
              title={package_.titolo} 
            />
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-primary-600">{package_.titolo}</h1>
                <p className="text-xl text-gray-600">
                  {package_.citta}, {package_.paese}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-600">
                  €{package_.prezzo}
                </div>
                <div className="text-sm text-gray-500">per persona</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-600">Descrizione</h2>
              <p className="text-gray-700">{package_.descrizione}</p>
            </div>

            {/* Dates */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-600">Date</h2>
              <div className="flex gap-4">
                <div className="text-gray-700">
                  <span className="font-semibold text-gray-600">Inizio:</span>{' '}
                  {new Date(package_.data_inizio).toLocaleDateString('it-IT')}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold text-gray-600">Fine:</span>{' '}
                  {new Date(package_.data_fine).toLocaleDateString('it-IT')}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold text-gray-600">Durata:</span> {package_.giorni} giorni
                </div>
              </div>
            </div>

            {/* Flight Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-600">Informazioni Volo</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold text-gray-600">Volo:</span> {package_.volo_partenza} -  {package_.volo_destinazione}</p>
                <p><span className="font-semibold text-gray-600">Orari (Andata - Ritorno):</span> {package_.orario_partenza} - {package_.orario_ritorno}</p>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-600">Hotel</h2>
              {package_.hotel_url ? (
                <a 
                  href={package_.hotel_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary-600 hover:underline text-lg"
                >
                  {package_.hotel} ↗
                </a>
              ) : (
                <p className="text-gray-700">{package_.hotel}</p>
              )}
            </div>

            {/* Booking Section */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Prenota il tuo viaggio</h2>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numero di Viaggiatori
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={package_.disponibilita}
                      value={people}
                      onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-800"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Posti disponibili: {package_.disponibilita}
                    </p>
                  </div>

                  {/* Total Price Preview */}
                  <div className="flex flex-col justify-end">
                    <div className="text-right">
                      <span className="text-gray-600 block text-sm">Prezzo Totale</span>
                      <span className="text-3xl font-bold text-primary-600">
                        €{(package_.prezzo * people).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note o Richieste Speciali
                  </label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Intolleranze, esigenze particolari, ecc..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-800"
                  />
                </div>

                {/* Action Button */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || package_.disponibilita <= 0}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg text-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {bookingLoading ? 'Elaborazione in corso...' : 
                   package_.disponibilita <= 0 ? 'Esaurito' : 'Conferma Prenotazione'}
                </button>
                
                {!user && (
                  <p className="text-center text-sm text-red-500 bg-red-50 py-2 rounded">
                    ⚠️ Devi effettuare il login per completare la prenotazione
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
