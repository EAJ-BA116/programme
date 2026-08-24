-- ======================================================
-- MIGRATION v1.6.0 — Notifications push Web Push
-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Ne modifie ni ne supprime le planning existant.
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
