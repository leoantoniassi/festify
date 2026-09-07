-- ============================================================
-- Migration: Adicionar campos de recuperação de senha à tabela usuarios
-- Data: 2026-06-08
-- Descrição: Suporte ao fluxo de "Esqueci a Senha"
-- ============================================================

-- 1. Adicionar campo de token de recuperação de senha
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS usr_reset_token VARCHAR(255) NULL;

-- 2. Adicionar campo de expiração da recuperação de senha
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS usr_reset_expiracao TIMESTAMP NULL;

-- 3. Índice para busca rápida por token de redefinição
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token
  ON usuarios (usr_reset_token)
  WHERE usr_reset_token IS NOT NULL;
