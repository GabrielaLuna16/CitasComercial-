'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Chart from './Chart';
import type { DashboardData, Filtro, SemanaSummary } from '@/types/dashboard';
import styles from './AppShell.module.css';
import dash from './Dashboard.module.css';

function estatusTag(e: string) {
  if (e === 'Asistió') return <span className={dash.tagAsistio}>Asistió</span>;
  if (e === 'Programada') return <span className={dash.tagProgramada}>Programada</span>;
  if (e.includes('No') || e.includes('Cancel') || e.includes('Canceló'))
    return <span className={dash.tagNo}>No asistió</span>;
  return <span className={dash.tagReprogramada}>{e}</span>;
}

function interesTag(v: string) {
  if (v === 'Alto') return <span className={`${dash.badge} ${dash.badgeAlto}`}>Alto</span>;
  if (v === 'Medio') return <span className={`${dash.badge} ${dash.badgeMedio}`}>Medio</span>;
  if (v === 'Bajo') return <span className={`${dash.badge} ${dash.badgeBajo}`}>Bajo</span>;
  return <span className={`${dash.badge} ${dash.badgeNone}`}>—</span>;
}

const TABS: { key: Filtro; label: string }[] = [
  { key: 'todos', label: 'TODAS' },
  { key: 'ccp',   label: 'CCP'   },
  { key: 'pp',    label: 'PP'    },
];

export default function AppShell({ data, generado }: { data: DashboardData; generado: string }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const semanasSummary = useMemo<SemanaSummary[]>(() => {
    return data.semanas.map(semana => {
      const leads = (data.citas[semana] ?? []).filter(c => {
        if (filtro === 'ccp') return c.proyecto === 'CCP';
        if (filtro === 'pp')  return c.proyecto === 'PP';
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
        if (filtro === 'pp')  return c.proyecto === 'PP';
        return true;
      });
    }
    return out;
  }, [data, filtro]);

  const totalAg = semanasSummary.reduce((s, d) => s + d.agendadas, 0);
  const totalAs = semanasSummary.reduce((s, d) => s + d.asistidas, 0);
  const pct = totalAg ? Math.round((totalAs / totalAg) * 100) : 0;

  return (
    <>
      {/* ── Barra superior ── */}
      <div className={styles.topBar}>
        <span className={styles.brand}>Citas CCP &amp; PP</span>
        <Link href="/upload" className={styles.uploadBtn}>+ ACTUALIZAR DATOS</Link>
      </div>

      {/* ── Línea roja ── */}
      <div className={styles.redLine} />

      {/* ── Pestañas ── */}
      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${filtro === t.key ? styles.tabActive : ''}`}
            onClick={() => setFiltro(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenido ── */}
      <div className={styles.content}>

        {/* Pills */}
        <div className={styles.summary}>
          <div className={dash.pill}>
            <div className={`${dash.dot} ${dash.dotBlue}`} />
            <span className={dash.val}>{totalAg}</span>
            <span className={dash.lbl}>Agendadas</span>
          </div>
          <div className={dash.pill}>
            <div className={`${dash.dot} ${dash.dotPurple}`} />
            <span className={dash.val}>{totalAs}</span>
            <span className={dash.lbl}>Asistidas</span>
          </div>
          <div className={dash.pill}>
            <div className={`${dash.dot} ${dash.dotGreen}`} />
            <span className={dash.val}>{pct}%</span>
            <span className={dash.lbl}>Asistencia</span>
          </div>
        </div>

        {/* Gráfica */}
        <div className={dash.chartCard}>
          <div className={dash.legend}>
            <div className={dash.legendItem}>
              <div className={`${dash.legendLine} ${dash.legendLineAg}`} />Agendadas
            </div>
            <div className={dash.legendItem}>
              <div className={`${dash.legendLine} ${dash.legendLineAs}`} />Asistidas
            </div>
          </div>
          <Chart data={semanasSummary} />
        </div>

        {/* Tabla */}
        <div className={dash.tableCard}>
          <h2>Desglose de citas</h2>
          <p className={dash.tableSub}>Detalle por semana de todas las citas registradas</p>
          <div className={dash.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th>Semana</th><th>Fecha</th><th>Contacto</th>
                  <th>Cita</th><th>Estatus</th><th>Proyecto</th><th>Interés</th>
                </tr>
              </thead>
              <tbody>
                {data.semanas.map((semana, si) => {
                  const leads   = citasFiltradas[semana] ?? [];
                  const summary = semanasSummary[si];
                  const border  = si > 0 ? '2px solid #e8f2f6' : undefined;

                  if (leads.length === 0) return (
                    <tr key={semana} className={dash.emptyRow}>
                      <td className={dash.tdWeek} style={{ borderTop: border }}>
                        {semana}<br />
                        <span className={dash.weekMeta}>0 agendadas · 0 asistidas</span>
                      </td>
                      <td style={{ borderTop: border }}>—</td>
                      <td style={{ borderTop: border }}>—</td>
                      <td style={{ borderTop: border }}>Sin citas registradas</td>
                      <td style={{ borderTop: border }}>—</td>
                      <td style={{ borderTop: border }}>—</td>
                      <td style={{ borderTop: border }}>—</td>
                    </tr>
                  );

                  return leads.map((lead, li) => (
                    <tr key={`${semana}-${li}`}>
                      {li === 0 && (
                        <td className={dash.tdWeek} rowSpan={leads.length} style={{ borderTop: border }}>
                          {semana}<br />
                          <span className={dash.weekMeta}>
                            {summary.agendadas} agendada{summary.agendadas !== 1 ? 's' : ''} ·{' '}
                            {summary.asistidas} asistida{summary.asistidas !== 1 ? 's' : ''}
                          </span>
                        </td>
                      )}
                      <td style={{ borderTop: li === 0 ? border : undefined }}>{lead.fecha}</td>
                      <td style={{ borderTop: li === 0 ? border : undefined }}>{lead.contacto}</td>
                      <td style={{ borderTop: li === 0 ? border : undefined, fontWeight: 500, color: '#304450' }}>
                        {lead.recordId ? (
                          <a
                            href={`https://crm.zoho.com/crm/org666606221/tab/Events/${lead.recordId.replace('zcrm_', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.crmLink}
                          >
                            {lead.titulo}
                          </a>
                        ) : lead.titulo}
                      </td>
                      <td style={{ borderTop: li === 0 ? border : undefined }}>{estatusTag(lead.estatus)}</td>
                      <td style={{ borderTop: li === 0 ? border : undefined }}>
                        <span className={lead.proyecto === 'CCP' ? dash.projTagCCP : dash.projTagPP}>
                          {lead.proyecto}
                        </span>
                      </td>
                      <td style={{ borderTop: li === 0 ? border : undefined }}>{interesTag(lead.interes)}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className={styles.footer}>Actualizado el {generado}</p>
      </div>
    </>
  );
}
