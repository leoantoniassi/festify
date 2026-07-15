-- 1. Clientes: Tornar e-mail opcional
ALTER TABLE clientes ALTER COLUMN cli_email DROP NOT NULL;

-- 2. Clientes: Adicionar telefone residencial
ALTER TABLE clientes ADD COLUMN cli_telefone_residencial VARCHAR(20) NULL;

-- 3. Funcionarios (Colaboradores): Tornar e-mail opcional
ALTER TABLE funcionarios ALTER COLUMN fun_email DROP NOT NULL;

-- 4. Funcionarios (Colaboradores): Adicionar telefone residencial
ALTER TABLE funcionarios ADD COLUMN fun_telefone_residencial VARCHAR(20) NULL;
