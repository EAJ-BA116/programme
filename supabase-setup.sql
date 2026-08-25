-- ======================================================
-- SETUP SUPABASE — Planning EAJ BA 116
-- ======================================================
-- À lancer dans Supabase > SQL Editor.
-- Version 1.6.0 : fusion EAJ2/EAJ3 + sauvegardes + notifications push.
-- Ensuite : crée un utilisateur dans Authentication > Users,
-- puis ajoute son UUID dans public.eaj_admins.

create table if not exists public.eaj_planning_state (
  id text primary key default 'main' check (id = 'main'),

  semaines jsonb not null default '[]'::jsonb,
  alert_banners jsonb not null default '[]'::jsonb,
  alert_banner jsonb not null default '{"actif": false, "texte": ""}'::jsonb,
  last_update jsonb not null default '{"auteur": "", "dateTexte": ""}'::jsonb,
  settings jsonb not null default '{"mergeEaj23": true}'::jsonb,

  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  updated_by_name text
);

-- Migration sûre si la table existait déjà avant la v1.5.0.
alter table public.eaj_planning_state
  add column if not exists settings jsonb not null default '{"mergeEaj23": true}'::jsonb;

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

-- ======================================================
-- Sauvegardes automatiques du planning
-- ======================================================
-- Utilisé par le générateur avant une remise à zéro ou une restauration.

create extension if not exists pgcrypto;

create table if not exists public.eaj_planning_backups (
  id uuid primary key default gen_random_uuid(),
  reason text not null default 'Sauvegarde',
  label text,
  note text,
  backup_type text not null default 'automatic',
  planning jsonb not null,
  source_version integer,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_by_name text
);

alter table public.eaj_planning_backups enable row level security;

grant select, insert, delete on public.eaj_planning_backups to authenticated;

drop policy if exists "Seuls les admins peuvent lister les sauvegardes" on public.eaj_planning_backups;
drop policy if exists "Seuls les admins peuvent créer une sauvegarde" on public.eaj_planning_backups;

create policy "Seuls les admins peuvent lister les sauvegardes"
on public.eaj_planning_backups
for select
to authenticated
using (
  exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
);

create policy "Seuls les admins peuvent créer une sauvegarde"
on public.eaj_planning_backups
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
);


drop policy if exists "Seuls les admins peuvent supprimer les sauvegardes" on public.eaj_planning_backups;
create policy "Seuls les admins peuvent supprimer les sauvegardes"
on public.eaj_planning_backups
for delete
to authenticated
using (
  exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
);

-- EXEMPLE : ajouter ton compte admin après création dans Authentication > Users.
-- Remplace l'UUID par celui de ton utilisateur Supabase.
-- insert into public.eaj_admins (user_id, display_name, active)
-- values ('00000000-0000-0000-0000-000000000000', 'Yoann', true)
-- on conflict (user_id) do update set display_name = excluded.display_name, active = true;


-- ======================================================
-- AJOUT v1.6.0 — Notifications push
-- ======================================================
create extension if not exists pgcrypto;

-- ------------------------------------------------------
-- Appareils abonnés aux notifications
-- ------------------------------------------------------
create table if not exists public.eaj_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.eaj_push_subscriptions enable row level security;

grant select on public.eaj_push_subscriptions to authenticated;

-- Seuls les admins peuvent connaître le nombre / la liste des abonnements.
drop policy if exists "Admins can read push subscriptions" on public.eaj_push_subscriptions;
create policy "Admins can read push subscriptions"
on public.eaj_push_subscriptions
for select
to authenticated
using (
  exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
);

-- L'application publique passe uniquement par ces RPC :
-- aucun accès SELECT/INSERT/UPDATE direct n'est donné aux visiteurs.
create or replace function public.eaj_upsert_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_endpoint is null or length(trim(p_endpoint)) < 20 or length(p_endpoint) > 4096 then
    raise exception 'Endpoint push invalide';
  end if;
  if left(lower(trim(p_endpoint)), 8) <> 'https://' then
    raise exception 'Endpoint push non HTTPS';
  end if;
  if p_p256dh is null or length(p_p256dh) < 20 or length(p_p256dh) > 512 then
    raise exception 'Clé p256dh invalide';
  end if;
  if p_auth is null or length(p_auth) < 8 or length(p_auth) > 256 then
    raise exception 'Clé auth invalide';
  end if;

  insert into public.eaj_push_subscriptions (
    endpoint, p256dh, auth, user_agent, enabled, created_at, updated_at, last_seen_at
  ) values (
    trim(p_endpoint), p_p256dh, p_auth, left(coalesce(p_user_agent, ''), 500), true, now(), now(), now()
  )
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent,
    enabled = true,
    updated_at = now(),
    last_seen_at = now();
end;
$$;

create or replace function public.eaj_remove_push_subscription(p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_endpoint is null or length(trim(p_endpoint)) < 20 then
    return;
  end if;

  update public.eaj_push_subscriptions
  set enabled = false,
      updated_at = now()
  where endpoint = trim(p_endpoint);
end;
$$;

revoke all on function public.eaj_upsert_push_subscription(text, text, text, text) from public;
revoke all on function public.eaj_remove_push_subscription(text) from public;
grant execute on function public.eaj_upsert_push_subscription(text, text, text, text) to anon, authenticated;
grant execute on function public.eaj_remove_push_subscription(text) to anon, authenticated;

-- ------------------------------------------------------
-- Historique des notifications envoyées
-- ------------------------------------------------------
create table if not exists public.eaj_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'information'
    check (kind in ('information', 'important', 'update', 'reminder')),
  title text not null,
  body text not null,
  url text not null default 'index.html',
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'partial', 'failed')),
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_by_name text
);

alter table public.eaj_notifications enable row level security;
grant select on public.eaj_notifications to authenticated;

drop policy if exists "Admins can read push notifications" on public.eaj_notifications;
create policy "Admins can read push notifications"
on public.eaj_notifications
for select
to authenticated
using (
  exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  )
);

-- L'insertion et la mise à jour sont réalisées par la fonction Edge
-- avec la clé service_role : aucune policy publique d'écriture n'est nécessaire.
