# Travelli Amo - Agenzia Viaggi E-commerce

Un'applicazione e-commerce per un'agenzia di viaggi sviluppata con Next.js 14 e Supabase.

## 🌟 Funzionalità

### Per gli Utenti
- **Visualizzazione Pacchetti**: Esplora i pacchetti viaggio disponibili con filtri per destinazione, date e budget
- **Dettaglio Pacchetto**: Vedi informazioni complete su voli, hotel, date e prezzi
- **Sistema di Prenotazione**: Prenota pacchetti viaggio direttamente dal sito (richiede registrazione)
- **Registrazione/Login**: Crea un account o accedi con email e password
- **Profilo Utente**: Gestisci i tuoi dati personali e visualizza le prenotazioni

### Per gli Amministratori
- **Dashboard Admin**: Interfaccia dedicata per la gestione dei pacchetti
- **CRUD Pacchetti**: Crea, modifica ed elimina pacchetti viaggio
- **Gestione Completa**: Inserisci foto, dati di viaggio, voli, hotel, date e prezzi
- **Visualizzazione Prenotazioni**: Vedi tutte le prenotazioni effettuate dagli utenti

## 🛠️ Tecnologie Utilizzate

- **Next.js 14**: Framework React con App Router
- **JavaScript**: Linguaggio di programmazione
- **Tailwind CSS**: Framework CSS per lo styling
- **Supabase**: Backend-as-a-Service per database e autenticazione
  - PostgreSQL database
  - Auth con Row Level Security
  - Storage per immagini (opzionale)

## 📁 Struttura del Progetto

```
travelli_amo/
├── app/
│   ├── admin/
│   │   ├── pacchetti/
│   │   │   ├── [id]/
│   │   │   │   └── page.js       # Modifica pacchetto
│   │   │   └── nuovo/
│   │   │       └── page.js       # Nuovo pacchetto
│   │   └── page.js               # Dashboard admin
│   ├── login/
│   │   └── page.js               # Pagina login
│   ├── registrazione/
│   │   └── page.js               # Pagina registrazione
│   ├── pacchetti/
│   │   └── [id]/
│   │       └── page.js           # Dettaglio pacchetto
│   ├── layout.js                 # Layout principale
│   ├── page.js                   # Homepage
│   └── globals.css               # Stili globali
├── lib/
│   └── supabase.js               # Client Supabase
├── .env.local.example            # Esempio variabili ambiente
├── DATABASE_SCHEMA.md            # Schema database Supabase
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🚀 Setup e Installazione

### 1. Prerequisiti
- Node.js 18+ installato
- Un account Supabase (gratuito su [supabase.com](https://supabase.com))

### 2. Installazione Dipendenze

```bash
npm install
```

### 3. Configurazione Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Vai nelle impostazioni del progetto → API
3. Copia `Project URL` e `anon/public key`
4. Crea un file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Database

Esegui gli script SQL contenuti in `DATABASE_SCHEMA.md` nell'SQL Editor di Supabase per creare:
- Tabella `users`
- Tabella `packages`
- Tabella `bookings`
- Row Level Security policies
- Trigger per updated_at

### 5. Creazione Admin

Dopo aver creato il database:
1. Registrati tramite il form di registrazione del sito
2. Esegui questo query in Supabase SQL Editor (sostituendo con la tua email):

```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'tua-email@esempio.com';
```

### 6. Avvio dell'Applicazione

```bash
# Modalità sviluppo
npm run dev

# Build per produzione
npm run build

# Avvio produzione
npm start
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 📖 Utilizzo

### Per Utenti
1. Visita la homepage per vedere i pacchetti disponibili
2. Usa i filtri per cercare pacchetti per destinazione, date o budget
3. Clicca su un pacchetto per vedere i dettagli completi
4. Registrati/Accedi per prenotare un pacchetto
5. Conferma la prenotazione

### Per Amministratori
1. Accedi con un account amministratore
2. Sarai reindirizzato alla Dashboard Admin
3. Clicca su "Aggiungi Nuovo Pacchetto" per creare un pacchetto
4. Compila tutti i campi richiesti (titolo, destinazione, date, prezzi, voli, hotel)
5. Salva il pacchetto
6. Modifica o elimina pacchetti esistenti dalla dashboard

## 🔒 Sicurezza

- **Row Level Security (RLS)**: Tutte le tabelle hanno policy RLS attive
- **Autenticazione**: Gestita da Supabase Auth
- **Protezione Admin**: Solo utenti con flag `is_admin=true` possono accedere alle funzionalità admin
- **Validazione Client**: Tutti i form hanno validazione lato client
- **Variabili Ambiente**: Le chiavi sensibili sono mantenute in `.env.local`

## 🎨 Personalizzazione

### Colori
I colori del tema possono essere modificati in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Colore principale
    600: '#0284c7',
    // ...
  },
}
```

### Stili Globali
Modifica `app/globals.css` per personalizzare gli stili globali.

## 📝 TODO / Miglioramenti Futuri

- [ ] Implementare filtri funzionanti nella homepage
- [ ] Aggiungere paginazione per i pacchetti
- [ ] Sistema di upload immagini con Supabase Storage
- [ ] Pagina profilo utente con cronologia prenotazioni
- [ ] Sistema di notifiche email con Supabase
- [ ] Dashboard admin con statistiche
- [ ] Gestione stati prenotazione (pending/confirmed/cancelled)
- [ ] Sistema di recensioni pacchetti
- [ ] Integrazione pagamenti (Stripe/PayPal)
- [ ] Supporto multilingua

## 🐛 Risoluzione Problemi

### Errore: "Invalid API key"
Verifica che le variabili in `.env.local` siano corrette e che il file sia nella root del progetto.

### Non riesco ad accedere alla dashboard admin
Verifica che l'utente abbia il flag `is_admin = true` nel database.

### Le immagini non vengono visualizzate
Verifica che l'URL delle immagini sia valido e accessibile pubblicamente.

## 📄 Licenza

Questo progetto è stato creato per scopi educativi e dimostrativi.

## 👥 Contributi

Contributi, issue e feature request sono benvenuti!

## 📧 Contatti

Per domande o supporto, contatta l'agenzia Travelli Amo.
