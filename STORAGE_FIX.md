# Configurazione Storage Supabase

L'errore "Bad Request" (400) durante il caricamento delle immagini indica solitamente che il "Bucket" di storage non esiste o non ha le policy corrette.

Per risolvere, esegui questi passaggi nella dashboard di Supabase:

1.  Vai alla sezione **SQL Editor**.
2.  Copia e incolla il seguente codice SQL.
3.  Esegui lo script (pulsante "Run").

```sql
-- 1. Crea il bucket per le immagini dei pacchetti (se non esiste già)
insert into storage.buckets (id, name, public)
values ('package-images', 'package-images', true)
on conflict (id) do nothing;

-- 2. Rimuovi vecchie policy per evitare duplicati
drop policy if exists "Public images are viewable by everyone" on storage.objects;
drop policy if exists "Only admins can upload images" on storage.objects;
drop policy if exists "Admins can update images" on storage.objects;
drop policy if exists "Admins can delete images" on storage.objects;

-- 3. Crea policy: Chiunque può vedere le immagini (SELECT)
create policy "Public images are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'package-images');

-- 4. Crea policy: Solo gli admin possono caricare immagini (INSERT)
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

-- 5. Crea policy: Solo gli admin possono modificare immagini (UPDATE)
create policy "Admins can update images"
  on storage.objects for update
  using (
    bucket_id = 'package-images' and
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );


-- 6. Crea policy: Solo gli admin possono cancellare immagini (DELETE)
create policy "Admins can delete images"
  on storage.objects for delete
  using (
    bucket_id = 'package-images' and
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );
```

Dopo aver eseguito questo script, prova nuovamente a caricare un'immagine.
