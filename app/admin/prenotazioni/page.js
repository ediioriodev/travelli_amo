'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';

export default function AdminPrenotazioniPage() {
  const { showModal } = useModal();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state for the modal
  const [status, setStatus] = useState('');
  const [noteAgenzia, setNoteAgenzia] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users (
            nome,
            cognome,
            email,
            telefono
          ),
          packages (
            titolo,
            data_inizio,
            data_fine
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Errore durante il recupero delle prenotazioni:', error);
      showModal('Errore', 'Non è stato possibile caricare le prenotazioni.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageClick = (booking) => {
    setSelectedBooking(booking);
    setStatus(booking.status);
    setNoteAgenzia(booking.note_agenzia || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setStatus('');
    setNoteAgenzia('');
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('bookings')
        .update({
          status: status,
          note_agenzia: noteAgenzia
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status, note_agenzia: noteAgenzia } 
          : b
      ));

      handleCloseModal();
      showModal('Successo', 'Prenotazione aggiornata con successo!');
    } catch (error) {
      console.error('Errore aggiornamento prenotazione:', error);
      showModal('Errore', 'Errore durante l\'aggiornamento della prenotazione. Assicurati di aver eseguito le migrazioni del database.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const translateStatus = (s) => {
    switch (s) {
      case 'confirmed': return 'Confermata';
      case 'cancelled': return 'Cancellata';
      case 'pending': return 'In Attesa';
      default: return s;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Caricamento prenotazioni...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestione Prenotazioni</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Nessuna prenotazione trovata.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pacchetto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.created_at, true)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.users?.nome} {booking.users?.cognome}
                      </div>
                      <div className="text-sm text-gray-500">{booking.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.packages?.titolo}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(booking.packages?.data_inizio)} - {formatDate(booking.packages?.data_fine)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {translateStatus(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      € {booking.total_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleManageClick(booking)}
                        className="text-primary-600 hover:text-primary-900 font-bold"
                      >
                        Gestisci
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal di Gestione */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Gestione Prenotazione</h3>
              <button onClick={handleCloseModal} className="text-white hover:text-gray-200">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">Dettagli Cliente</h4>
                  <p className="text-sm"><span className="font-semibold">Nome:</span> {selectedBooking.users?.nome} {selectedBooking.users?.cognome}</p>
                  <p className="text-sm"><span className="font-semibold">Email:</span> {selectedBooking.users?.email}</p>
                  <p className="text-sm"><span className="font-semibold">Telefono:</span> {selectedBooking.users?.telefono || '-'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">Dettagli Viaggio</h4>
                  <p className="text-sm"><span className="font-semibold">Pacchetto:</span> {selectedBooking.packages?.titolo}</p>
                  <p className="text-sm"><span className="font-semibold">Date:</span> {formatDate(selectedBooking.packages?.data_inizio)} - {formatDate(selectedBooking.packages?.data_fine)}</p>
                  <p className="text-sm"><span className="font-semibold">Prezzo Totale:</span> € {selectedBooking.total_price}</p>
                  <p className="text-sm mt-1"><span className="font-semibold">Data Prenotazione:</span> {formatDate(selectedBooking.created_at, true)}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateBooking} className="border-t pt-6">
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Stato Prenotazione</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="pending">In Attesa</option>
                    <option value="confirmed">Confermata</option>
                    <option value="cancelled">Cancellata</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="noteAgenzia" className="block text-sm font-medium text-gray-700 mb-1">
                    Note / Istruzioni / Dettagli Pagamento
                    <span className="text-gray-400 font-normal ml-2 text-xs">(Visibili al cliente)</span>
                  </label>
                  <textarea
                    id="noteAgenzia"
                    rows="5"
                    value={noteAgenzia}
                    onChange={(e) => setNoteAgenzia(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Inserisci qui i dettagli per il pagamento, conferme o altre comunicazioni per il cliente..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
