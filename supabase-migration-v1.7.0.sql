-- ======================================================
-- MIGRATION v1.7.0 — Préférences et ciblage Push
-- À exécuter APRÈS supabase-migration-v1.6.0.sql
-- Ne modifie ni ne supprime le planning existant.
-- ======================================================

-- Préférences par appareil.
alter table public.eaj_push_subscriptions
  add column if not exists pref_eaj1 boolean not null default false,
  add column if not exists pref_eaj2 boolean not null default false,
  add column if not exists pref_eaj3 boolean not null default false,
  add column if not exists pref_system_updates boolean not null default false;

-- Catégories / destinataires enregistrés dans l'historique.
alter table public.eaj_notifications
  add column if not exists audience text not null default 'all_eaj';

-- Les anciens rappels éventuels deviennent de simples informations.
update public.eaj_notifications
set kind = 'information'
where kind = 'reminder';

alter table public.eaj_notifications
  drop constraint if exists eaj_notifications_kind_check;

alter table public.eaj_notifications
  add constraint eaj_notifications_kind_check
  check (kind in ('information', 'programme', 'modification', 'cancellation', 'document', 'update', 'important'));

alter table public.eaj_notifications
  drop constraint if exists eaj_notifications_audience_check;

alter table public.eaj_notifications
  add constraint eaj_notifications_audience_check
  check (audience in ('all_active', 'all_eaj', 'eaj1', 'eaj2', 'eaj3', 'eaj23', 'system'));

-- Enregistrement / mise à jour d'un abonnement avec ses préférences.
create or replace function public.eaj_upsert_push_subscription_v2(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null,
  p_eaj1 boolean default false,
  p_eaj2 boolean default false,
  p_eaj3 boolean default false,
  p_system_updates boolean default false
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
    endpoint, p256dh, auth, user_agent, enabled,
    pref_eaj1, pref_eaj2, pref_eaj3, pref_system_updates,
    created_at, updated_at, last_seen_at
  ) values (
    trim(p_endpoint), p_p256dh, p_auth, left(coalesce(p_user_agent, ''), 500), true,
    coalesce(p_eaj1, false), coalesce(p_eaj2, false), coalesce(p_eaj3, false), coalesce(p_system_updates, false),
    now(), now(), now()
  )
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent,
    enabled = true,
    pref_eaj1 = excluded.pref_eaj1,
    pref_eaj2 = excluded.pref_eaj2,
    pref_eaj3 = excluded.pref_eaj3,
    pref_system_updates = excluded.pref_system_updates,
    updated_at = now(),
    last_seen_at = now();
end;
$$;

-- Lecture des préférences de l'appareil courant à partir de son endpoint Push.
create or replace function public.eaj_get_push_preferences(p_endpoint text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_endpoint is null or length(trim(p_endpoint)) < 20 then
    return jsonb_build_object(
      'eaj1', false, 'eaj2', false, 'eaj3', false,
      'system_updates', false, 'enabled', false
    );
  end if;

  select jsonb_build_object(
    'eaj1', pref_eaj1,
    'eaj2', pref_eaj2,
    'eaj3', pref_eaj3,
    'system_updates', pref_system_updates,
    'enabled', enabled
  )
  into result
  from public.eaj_push_subscriptions
  where endpoint = trim(p_endpoint)
  limit 1;

  return coalesce(result, jsonb_build_object(
    'eaj1', false, 'eaj2', false, 'eaj3', false,
    'system_updates', false, 'enabled', false
  ));
end;
$$;

revoke all on function public.eaj_upsert_push_subscription_v2(text, text, text, text, boolean, boolean, boolean, boolean) from public;
revoke all on function public.eaj_get_push_preferences(text) from public;
grant execute on function public.eaj_upsert_push_subscription_v2(text, text, text, text, boolean, boolean, boolean, boolean) to anon, authenticated;
grant execute on function public.eaj_get_push_preferences(text) to anon, authenticated;
