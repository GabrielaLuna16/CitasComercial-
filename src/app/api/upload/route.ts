import { NextResponse } from 'next/server';
import { parseExcelBuffer } from '@/lib/parseExcel';
import { commitFile } from '@/lib/github';

export async function POST(request: Request) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    return NextResponse.json({ error: 'Variables de entorno de GitHub no configuradas.' }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'xlsx' && ext !== 'xls') {
    return NextResponse.json({ error: 'Solo se aceptan archivos .xlsx o .xls' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = parseExcelBuffer(buffer);

    await commitFile(
      'public/data.json',
      JSON.stringify(data, null, 2),
      `datos: actualizar citas ${new Date().toLocaleDateString('es-MX')}`
    );

    return NextResponse.json({ success: true, semanas: data.semanas.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al procesar el archivo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
