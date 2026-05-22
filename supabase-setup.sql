-- ======================================================
-- SETUP SUPABASE — Planning EAJ BA 116
-- ======================================================
-- À lancer dans Supabase > SQL Editor.
-- Ensuite : crée un utilisateur dans Authentication > Users,
-- puis ajoute son UUID dans public.eaj_admins.

create table if not exists public.eaj_planning_state (
  id text primary key default 'main' check (id = 'main'),

  semaines jsonb not null default '[]'::jsonb,
  alert_banners jsonb not null default '[]'::jsonb,
  alert_banner jsonb not null default '{"actif": false, "texte": ""}'::jsonb,
  last_update jsonb not null default '{"auteur": "", "dateTexte": ""}'::jsonb,

  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  updated_by_name text
);

create table if not exists public.eaj_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.eaj_planning_state enable row level security;
alter table public.eaj_admins enable row level security;

-- Supabase Data API : lecture publique du planning, écriture authentifiée puis filtrée par RLS.
grant usage on schema public to anon, authenticated;
grant select on public.eaj_planning_state to anon, authenticated;
grant update on public.eaj_planning_state to authenticated;
grant select on public.eaj_admins to authenticated;

-- Nettoyage si tu relances ce script.
drop policy if exists "Tout le monde peut lire le planning" on public.eaj_planning_state;
drop policy if exists "Seuls les admins peuvent modifier le planning" on public.eaj_planning_state;
drop policy if exists "Un utilisateur peut lire son statut admin" on public.eaj_admins;

create policy "Tout le monde peut lire le planning"
on public.eaj_planning_state
for select
to anon, authenticated
using (id = 'main');

create policy "Seuls les admins peuvent modifier le planning"
on public.eaj_planning_state
for update
to authenticated
using (
  exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
)
with check (
  id = 'main'
  and exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
);

create policy "Un utilisateur peut lire son statut admin"
on public.eaj_admins
for select
to authenticated
using (user_id = auth.uid());

-- Ligne principale du planning.
insert into public.eaj_planning_state (id)
values ('main')
on conflict (id) do nothing;

-- IMPORTANT REALTIME :
-- Pour le rafraîchissement presque live, active la table eaj_planning_state
-- dans Supabase > Database > Replication / Realtime.
-- Tu peux aussi essayer cette ligne SQL. Si elle indique que la table est déjà ajoutée, ignore l'erreur.
-- alter publication supabase_realtime add table public.eaj_planning_state;

-- EXEMPLE : ajouter ton compte admin après création dans Authentication > Users.
-- Remplace l'UUID par celui de ton utilisateur Supabase.
-- insert into public.eaj_admins (user_id, display_name, active)
-- values ('00000000-0000-0000-0000-000000000000', 'Yoann', true)
-- on conflict (user_id) do update set display_name = excluded.display_name, active = true;
