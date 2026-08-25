-- ======================================================
-- MIGRATION v1.9.0 — Gestion avancée des sauvegardes
-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Ne modifie pas le planning courant.
-- ======================================================

alter table public.eaj_planning_backups
  add column if not exists label text,
  add column if not exists note text,
  add column if not exists backup_type text not null default 'automatic';

-- Les sauvegardes historiques restent utilisables.
update public.eaj_planning_backups
set backup_type = case
  when lower(coalesce(reason, '')) like '%avant restauration%' then 'safety'
  when lower(coalesce(reason, '')) like '%avant remise à zéro%' then 'safety'
  when lower(coalesce(reason, '')) like '%automatique%' then 'automatic'
  else coalesce(nullif(backup_type, ''), 'automatic')
end
where backup_type is null
   or backup_type = ''
   or lower(coalesce(reason, '')) like '%avant restauration%'
   or lower(coalesce(reason, '')) like '%avant remise à zéro%';

grant delete on public.eaj_planning_backups to authenticated;

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
