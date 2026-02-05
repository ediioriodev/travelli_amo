'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useModal } from '@/context/ModalContext'

export default function EditPackagePage({ params }) {
  const { showModal } = useModal()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    paese: '',
    citta: '',
    data_inizio: '',
    data_fine: '',
    giorni: 0,
    prezzo: 0,
    volo_partenza: '',
    volo_destinazione: '',
    orario_partenza: '',
    orario_ritorno: '',
    hotel: '',
    hotel_url: '',
    foto_url: '',
    galleria: [],
    disponibilita: 0,
  })

  useEffect(() => {
    fetchPackage()
  }, [])

  async function fetchPackage() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData(data)
      }
    } catch (error) {
      console.error('Error fetching package:', error)
      showModal('Errore', 'Impossibile caricare il pacchetto.')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  // Function to upload to Supabase Storage
  const uploadImage = async (file) => {
    // 1. Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    // 2. Upload to bucket
    const { error: uploadError } = await supabase.storage
      .from('package-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 3. Get Public URL
    const { data } = supabase.storage
      .from('package-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setSaving(true) // Use saving indicator for upload
    try {
      const newUrls = await Promise.all(files.map(uploadImage))
      
      setFormData(prev => {
        const updatedGalleria = [...(prev.galleria || []), ...newUrls]
        // If no cover image set, use the first one of the new batch (or the first of the updated list)
        const updatedFotoUrl = prev.foto_url || updatedGalleria[0]
        
        return {
          ...prev,
          galleria: updatedGalleria,
          foto_url: updatedFotoUrl
        }
      })
    } catch (error) {
      console.error('Detailed upload error:', error)
      showModal('Errore', 'Errore caricamento immagini: ' + (error.message || error.error_description || JSON.stringify(error)))
    } finally {
      setSaving(false)
    }
  }

  const setCoverImage = (url) => {
    setFormData(prev => ({
      ...prev,
      foto_url: url
    }))
  }

  const removeImage = (urlToRemove) => {
    setFormData(prev => {
      const newGalleria = prev.galleria.filter(url => url !== urlToRemove)
      // If we removed the cover image, set a new one if possible
      let newFotoUrl = prev.foto_url
      if (prev.foto_url === urlToRemove) {
        newFotoUrl = newGalleria.length > 0 ? newGalleria[0] : ''
      }
      return {
        ...prev,
        galleria: newGalleria,
        foto_url: newFotoUrl
      }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('packages')
        .update(formData)
        .eq('id', params.id)

      if (error) throw error

      await showModal('Successo', 'Pacchetto aggiornato con successo!')
      router.push('/admin')
    } catch (error) {
      showModal('Errore', 'Errore: ' + error.message)
    } finally {
      setSaving(false)
    }
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
        <header className="mb-8">
          <Link href="/admin" className="text-primary-600 hover:text-primary-700">
            ← Torna alla Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4 text-primary-600">Modifica Pacchetto Viaggio</h1>
        </header>

        <div className="bg-white rounded-lg shadow p-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo *
              </label>
              <input
                type="text"
                name="titolo"
                required
                value={formData.titolo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione *
              </label>
              <textarea
                name="descrizione"
                required
                rows="4"
                value={formData.descrizione}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paese *
                </label>
                <input
                  type="text"
                  name="paese"
                  required
                  value={formData.paese}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Città *
                </label>
                <input
                  type="text"
                  name="citta"
                  required
                  value={formData.citta}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inizio *
                </label>
                <input
                  type="date"
                  name="data_inizio"
                  required
                  value={formData.data_inizio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fine *
                </label>
                <input
                  type="date"
                  name="data_fine"
                  required
                  value={formData.data_fine}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giorni *
                </label>
                <input
                  type="number"
                  name="giorni"
                  required
                  min="1"
                  value={formData.giorni}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prezzo (€) *
                </label>
                <input
                  type="number"
                  name="prezzo"
                  required
                  min="0"
                  step="0.01"
                  value={formData.prezzo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posti Disponibili *
                </label>
                <input
                  type="number"
                  name="disponibilita"
                  required
                  min="0"
                  value={formData.disponibilita}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div> 
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volo: Partenza (Aeroporto) *
                </label>
                <input
                  type="text"
                  name="volo_partenza"
                  required
                  placeholder="es. Milano Malpensa"
                  value={formData.volo_partenza}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volo: Destinazione (Aeroporto) *
                </label>
                <input
                  type="text"
                  name="volo_destinazione"
                  required
                  placeholder="es. Parigi CDG"
                  value={formData.volo_destinazione}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orario Partenza *
                </label>
                <input
                  type="time"
                  name="orario_partenza"
                  required
                  value={formData.orario_partenza}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orario Ritorno *
                </label>
                <input
                  type="time"
                  name="orario_ritorno"
                  required
                  value={formData.orario_ritorno}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Hotel *
                </label>
                <input
                  type="text"
                  name="hotel"
                  required
                  value={formData.hotel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Hotel (URL)
                </label>
                <input
                  type="url"
                  name="hotel_url"
                  placeholder="https://..."
                  value={formData.hotel_url || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Galleria Immagini</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carica Immagini (Seleziona multipli)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                />
              </div>

              {/* Image Preview Grid */}
              {formData.galleria && formData.galleria.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.galleria.map((url, index) => (
                    <div key={index} className={`relative group rounded-lg overflow-hidden border-2 ${formData.foto_url === url ? 'border-primary-500' : 'border-transparent'}`}>
                      <img src={url} alt={`Preview ${index}`} className="w-full h-32 object-cover" />
                      
                      {/* Cover Indicator */}
                      {formData.foto_url === url && (
                        <div className="absolute top-0 left-0 bg-primary-500 text-white text-xs px-2 py-1 z-10">
                          Copertina
                        </div>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCoverImage(url)}
                          className="px-3 py-1 bg-white text-xs font-medium text-gray-900 rounded hover:bg-gray-100"
                        >
                          Usa come copertina
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="px-3 py-1 bg-red-600 text-xs font-medium text-white rounded hover:bg-red-700"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
              <Link
                href="/admin"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 text-center"
              >
                Annulla
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
