import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardCharts from './DashboardCharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({ clientes: 0, funcionarios: 0, eventos: 0, eventosProximos30Dias: 0, orcamentosPendentes: 0 });
  const [proximosEventos, setProximosEventos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(r => {
      const d = r.data?.data || r.data || {};
      setStats({
        clientes: d.totalClientes || 0,
        funcionarios: d.totalFuncionarios || 0,
        eventos: d.totalEventos || 0,
        eventosProximos30Dias: d.eventosProximos30Dias || 0,
        orcamentosPendentes: d.orcamentosPendentes || 0,
      });
    }).catch(() => {});
    api.get('/dashboard/proximos-eventos').then(r => {
      const eventos = r.data?.data || r.data || [];
      setProximosEventos(Array.isArray(eventos) ? eventos : []);
    }).catch(() => {});
  }, []);

  const statusBadge = (status) => {
    const map = {
      
      pendente: 'bg-primary text-on-primary',
      planejamento: 'bg-primary text-on-primary',
      cancelado: 'bg-error text-on-error',
    };
    return map[status] || 'bg-surface-container-highest text-on-surface-variant';
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="max-w-2xl">
          <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
            Arquitetura da <span className="text-tertiary italic">Festa</span>!
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-lg">
            Você tem {stats.eventos || 0} eventos agendados e {stats.orcamentosPendentes || 0} orçamentos pendentes.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/eventos')}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 editorial-shadow hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Evento
          </button>
        </div>
      </section>

      {/* Metrics Bento */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-3xl px-8 editorial-shadow border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Próximos Eventos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-extrabold text-tertiary">{stats.eventosProximos30Dias || 0}</span>
          </div>
          <p className="text-xs text-outline mt-2">Próximos 30 dias</p>
        </div>

        <div className="bg-surface p-6 rounded-3xl px-8 editorial-shadow border border-outline-variant/10 group">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Orçamentos Pendentes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-extrabold text-secondary">{stats.orcamentosPendentes || 0}</span>
          </div>
          <p className="text-xs text-outline mt-2">Aguardando aprovação</p>
        </div>

        <div className="bg-surface p-6 rounded-3xl px-8 editorial-shadow border border-outline-variant/10 group">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Total de Clientes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-extrabold text-on-surface">{stats.clientes || 0}</span>
          </div>
          <p className="text-xs text-outline mt-2">Parcerias ativas</p>
        </div>

        <div className="bg-surface p-6 rounded-3xl px-8 editorial-shadow border border-outline-variant/10 group">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Funcionários</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-extrabold text-tertiary">{stats.funcionarios || 0}</span>
          </div>
          <p className="text-xs text-outline mt-2">Equipe de eventos</p>
        </div>
      </section>

      {/* Charts Section */}
      <section>
        <DashboardCharts />
      </section>

      {/* Events Table */}
      <section className="bg-surface rounded-xl editorial-shadow overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-outline-variant/10">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Próximos Eventos</h3>
          <button onClick={() => navigate('/eventos')} className="text-tertiary font-bold text-xs hover:underline">Ver Todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Evento</th>
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest min-w-[160px]">Data & Hora</th>
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {proximosEventos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">Nenhum evento próximo encontrado.</td>
                </tr>
              )}
              {proximosEventos.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary font-bold">
                        {evt.nome?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{evt.nome}</p>
                        <p className="text-[11px] text-on-surface-variant">{evt.local?.nome || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    {evt.cliente?.nome || '—'}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm text-on-surface font-medium">{formatDate(evt.dataEvento)}</p>
                    <p className="text-[11px] text-on-surface-variant">{formatTime(evt.dataEvento)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 ${statusBadge(evt.status)} text-[10px] font-bold rounded-full uppercase tracking-tighter`}>
                      {evt.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => navigate(`/eventos`)} className="text-outline hover:text-tertiary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
