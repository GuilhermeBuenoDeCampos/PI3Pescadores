import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  RadarController,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  RadarController,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
  ,Filler
);

export function RevenueChart({ height = 220 }) {
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: [12000, 15000, 18000, 24000, 19845, 21000, 23000],
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15,23,42,0.06)',
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#0f172a',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(15,23,42,0.04)' }, ticks: { callback: (v) => `R$ ${v}` } },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}

export function FunnelChart({ height = 220 }) {
  const data = {
    labels: ['Visitantes', 'Adições', 'Checkout', 'Compras'],
    datasets: [
      {
        label: 'Funil',
        data: [1000, 420, 150, 90],
        backgroundColor: ['#0f172a', '#475569', '#93c5fd', '#fde68a'],
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function AccuracyGauge({ value = 98.2, height = 180 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const data = {
    labels: ['Acuracidade', 'Resto'],
    datasets: [
      {
        data: [v, 100 - v],
        backgroundColor: ['#10b981', '#e6eef8'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '78%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  return (
    <div style={{ height, position: 'relative' }}>
      <Doughnut data={data} options={options} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{v.toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Acuracidade média</div>
        </div>
      </div>
    </div>
  );
}

export function TopProductsChart({ labels = [], values = [], height = 180 }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Vendas',
        data: values,
        backgroundColor: '#0f172a',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(15,23,42,0.04)' } } },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}

export function NPSChart({ scores = [30, 40, 30], height = 160 }) {
  const data = {
    labels: ['Promotores', 'Neutros', 'Detratores'],
    datasets: [
      {
        data: scores,
        backgroundColor: ['#16a34a', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function RadarChart({ labels = [], values = [], height = 220 }) {
  // Ensure there are labels
  const lbls = Array.isArray(labels) && labels.length > 0 ? labels : ['Satisfação', 'Recompra', 'Lealdade', 'Métrica', 'Satisfação'];

  // Normalize values to 0..1 if they appear to be percentages (0..100)
  const raw = Array.isArray(values) && values.length === lbls.length ? values : new Array(lbls.length).fill(0.6);
  const maxVal = Math.max(...raw.map((v) => Number(v) || 0));
  const normalized = raw.map((v) => {
    const n = Number(v) || 0;
    return maxVal > 1 ? Math.max(0, Math.min(1, n / 100)) : Math.max(0, Math.min(1, n));
  });

  // create layered datasets to simulate the concentric filled effect
  const layers = [1.0, 0.66, 0.33];
  const baseColor = '160,125,80'; // warm brown tone
  const datasets = layers.map((factor, i) => ({
    label: `layer-${i}`,
    data: normalized.map((v) => v * factor),
    borderColor: i === 0 ? `rgba(${baseColor},0.9)` : `rgba(${baseColor},0.45)`,
    borderWidth: i === 0 ? 2 : 1,
    backgroundColor: `rgba(${baseColor},${0.12 * (i + 1)})`,
    pointRadius: i === 0 ? 4 : 0,
    pointBackgroundColor: `rgba(${baseColor},0.9)`,
  }));

  const data = { labels: lbls, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 1,
        grid: { color: 'rgba(15,23,42,0.06)', circular: true },
        ticks: { stepSize: 0.2, callback: (v) => v.toFixed(1) },
        angleLines: { color: 'rgba(15,23,42,0.06)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${(ctx.parsed.r * 100).toFixed(0)}%` } },
    },
  };

  return (
    <div style={{ height }}>
      <Radar data={data} options={options} />
    </div>
  );
}

export default function Charts() {
  return null;
}
