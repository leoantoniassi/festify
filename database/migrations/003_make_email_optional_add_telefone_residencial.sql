-- 1. Clientes: Tornar e-mail opcional
ALTER TABLE clientes ALTER COLUMN cli_email DROP NOT NULL;

-- 2. Clientes: Adicionar telefone residencial
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cli_telefone_residencial VARCHAR(20) NULL;

-- 3. Funcionarios (Colaboradores): Tornar e-mail opcional
ALTER TABLE funcionarios ALTER COLUMN fun_email DROP NOT NULL;

-- 4. Funcionarios (Colaboradores): Adicionar telefone residencial
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS fun_telefone_residencial VARCHAR(20) NULL;

-- Nota: `init.sql` (usado pelo Docker na criação do banco) já cria estas
-- colunas. O IF NOT EXISTS deixa esta migration rodar tanto num banco novo
-- quanto num banco legado, sem baseline manual.
