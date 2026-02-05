# 🚀 Quick Start - Travelli Amo

## ✅ Cosa è stato creato

✓ **Struttura Next.js 14** con App Router e JavaScript
✓ **Pagine pubbliche**: Homepage con lista pacchetti e filtri
✓ **Autenticazione**: Login e registrazione utenti
✓ **Sistema prenotazioni**: Per utenti autenticati
✓ **Dashboard Admin**: Per gestire pacchetti viaggio (CRUD completo)
✓ **Database schema**: Documentazione completa in DATABASE_SCHEMA.md
✓ **Styling**: Tailwind CSS configurato

## 🎯 Prossimi Passi Obbligatori

### 1. ⚙️ Configura Supabase (IMPORTANTE!)

Il sito attualmente **NON funzionerà** finché non configuri Supabase:

1. **Leggi** [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) per istruzioni dettagliate
2. **Crea** un progetto gratuito su [supabase.com](https://supabase.com)
3. **Copia** le credenziali nel file `.env.local`
4. **Esegui** gli script SQL per creare le tabelle
5. **Crea** il primo utente admin

### 2. 🔄 Riavvia il server

```bash
# Se il server è già attivo, fermalo e riavvialo
npm run dev
```

### 3. 🧪 Testa l'applicazione

1. Apri http://localhost:3000
2. Registra un nuovo utente
3. Rendi l'utente admin (query SQL in SUPABASE_SETUP.md)
4. Accedi e crea pacchetti viaggio

## 📂 File Importanti

| File | Descrizione |
|------|-------------|
| `.env.local` | **DEVI CONFIGURARE** le credenziali Supabase qui |
| `SUPABASE_SETUP.md` | Guida completa setup database |
| `DATABASE_SCHEMA.md` | Schema database e queries SQL |
| `README.md` | Documentazione completa del progetto |

## 🎨 Struttura Pagine

### Pagine Pubbliche
- `/` - Homepage con lista pacchetti e filtri
- `/pacchetti/[id]` - Dettaglio pacchetto con prenotazione
- `/login` - Login utenti
- `/registrazione` - Registrazione nuovi utenti

### Pagine Admin (solo per is_admin=true)
- `/admin` - Dashboard con lista pacchetti
- `/admin/pacchetti/nuovo` - Crea nuovo pacchetto
- `/admin/pacchetti/[id]` - Modifica pacchetto esistente

## 🛠️ Comandi Disponibili

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Start produzione
npm start

# Lint
npm run lint
```

## ⚠️ Nota Importante

**Il file `.env.local` contiene credenziali placeholder!**

Devi sostituirle con le tue credenziali reali da Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://il-tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...la-tua-chiave
```

## 🐛 Problemi Comuni

| Problema | Soluzione |
|----------|-----------|
| Errore "Invalid API key" | Configura `.env.local` con credenziali Supabase |
| Nessun pacchetto visibile | Crea pacchetti dalla dashboard admin |
| Non posso creare pacchetti | Verifica che l'utente sia admin (`is_admin=true`) |
| Errore al login/registrazione | Verifica setup database Supabase |

## 📚 Prossime Funzionalità da Implementare

- [ ] Upload immagini con Supabase Storage
- [ ] Pagina profilo utente con cronologia prenotazioni
- [ ] Gestione stati prenotazione (admin può confermare/cancellare)
- [ ] Notifiche email automatiche
- [ ] Sistema di recensioni pacchetti
- [ ] Paginazione lista pacchetti
- [ ] Miglioramento filtri con dropdown

## 🎓 Risorse

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Server attualmente in esecuzione su:** http://localhost:3000

**Inizia configurando Supabase seguendo** [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) 🚀
