import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ============================================================
// Cores do tema para bibliotecas que não entendem CSS
// ============================================================
// Recharts (e SVG em geral) recebe cor como prop em JavaScript, então não
// enxerga `var(--color-primary)`. Este hook lê os valores computados do
// :root e os devolve como hex, reagindo à troca de paleta do tenant.
// ============================================================

const TOKENS = [
  'chart-1',
  'chart-2',
  'chart-3',
  'primary',
  'secondary',
  'tertiary',
  'surface',
  'on-surface',
  'on-surface-variant',
  'outline',
  'outline-variant',
  'error',
];

function lerTokens() {
  if (typeof window === 'undefined') return {};
  const estilo = getComputedStyle(document.documentElement);
  return TOKENS.reduce((acumulado, token) => {
    const valor = estilo.getPropertyValue(`--color-${token}`).trim();
    if (valor) acumulado[token] = valor;
    return acumulado;
  }, {});
}

export default function useCoresDoTema() {
  const tema = useTheme();
  const [cores, setCores] = useState(lerTokens);

  // As custom properties só existem no DOM depois que o ThemeContext as
  // aplica, então releitura é disparada por mudança da config do tenant.
  useEffect(() => {
    setCores(lerTokens());
  }, [tema?.config]);

  return cores;
}
