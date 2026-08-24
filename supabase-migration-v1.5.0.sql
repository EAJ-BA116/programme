-- ======================================================
-- MIGRATION v1.5.0 — Fusion EAJ2 / EAJ3 configurable
-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Cette migration ne supprime ni ne modifie les semaines existantes.
-- ======================================================

alter table public.eaj_planning_state
  add column if not exists settings jsonb not null
  default '{"mergeEaj23": true}'::jsonb;

-- Active la fusion par défaut pour le site public et les nouvelles semaines.
update public.eaj_planning_state
set settings = coalesce(settings, '{}'::jsonb) || '{"mergeEaj23": true}'::jsonb
where id = 'main';
