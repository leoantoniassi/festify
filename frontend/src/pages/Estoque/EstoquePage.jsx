import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { formatCurrency } from '../../utils/formatters';

export default function EstoquePage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', categoriaId: '', quantidade: '', estoqueMinimo: '', unidadeMedida: 'un', custoUnitario: '' });
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api.get('/lookup/categorias-produto')
      .then(r => {
        const items = Array.isArray(r.data.data) ? r.data.data : [];
        setCategorias(items);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      const { data: res } = await api.get('/produtos', { params: { page, limit: 10 } });
      const items = Array.isArray(res.data) ? res.data : [];
      setProdutos(items);
      setTotal(res.pagination?.total || items.length);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/produtos/${editing}`, form);
      else await api.post('/produtos', form);
      setShowPanel(false); setEditing(null); setForm({ nome: '', categoriaId: '', quantidade: '', estoqueMinimo: '', unidadeMedida: 'un', custoUnitario: '' }); fetchData();
    } catch (err) { await confirm(err.response?.data?.error || 'Erro', { title: 'Erro', showCancel: false }); }
  };

  const handleEdit = (p) => { setForm({ nome: p.nome, categoriaId: p.categoriaId || p.categoria?.id || '', quantidade: p.quantidade ?? '', estoqueMinimo: p.estoqueMinimo ?? '', unidadeMedida: p.unidadeMedida, custoUnitario: p.custoUnitario ?? '' }); setEditing(p.id); setShowPanel(true); };
  const handleDelete = async (id) => { if (!(await confirm('Excluir item?'))) return; try { await api.delete(`/produtos/${id}`); fetchData(); } catch (err) { await confirm(err.response?.data?.error || 'Erro', { title: 'Erro', showCancel: false }); } };

  const catColor = (c) => {
    const m = { Alimento: 'bg-primary/30 text-on-primary-container', Bebida: 'bg-tertiary-container text-on-tertiary-container', Descartável: 'bg-surface-container-highest text-on-surface-variant', Decoração: 'bg-secondary-container text-on-secondary-container' };
    return m[c] || 'bg-surface-container text-on-surface-variant';
  };

  const isLowStock = (p) => {
    const min = Number(p.estoqueMinimo);
    return min > 0 && Number(p.quantidade) <= min;
  };

  const totalValue = produtos.reduce((sum, p) => sum + (Number(p.custoUnitario) * Number(p.quantidade)), 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div><h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Estoque</h2><p className="text-on-surface-variant font-medium">Controle de insumos, materiais e equipamentos.</p></div>
        <button onClick={() => { setEditing(null); setForm({ nome: '', categoriaId: '', quantidade: '', estoqueMinimo: '', unidadeMedida: 'un', custoUnitario: '' }); setShowPanel(true); }} className="flex items-center gap-2 px-8 py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span> Adicionar Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 bg-surface rounded-2xl border-b-4 border-primary"><p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Total de Itens</p><div className="flex items-end justify-between"><span className="text-4xl font-extrabold text-on-surface">{total}</span><span className="material-symbols-outlined text-primary/40 text-4xl">inventory</span></div></div>
        <div className="p-6 bg-surface rounded-2xl border-b-4 border-error"><p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Estoque Baixo</p><div className="flex items-end justify-between">        <span className="text-4xl font-extrabold text-error">{produtos.filter(isLowStock).length}</span><span className="material-symbols-outlined text-error/30 text-4xl">warning</span></div></div>
        <div className="p-6 bg-surface rounded-2xl border-b-4 border-tertiary"><p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Categorias</p><div className="flex items-end justify-between"><span className="text-4xl font-extrabold text-tertiary">{[...new Set(produtos.map(p => p.categoria?.nome || p.categoria))].length}</span><span className="material-symbols-outlined text-tertiary/20 text-4xl">category</span></div></div>
        <div className="p-6 bg-secondary text-on-secondary rounded-2xl shadow-xl shadow-secondary/20"><p className="text-xs uppercase tracking-widest text-on-secondary/70 font-bold mb-4">Valor Total</p><div className="flex items-end justify-between"><span className="text-2xl font-extrabold">{formatCurrency(totalValue)}</span><span className="material-symbols-outlined text-on-secondary/30 text-4xl">payments</span></div></div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-[2rem] overflow-hidden shadow-xl shadow-on-surface/5 border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-surface-container-low/10"><th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Item</th><th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Categoria</th><th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Quantidade</th><th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Custo Un.</th><th className="px-8 py-5 font-bold text-xs uppercase tracking-wider text-on-surface-variant text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/5">
            {produtos.length === 0 && <tr><td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">Nenhum produto.</td></tr>}
            {produtos.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant">inventory_2</span></div><div><p className="font-bold text-on-surface">{p.nome}</p></div></div></td>
                <td className="px-8 py-6"><span className={`px-4 py-1.5 ${catColor(p.categoria?.nome || p.categoria)} rounded-full text-xs font-bold`}>{p.categoria?.nome || p.categoria || '—'}</span></td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${isLowStock(p) ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                      {p.quantidade}
                    </span>
                    <span className="text-on-surface-variant text-xs font-medium">{p.unidadeMedida}</span>
                    {isLowStock(p) && (
                      <span className="material-symbols-outlined text-error text-sm ml-1" title="Estoque Baixo!">warning</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 font-medium text-on-surface">{formatCurrency(p.custoUnitario)}</td>
                <td className="px-8 py-6"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEdit(p)} className="p-2 hover:bg-surface rounded-full text-on-surface-variant"><span className="material-symbols-outlined">edit</span></button>
                  {user?.role !== 'operador' && (
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-error/10 rounded-full text-error"><span className="material-symbols-outlined">delete</span></button>
                  )}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-8 py-5 bg-surface-container-low/20 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant font-medium">Exibindo {produtos.length} de {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-on-secondary font-bold">{page}</span>
            <button onClick={() => setPage(page + 1)} disabled={produtos.length < 10} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex justify-end fade-in" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-lg bg-surface h-full shadow-2xl flex flex-col slide-in-right rounded-l-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/30 flex justify-between"><div><h3 className="text-2xl font-headline font-extrabold">{editing ? 'Editar' : 'Novo'} Item</h3></div><button onClick={() => setShowPanel(false)} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button></div>
            <div className="flex-1 overflow-y-auto p-8">
              <form id="prod-form" className="space-y-6" onSubmit={handleSave}>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Nome</label><input className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Categoria</label><select className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} required><option value="">Selecione...</option>{categorias.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}</select></div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Qtd</label><input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" placeholder="0" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value === '' ? '' : +e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Mín.</label><input type="number" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" placeholder="0" value={form.estoqueMinimo} onChange={e => setForm({...form, estoqueMinimo: e.target.value === '' ? '' : +e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Un.</label><input className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" value={form.unidadeMedida} onChange={e => setForm({...form, unidadeMedida: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-4">Custo</label><input type="number" step="0.01" className="w-full bg-surface-container-low border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary" placeholder="0,00" value={form.custoUnitario} onChange={e => setForm({...form, custoUnitario: e.target.value === '' ? '' : +e.target.value})} /></div>
                </div>
              </form>
            </div>
            <div className="p-8 bg-surface-container-low flex gap-4"><button onClick={() => setShowPanel(false)} className="flex-1 border-2 border-outline-variant text-on-surface-variant py-3.5 rounded-full font-bold">Cancelar</button><button type="submit" form="prod-form" className="flex-[2] bg-primary text-on-primary py-3.5 rounded-full font-bold shadow-xl shadow-primary/30">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
