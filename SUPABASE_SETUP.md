# Guida Setup Supabase

## 1. Crea un nuovo progetto
1. Vai su [Supabase](https://supabase.com) e crea un nuovo progetto
2. Salva la password del database
3. Ottieni URL e Anon Key dalle impostazioni del progetto (Settings -> API)

## 2. Configura le variabili d'ambiente
Crea un file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_SUPABASE_URL=tua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua_chiave_anonima
```

## 3. Configura Database e Tabelle

Vai nell'SQL Editor di Supabase ed esegui i seguenti script in ordine:

### A. Utenti (Setup Iniziale)
```sql
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  nome text not null,
  cognome text not null,
  telefono text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone default null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies
create policy "Users can view own data" on public.users for select using (auth.uid() = id and deleted_at is null);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
create policy "Enable insert for authenticated users" on public.users for insert with check (auth.uid() = id);
```

### B. Pacchetti
```sql
create table public.packages (
  id uuid default gen_random_uuid() primary key,
  titolo text not null,
  descrizione text not null,
  paese text not null,
  citta text not null,
  data_inizio date not null,
  data_fine date not null,
  giorni integer not null,
  prezzo numeric(10,2) not null,
  volo_partenza text not null,
  volo_destinazione text not null,
  orario_partenza time not null,
  orario_ritorno time not null,
  hotel text not null,
  foto_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone default null
);

-- Enable RLS
alter table public.packages enable row level security;

-- Policies
create policy "Packages are viewable by everyone" on public.packages for select using (deleted_at is null);

create policy "Only admins can insert packages" on public.packages for insert with check (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

create policy "Only admins can update packages" on public.packages for update using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

create policy "Only admins can delete packages" on public.packages for delete using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

create index packages_deleted_at_idx on public.packages(deleted_at);
```

### C. Prenotazioni
```sql
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  package_id uuid references public.packages on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  total_price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone default null
);

-- Enable RLS
alter table public.bookings enable row level security;

-- Policies
create policy "Users can view own bookings" on public.bookings for select using (auth.uid() = user_id and deleted_at is null);
create policy "Users can create own bookings" on public.bookings for insert with check (auth.uid() = user_id);

create policy "Admins can view all bookings" on public.bookings for select using (
  (exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true))
  and deleted_at is null
);

create policy "Admins can update all bookings" on public.bookings for update using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

create index bookings_deleted_at_idx on public.bookings(deleted_at);
```

### D. Triggers
```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_packages_updated_at before update on public.packages for each row execute procedure public.handle_updated_at();
create trigger set_bookings_updated_at before update on public.bookings for each row execute procedure public.handle_updated_at();
```

## 4. Setup Storage
1. Vai su Storage -> Create new bucket
2. Nome: `package-images`
3. Attiva "Public bucket"
4. Aggiungi le policy indicate nello schema completo DATABASE_SCHEMA.md

## 5. Inserisci Dati di Test (Opzionale)

Dopo aver creato le tabelle, puoi inserire alcuni pacchetti di prova:

```sql
-- Inserisci alcuni pacchetti di esempio
insert into public.packages (titolo, descrizione, paese, citta, data_inizio, data_fine, giorni, prezzo, volo_partenza, volo_destinazione, orario_partenza, orario_ritorno, hotel, foto_url) values
('Weekend a Parigi', 'Scopri la città dell''amore con il nostro pacchetto weekend', 'Francia', 'Parigi', '2026-03-15', '2026-03-18', 3, 599.99, 'Milano Malpensa', 'Paris CDG', '08:00:00', '09:30:00', 'Hotel Eiffel Seine 4*', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'),
('Settimana a Barcellona', 'Una settimana indimenticabile nella capitale catalana', 'Spagna', 'Barcellona', '2026-04-10', '2026-04-17', 7, 899.99, 'Roma Fiumicino', 'Barcelona El Prat', '10:30:00', '12:15:00', 'Hotel Arts Barcelona 5*', 'https://images.unsplash.com/photo-1583422409516-2895a77efded'),
('Tour delle Capitali', 'Londra, Parigi e Amsterdam in un unico viaggio', 'Multi', 'Londra', '2026-05-20', '2026-05-30', 10, 1499.99, 'Milano Linate', 'London Heathrow', '07:00:00', '08:00:00', 'Hotel vari 4*', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('Magica Praga', 'Quattro giorni nella città delle cento torri', 'Repubblica Ceca', 'Praga', '2026-06-05', '2026-06-09', 4, 699.99, 'Bologna', 'Prague Václav Havel', '09:15:00', '10:45:00', 'Hotel Prague Castle 4*', 'https://images.unsplash.com/photo-1541849546-216549ae216d');
```

## 6. Crea il Primo Utente Admin

1. Vai sul sito e registra un nuovo utente
2. Torna su Supabase → SQL Editor
3. Esegui questa query per rendere l'utente admin (sostituisci con la tua email):

```sql
update public.users
set is_admin = true
where email = 'tua@email.com';
```
