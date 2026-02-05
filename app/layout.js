import './globals.css'
import Navbar from '@/components/Navbar'
import { Providers } from './providers'

export const metadata = {
  title: 'Travelli Amo - Agenzia Viaggi',
  description: 'Prenota i tuoi viaggi da sogno con Travelli Amo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
