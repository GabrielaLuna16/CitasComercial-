import * as XLSX from 'xlsx';
import type { DashboardData, Cita, Proyecto } from '@/types/dashboard';

function excelDateToString(serial: number): string {
  const d = new Date((serial - 25569) * 86400 * 1000);
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function weekLabel(raw: string): string {
  // "2026-W03 ( 1 )" → "Semana 03"
  const match = raw.match(/W(\d+)/);
  if (!match) return raw;
  return `Semana ${match[1].padStart(2, '0')}`;
}

export function parseExcelBuffer(buffer: Buffer): DashboardData {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: (string | number)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // Find data rows (skip metadata, find header row with "Title" or "Estatus")
  let dataStart = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.some(cell => String(cell).includes('Estatus') || String(cell).includes('Title'))) {
      dataStart = i + 1;
      break;
    }
  }

  const citasMap: Record<string, Cita[]> = {};
  const semanasOrder: string[] = [];
  let currentWeek = '';
  let minWeek = 999;
  let maxWeek = 0;

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    const colA = String(row[0] ?? '').trim();
    const colB = row[1];
    const colC = String(row[2] ?? '').trim(); // Contact Name
    const colD = String(row[3] ?? '').trim(); // Title
    const colE = String(row[4] ?? '').trim(); // Estatus
    const colF = String(row[5] ?? '').trim() as Proyecto; // Proyecto
    const colG = String(row[6] ?? '').trim(); // Interés

    if (colA) {
      currentWeek = weekLabel(colA);
      if (!citasMap[currentWeek]) {
        citasMap[currentWeek] = [];
        semanasOrder.push(currentWeek);
      }
      const weekNum = parseInt(currentWeek.replace('Semana ', ''), 10);
      if (weekNum < minWeek) minWeek = weekNum;
      if (weekNum > maxWeek) maxWeek = weekNum;
    }

    if (!currentWeek || !colD) continue;

    const fecha = typeof colB === 'number' ? excelDateToString(colB) : String(colB);
    const interes = colG || '-';

    citasMap[currentWeek].push({ fecha, contacto: colC, titulo: colD, estatus: colE, proyecto: colF, interes });
  }

  // Siempre iniciar desde Semana 01 hasta la semana actual del año
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const currentWeekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  const effectiveMax = Math.max(maxWeek, currentWeekNum);

  const allSemanas: string[] = [];
  for (let w = 1; w <= effectiveMax; w++) {
    const label = `Semana ${String(w).padStart(2, '0')}`;
    allSemanas.push(label);
    if (!citasMap[label]) citasMap[label] = [];
  }

  return {
    generado: new Date().toISOString(),
    semanas: allSemanas,
    citas: citasMap,
  };
}
