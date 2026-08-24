-- ======================================================
-- MIGRATION v1.8.0 — Journal public des dernières infos
-- À exécuter APRÈS les migrations v1.6.0 et v1.7.0.
-- Ne modifie ni ne supprime le planning existant.
-- ======================================================

-- Le site public ne reçoit que les champs nécessaires à l'affichage.
-- Les notifications en échec ou encore en attente ne sont pas exposées.
create or replace function public.eaj_list_public_notifications(p_limit integer default 30)
returns table (
  id uuid,
  kind text,
  audience text,
  title text,
  body text,
  url text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.id,
    n.kind,
    n.audience,
    n.title,
    n.body,
    n.url,
    n.created_at
  from public.eaj_notifications n
  where n.status in ('sent', 'partial')
  order by n.created_at desc
  limit greatest(1, least(coalesce(p_limit, 30), 50));
$$;

revoke all on function public.eaj_list_public_notifications(integer) from public;
grant execute on function public.eaj_list_public_notifications(integer) to anon, authenticated;
