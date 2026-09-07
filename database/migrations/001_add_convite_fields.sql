-- ============================================================
-- Migration: Adicionar campos de convite à tabela usuarios
-- Data: 2026-06-07
-- Descrição: Suporte ao fluxo de convite e ativação de usuários
-- ============================================================

-- 1. Tornar a coluna de senha nullable para suportar usuários convidados
ALTER TABLE usuarios
  ALTER COLUMN usr_senha DROP NOT NULL;

-- 2. Adicionar campo de status do usuário
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS usr_status VARCHAR(30) NOT NULL DEFAULT 'ativo'
    CHECK (usr_status IN ('pendente', 'ativo'));

-- 3. Adicionar campo de token de convite
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS usr_convite_token VARCHAR(255) NULL;

-- 4. Adicionar campo de expiração do convite
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS usr_convite_expiracao TIMESTAMPTZ NULL;

-- 5. Índice para busca rápida por token (usado na rota pública)
CREATE INDEX IF NOT EXISTS idx_usuarios_convite_token
  ON usuarios (usr_convite_token)
  WHERE usr_convite_token IS NOT NULL;

-- Verificação
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name IN ('usr_status', 'usr_convite_token', 'usr_convite_expiracao', 'usr_senha')
ORDER BY column_name;
