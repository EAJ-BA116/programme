-- ======================================================
-- MIGRATION v1.8.2 — Suppression des messages push par le Super Admin
-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Ne modifie ni le planning ni les abonnements push.
-- ======================================================

create or replace function public.eaj_delete_notification(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  if not exists (
    select 1
    from public.eaj_admins a
    where a.user_id = auth.uid()
      and a.active = true
  ) then
    raise exception 'Accès administrateur requis';
  end if;

  if p_id is null then
    return false;
  end if;

  delete from public.eaj_notifications
  where id = p_id;

  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

revoke all on function public.eaj_delete_notification(uuid) from public;
grant execute on function public.eaj_delete_notification(uuid) to authenticated;
