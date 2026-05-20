'use client';

import { useRef, useEffect } from 'react';
import type { SemanaSummary } from '@/types/dashboard';

interface ChartProps {
  data: SemanaSummary[];
}

const PAD = { top: 30, right: 20, bottom: 52, left: 40 };

export default function Chart({ data }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const DPR = window.devicePixelRatio || 1;
    const yMax = Math.max(...data.map(d => Math.max(d.agendadas, d.asistidas)), 1) + 1;

    function resize() {
      const r = container!.getBoundingClientRect();
      canvas!.width = r.width * DPR;
      canvas!.height = r.height * DPR;
      canvas!.style.width = r.width + 'px';
      canvas!.style.height = r.height + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function xy(i: number, v: number) {
      const w = canvas!.width / DPR;
      const h = canvas!.height / DPR;
      const n = data.length > 1 ? data.length - 1 : 1;
      return {
        x: PAD.left + (i / n) * (w - PAD.left - PAD.right),
        y: PAD.top + (h - PAD.top - PAD.bottom) - (v / yMax) * (h - PAD.top - PAD.bottom),
      };
    }

    function draw() {
      const w = canvas!.width / DPR;
      const h = canvas!.height / DPR;
      const ph = h - PAD.top - PAD.bottom;
      ctx.clearRect(0, 0, w, h);

      for (let v = 0; v <= yMax; v++) {
        const y = PAD.top + ph - (v / yMax) * ph;
        ctx.strokeStyle = '#e0edf2';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(w - PAD.right, y);
        ctx.stroke();
        ctx.fillStyle = '#9dbac8';
        ctx.font = '400 10px Karla';
        ctx.textAlign = 'right';
        ctx.fillText(String(v), PAD.left - 10, y + 3.5);
      }

      data.forEach((d, i) => {
        const p = xy(i, 0);
        const isEmpty = d.agendadas === 0 && d.asistidas === 0;
        ctx.fillStyle = isEmpty ? '#c8dde5' : '#7fa0b0';
        ctx.font = '500 10px Karla';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(p.x, h - PAD.bottom + 14);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(d.semana, 0, 0);
        ctx.restore();
      });

      const ptsAg = data.map((d, i) => xy(i, d.agendadas));
      const ptsAs = data.map((d, i) => xy(i, d.asistidas));

      function fillArea(pts: { x: number; y: number }[], color: string) {
        const base = PAD.top + ph;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, base);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, base);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, PAD.top, 0, base);
        g.addColorStop(0, color + '18');
        g.addColorStop(1, color + '03');
        ctx.fillStyle = g;
        ctx.fill();
      }
      fillArea(ptsAg, '#008fbe');
      fillArea(ptsAs, '#3fc2ad');

      function strokeLine(pts: { x: number; y: number }[], color: string) {
        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      strokeLine(ptsAg, '#008fbe');
      strokeLine(ptsAs, '#3fc2ad');

      function drawDots(
        pts: { x: number; y: number }[],
        color: string,
        key: 'agendadas' | 'asistidas'
      ) {
        pts.forEach((p, i) => {
          const val = data[i][key];
          const agVal = data[i].agendadas;
          const asVal = data[i].asistidas;

          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.font = '700 10px Karla';
          ctx.textAlign = 'center';
          ctx.fillStyle = color;

          let offsetY = -12;
          if (key === 'asistidas' && agVal === asVal && agVal > 0) offsetY = 16;
          if (key === 'asistidas' && val === 0 && agVal === 0) return;
          if (key === 'asistidas' && val === 0 && agVal > 0) offsetY = 12;

          ctx.fillText(String(val), p.x, p.y + offsetY);
        });
      }
      drawDots(ptsAg, '#008fbe', 'agendadas');
      drawDots(ptsAs, '#3fc2ad', 'asistidas');
    }

    resize();
    draw();

    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(container);
    return () => ro.disconnect();
  }, [data]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 340 }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
