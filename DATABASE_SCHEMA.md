# Travelli Amo - Database Schema

## Tabelle Supabase

### 1. users (public.users)
Estende la tabella auth.users di Supabase con informazioni aggiuntive

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

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policy: Users can read their own data (only if not deleted)
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id and deleted_at is null);

-- Policy: Users can update their own data
create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- Policy: Enable insert during registration
create policy "Enable insert for authenticated users"
  on public.users for insert
  with check (auth.uid() = id);
```

### 2. packages (public.packages)
Tabella dei pacchetti viaggio

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
  galleria text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone default null
);

-- Enable Row Level Security
alter table public.packages enable row level security;

-- Policy: Everyone can read active packages
create policy "Packages are viewable by everyone"
  on public.packages for select
  using (deleted_at is null);

-- Policy: Only admins can insert packages
create policy "Only admins can insert packages"
  on public.packages for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );

-- Policy: Only admins can update packages (including soft delete)
create policy "Only admins can update packages"
  on public.packages for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );

-- NOTE: Hard delete prevents soft delete history. 
-- For Soft Delete, use Update to set deleted_at = now()
-- Policy: Only admins can hard delete packages (optional)
create policy "Only admins can delete packages"
  on public.packages for delete
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );

-- Index for filtering
create index packages_paese_idx on public.packages(paese);
create index packages_citta_idx on public.packages(citta);
create index packages_dates_idx on public.packages(data_inizio, data_fine);
create index packages_prezzo_idx on public.packages(prezzo);
create index packages_deleted_at_idx on public.packages(deleted_at);
```

### 3. bookings (public.bookings)
Tabella delle prenotazioni

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

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Policy: Users can read their own bookings (only if not deleted)
create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id and deleted_at is null);

-- Policy: Users can create their own bookings
create policy "Users can create own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Policy: Admins can view all bookings (active only)
create policy "Admins can view all bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
    and deleted_at is null
  );

-- Policy: Admins can update all bookings
create policy "Admins can update all bookings"
  on public.bookings for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );

-- Index for user bookings
create index bookings_user_id_idx on public.bookings(user_id);
create index bookings_package_id_idx on public.bookings(package_id);
create index bookings_status_idx on public.bookings(status);
create index bookings_deleted_at_idx on public.bookings(deleted_at);
```

## Trigger per updated_at

```sql
-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for packages
create trigger set_packages_updated_at
  before update on public.packages
  for each row
  execute procedure public.handle_updated_at();

-- Trigger for bookings
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row
  execute procedure public.handle_updated_at();
```

## Storage per le immagini (opzionale)

```sql
-- Create a bucket for package images
insert into storage.buckets (id, name, public)
values ('package-images', 'package-images', true);

-- Policy: Anyone can view images
create policy "Public images are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'package-images');

-- Policy: Only admins can upload images
create policy "Only admins can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'package-images' and
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );
```

## Creazione utente admin iniziale

Dopo aver creato un utente tramite il form di registrazione, eseguire:

```sql
-- Imposta l'utente come admin (sostituire con l'email dell'admin)
update public.users
set is_admin = true
where email = 'admin@travellamo.com';
```
