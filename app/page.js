'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useModal } from '@/context/ModalContext'

export default function Home() {
  const { showModal } = useModal()
  const [packages, setPackages] = useState([])
  const [filteredPackages, setFilteredPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    destinazione: '',
    dataInizio: '',
    dataFine: '',
    budgetMax: '',
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, packages])

  async function fetchPackages() {
    console.log('Fetching packages...')
    
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        console.log('Packages loaded from DB:', data)
        setPackages(data)
        setFilteredPackages(data)
      }
    } catch (error) {
      console.error('Error fetching from Supabase:', error)
      showModal('Errore', 'Impossibile caricare i pacchetti dal server.')
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...packages]

    // Filtro destinazione (paese o città)
    if (filters.destinazione) {
      const search = filters.destinazione.toLowerCase()
      filtered = filtered.filter(pkg =>
        pkg.paese.toLowerCase().includes(search) ||
        pkg.citta.toLowerCase().includes(search)
      )
    }

    // Filtro data inizio
    if (filters.dataInizio) {
      filtered = filtered.filter(pkg =>
        new Date(pkg.data_inizio) >= new Date(filters.dataInizio)
      )
    }

    // Filtro data fine
    if (filters.dataFine) {
      filtered = filtered.filter(pkg =>
        new Date(pkg.data_fine) <= new Date(filters.dataFine)
      )
    }

    // Filtro budget
    if (filters.budgetMax) {
      filtered = filtered.filter(pkg =>
        pkg.prezzo <= parseFloat(filters.budgetMax)
      )
    }

    setFilteredPackages(filtered)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-800">
            Inspiring your Wanderlust
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            I migliori pacchetti viaggio per le destinazioni più belle
          </p>
        </section>

        {/* Filters Section */}
        <section className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Filtra i Pacchetti</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="destinazione"
              placeholder="Destinazione (paese o città)"
              value={filters.destinazione}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
            />
            <input
              type="date"
              name="dataInizio"
              placeholder="Data inizio"
              value={filters.dataInizio}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
            />
            <input
              type="date"
              name="dataFine"
              placeholder="Data fine"
              value={filters.dataFine}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
            />
            <input
              type="number"
              name="budgetMax"
              placeholder="Budget max (€)"
              value={filters.budgetMax}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
            />
          </div>
          {(filters.destinazione || filters.dataInizio || filters.dataFine || filters.budgetMax) && (
            <button
              onClick={() => setFilters({ destinazione: '', dataInizio: '', dataFine: '', budgetMax: '' })}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm"
            >
              Cancella filtri
            </button>
          )}
        </section>

        {/* Packages Grid */}
        <section>
          <h3 className="text-2xl font-semibold mb-6 text-gray-900">
            Pacchetti Disponibili ({filteredPackages.length})
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Caricamento pacchetti...</div>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Nessun pacchetto trovato</div>
              <p className="text-gray-500 mt-2">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  {pkg.foto_url ? (
                    <div className="relative h-48">
                      <Image
                        src={pkg.foto_url}
                        alt={pkg.titolo}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl">📸</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-xl font-semibold mb-2 text-gray-900">{pkg.titolo}</h4>
                    <p className="text-gray-600 mb-2">
                      {pkg.citta}, {pkg.paese}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {pkg.giorni} giorni • {new Date(pkg.data_inizio).toLocaleDateString('it-IT')}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary-600">€{pkg.prezzo}</span>
                      <Link 
                        href={`/pacchetti/${pkg.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                      >
                        Dettagli
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
