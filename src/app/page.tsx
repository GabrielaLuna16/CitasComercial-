import fs from 'fs';
import path from 'path';
import AppShell from '@/components/AppShell';
import type { DashboardData } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

function loadData(): DashboardData {
  const filePath = path.join(process.cwd(), 'public', 'data.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export default function Home() {
  const data = loadData();
  const generado = new Date(data.generado).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return <AppShell data={data} generado={generado} />;
}
