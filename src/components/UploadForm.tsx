'use client';

import { useState, useRef, DragEvent } from 'react';
import styles from './UploadForm.module.css';

type Estado = 'idle' | 'loading' | 'success' | 'error';

export default function UploadForm() {
  const [estado, setEstado] = useState<Estado>('idle');
  const [mensaje, setMensaje] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setEstado('loading');
    setMensaje('');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        setEstado('error');
        setMensaje(json.error ?? 'Error desconocido');
      } else {
        setEstado('success');
        setMensaje(`Datos actualizados correctamente (${json.semanas} semanas). El dashboard se actualizará en unos minutos.`);
      }
    } catch {
      setEstado('error');
      setMensaje('No se pudo conectar con el servidor.');
    }
  }

  function handleFile(file: File | null) {
    if (!file) return;
    upload(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${estado === 'loading' ? styles.loading : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
        {estado === 'loading' ? (
          <p className={styles.hint}>Procesando archivo...</p>
        ) : (
          <>
            <div className={styles.icon}>📊</div>
            <p className={styles.main}>Arrastra aquí tu archivo Excel</p>
            <p className={styles.hint}>o haz clic para seleccionarlo · .xlsx / .xls</p>
          </>
        )}
      </div>

      {estado === 'success' && (
        <div className={styles.msgSuccess}>{mensaje}</div>
      )}
      {estado === 'error' && (
        <div className={styles.msgError}>{mensaje}</div>
      )}
    </div>
  );
}
