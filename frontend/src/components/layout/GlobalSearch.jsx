import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TIPO_CONFIG = {
  clientes:    { icon: 'group',           cor: 'text-primary',   bg: 'bg-primary/10' },
  eventos:     { icon: 'celebration',     cor: 'text-secondary', bg: 'bg-secondary/10' },
  orcamentos:  { icon: 'request_quote',   cor: 'text-tertiary',  bg: 'bg-tertiary/10' },
  funcionarios:{ icon: 'badge',           cor: 'text-primary',   bg: 'bg-primary/10' },
  fornecedores:{ icon: 'local_shipping',  cor: 'text-secondary', bg: 'bg-secondary/10' },
};

const STATUS_LABEL = {
  pendente:   { label: 'Pendente',   cls: 'bg-warning-container text-on-warning-container' },
  aprovado:   { label: 'Aprovado',   cls: 'bg-success-container text-on-success-container' },
  reprovado:  { label: 'Reprovado',  cls: 'bg-error-container text-on-error-container' },
  concluido:  { label: 'Concluído',  cls: 'bg-info-container text-on-info-container' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-surface-container-high text-on-surface-variant' },
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Flatten results para navegação por teclado
  const todosItens = grupos.flatMap((g) => g.itens.map((i) => ({ ...i, tipo: g.tipo })));

  // ── Busca com debounce ──────────────────────────────────────
  const buscar = useCallback(async (termo) => {
    if (termo.trim().length < 2) {
      setGrupos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: res } = await api.get('/busca', { params: { q: termo.trim() } });
      setGrupos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setGrupos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => buscar(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, buscar]);

  // ── Ctrl+K para focar ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Fechar ao clicar fora ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Navegação por teclado ───────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open || todosItens.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < todosItens.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : todosItens.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigateTo(todosItens[activeIndex].url);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const navigateTo = (url) => {
    navigate(url);
    setOpen(false);
    setQuery('');
    setGrupos([]);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const temResultados = grupos.length > 0;

  return (
    <div ref={containerRef} className="relative hidden md:flex items-center">
      {/* Input */}
      <div
        className={`flex items-center bg-surface-container-low px-4 py-2 rounded-full w-64 lg:w-96 transition-all duration-200 ${
          open ? 'ring-2 ring-primary bg-surface shadow-lg shadow-primary/10' : 'group focus-within:ring-2 focus-within:ring-primary'
        }`}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2 flex-shrink-0" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px] flex-shrink-0">search</span>
        )}
        <input
          ref={inputRef}
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full placeholder:text-on-surface-variant/60"
          placeholder="Pesquisar em tudo…"
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {/* Atalho Ctrl+K */}
        {!open && query === '' && (
          <span className="hidden lg:flex items-center gap-0.5 text-[10px] text-on-surface-variant/50 font-mono border border-outline-variant/30 rounded px-1.5 py-0.5 flex-shrink-0">
            Ctrl K
          </span>
        )}
        {/* Limpar */}
        {query && (
          <button
            onClick={() => { setQuery(''); setGrupos([]); inputRef.current?.focus(); }}
            className="text-on-surface-variant/60 hover:text-on-surface transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (temResultados || (query.trim().length >= 2 && !loading)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">

          {/* Sem resultados */}
          {!temResultados && !loading && (
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-outline/40 block mb-2">search_off</span>
              <p className="text-sm font-bold text-on-surface-variant">Nenhum resultado encontrado</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Tente um termo diferente</p>
            </div>
          )}

          {/* Grupos de resultados */}
          {grupos.map((grupo) => {
            const cfg = TIPO_CONFIG[grupo.tipo] || { icon: 'folder', cor: 'text-on-surface-variant', bg: 'bg-surface-container' };
            return (
              <div key={grupo.tipo}>
                {/* Cabeçalho do grupo */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${cfg.cor}`}>{cfg.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{grupo.label}</span>
                  </div>
                  <button
                    onClick={() => navigateTo(grupo.url)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Ver todos →
                  </button>
                </div>

                {/* Itens */}
                {grupo.itens.map((item) => {
                  const globalIdx = todosItens.findIndex((t) => t.id === item.id && t.tipo === grupo.tipo);
                  const isActive = globalIdx === activeIndex;
                  const statusInfo = STATUS_LABEL[item.badge];

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.url)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors border-b border-outline-variant/5 last:border-0 ${
                        isActive ? 'bg-primary/8' : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <span className={`material-symbols-outlined text-[16px] ${cfg.cor}`}>{cfg.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{item.titulo}</p>
                        {item.subtitulo && (
                          <p className="text-xs text-on-surface-variant truncate">{item.subtitulo}</p>
                        )}
                      </div>
                      {item.badge && statusInfo && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      )}
                      {item.badge && !statusInfo && (
                        <span className="text-[10px] font-mono text-on-surface-variant/60 flex-shrink-0 truncate max-w-[80px]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Rodapé */}
          {temResultados && (
            <div className="px-4 py-2.5 bg-surface-container-low flex items-center justify-between border-t border-outline-variant/10">
              <p className="text-[11px] text-on-surface-variant/60">
                {todosItens.length} resultado{todosItens.length !== 1 ? 's' : ''} encontrado{todosItens.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/50">
                <span><kbd className="font-mono bg-surface-container px-1 rounded">↑↓</kbd> navegar</span>
                <span><kbd className="font-mono bg-surface-container px-1 rounded">Enter</kbd> abrir</span>
                <span><kbd className="font-mono bg-surface-container px-1 rounded">Esc</kbd> fechar</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
