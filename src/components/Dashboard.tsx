'use client';

import { useState, useMemo } from 'react';
import Chart from './Chart';
import type { DashboardData, Filtro, SemanaSummary } from '@/types/dashboard';
import styles from './Dashboard.module.css';

function estatusTag(e: string) {
  if (e === 'Asistió') return <span className={styles.tagAsistio}>Asistió</span>;
  if (e === 'Programada') return <span className={styles.tagProgramada}>Programada</span>;
  if (e.includes('No') || e.includes('Cancel') || e.includes('Canceló'))
    return <span className={styles.tagNo}>No asistió</span>;
  return <span className={styles.tagReprogramada}>{e}</span>;
}

function interesTag(v: string) {
  if (v === 'Alto') return <span className={`${styles.badge} ${styles.badgeAlto}`}>Alto</span>;
  if (v === 'Medio') return <span className={`${styles.badge} ${styles.badgeMedio}`}>Medio</span>;
  if (v === 'Bajo') return <span className={`${styles.badge} ${styles.badgeBajo}`}>Bajo</span>;
  return <span className={`${styles.badge} ${styles.badgeNone}`}>—</span>;
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const semanasSummary = useMemo<SemanaSummary[]>(() => {
    return data.semanas.map(semana => {
      const leads = (data.citas[semana] ?? []).filter(c => {
        if (filtro === 'ccp') return c.proyecto === 'CCP';
        if (filtro === 'pp') return c.proyecto === 'PP';
        return true;
      });
      return {
        semana,
        agendadas: leads.length,
        asistidas: leads.filter(c => c.estatus === 'Asistió').length,
      };
    });
  }, [data, filtro]);

  const citasFiltradas = useMemo(() => {
    const out: Record<string, typeof data.citas[string]> = {};
    for (const semana of data.semanas) {
      out[semana] = (data.citas[semana] ?? []).filter(c => {
        if (filtro === 'ccp') return c.proyecto === 'CCP';
        if (filtro === 'pp') return c.proyecto === 'PP';
        return true;
      });
    }
    return out;
  }, [data, filtro]);

  const totalAg = semanasSummary.reduce((s, d) => s + d.agendadas, 0);
  const totalAs = semanasSummary.reduce((s, d) => s + d.asistidas, 0);
  const pct = totalAg ? Math.round((totalAs / totalAg) * 100) : 0;

  return (
    <div className={styles.container}>
      {/* Filtros */}
      <div className={styles.filtros}>
        {(['todos', 'ccp', 'pp'] as Filtro[]).map(f => (
          <button
            key={f}
            className={`${styles.filtroBtn} ${filtro === f ? styles.filtroBtnActive : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? 'Todos' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Pills resumen */}
      <div className={styles.summary}>
        <div className={styles.pill}>
          <div className={`${styles.dot} ${styles.dotBlue}`} />
          <span className={styles.val}>{totalAg}</span>
          <span className={styles.lbl}>Agendadas</span>
        </div>
        <div className={styles.pill}>
          <div className={`${styles.dot} ${styles.dotPurple}`} />
          <span className={styles.val}>{totalAs}</span>
          <span className={styles.lbl}>Asistidas</span>
        </div>
        <div className={styles.pill}>
          <div className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={styles.val}>{pct}%</span>
          <span className={styles.lbl}>Asistencia</span>
        </div>
      </div>

      {/* Gráfica */}
      <div className={styles.chartCard}>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendLine} ${styles.legendLineAg}`} />
            Agendadas
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendLine} ${styles.legendLineAs}`} />
            Asistidas
          </div>
        </div>
        <Chart data={semanasSummary} />
      </div>

      {/* Tabla */}
      <div className={styles.tableCard}>
        <h2>Desglose de citas</h2>
        <p className={styles.tableSub}>Detalle por semana de todas las citas registradas</p>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Semana</th>
                <th>Fecha</th>
                <th>Cita</th>
                <th>Estatus</th>
                <th>Proyecto</th>
                <th>Interés</th>
              </tr>
            </thead>
            <tbody>
              {data.semanas.map((semana, si) => {
                const leads = citasFiltradas[semana] ?? [];
                const summary = semanasSummary[si];
                const borderStyle = si > 0 ? '2px solid #eeedeb' : undefined;

                if (leads.length === 0) {
                  return (
                    <tr key={semana} className={styles.emptyRow}>
                      <td className={styles.tdWeek} style={{ borderTop: borderStyle }}>
                        {semana}
                        <br />
                        <span className={styles.weekMeta}>0 agendadas · 0 asistidas</span>
                      </td>
                      <td style={{ borderTop: borderStyle }}>—</td>
                      <td style={{ borderTop: borderStyle }}>Sin citas registradas</td>
                      <td style={{ borderTop: borderStyle }}>—</td>
                      <td style={{ borderTop: borderStyle }}>—</td>
                      <td style={{ borderTop: borderStyle }}>—</td>
                    </tr>
                  );
                }

                return leads.map((lead, li) => (
                  <tr key={`${semana}-${li}`}>
                    {li === 0 && (
                      <td
                        className={styles.tdWeek}
                        rowSpan={leads.length}
                        style={{ borderTop: borderStyle }}
                      >
                        {semana}
                        <br />
                        <span className={styles.weekMeta}>
                          {summary.agendadas} agendada{summary.agendadas !== 1 ? 's' : ''} ·{' '}
                          {summary.asistidas} asistida{summary.asistidas !== 1 ? 's' : ''}
                        </span>
                      </td>
                    )}
                    <td style={{ borderTop: li === 0 ? borderStyle : undefined }}>{lead.fecha}</td>
                    <td
                      style={{ borderTop: li === 0 ? borderStyle : undefined, fontWeight: 500, color: '#1d1d1d' }}
                    >
                      {lead.titulo}
                    </td>
                    <td style={{ borderTop: li === 0 ? borderStyle : undefined }}>
                      {estatusTag(lead.estatus)}
                    </td>
                    <td style={{ borderTop: li === 0 ? borderStyle : undefined }}>
                      <span className={styles.projTag}>{lead.proyecto}</span>
                    </td>
                    <td style={{ borderTop: li === 0 ? borderStyle : undefined }}>
                      {interesTag(lead.interes)}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
