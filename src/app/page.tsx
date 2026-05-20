import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import type { DashboardData } from '@/types/dashboard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function loadData(): DashboardData {
  const filePath = path.join(process.cwd(), 'public', 'data.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export default function Home() {
  const data = loadData();
  const fecha = new Date(data.generado).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Citas CCP &amp; PP</h1>
        <p>Seguimiento semanal · Agendadas vs Asistidas</p>
        <Link href="/upload" className={styles.uploadLink}>Actualizar datos →</Link>
      </div>

      <div className={styles.dashWrapper}>
        <Dashboard data={data} />
      </div>

      <p className={styles.footer}>Actualizado el {fecha}</p>
    </main>
  );
}
