import type { Metadata } from 'next';
import Link from 'next/link';
import UploadForm from '@/components/UploadForm';
import styles from './upload.module.css';

export const metadata: Metadata = {
  title: 'Actualizar datos — Citas CCP & PP',
};

export default function UploadPage() {
  return (
    <>
      <div className={styles.topBar}>
        <span className={styles.brand}>ATISA</span>
        <Link href="/" className={styles.backLink}>← Volver al dashboard</Link>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Cargar archivo de citas</h1>
        <p className={styles.sub}>
          Sube el reporte Excel de Citas CCP &amp; PP. El archivo debe tener el mismo formato
          que el reporte de Zoho CRM. Los datos se actualizarán automáticamente.
        </p>
        <UploadForm />
      </div>
    </>
  );
}
