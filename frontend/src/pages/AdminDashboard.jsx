import { useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { FiRefreshCw } from 'react-icons/fi';
import logo from '../assets/logo/logo.png';
import { fetchMediaAcuracidade } from '../services/api';
import styles from './AdminDashboard.module.css';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
);

const chartColors = {
  navy: '#10182c',
  blue: '#5366aa',
  slate: '#536073',
  sky: '#98c7f2',
  gold: '#f3d870',
  teal: '#08936f',
  softTeal: '#c8ded6',
  grid: 'rgba(16, 24, 44, 0.08)',
};

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        boxWidth: 14,
        color: '#5a5a5a',
        font: { size: 11 },
      },
    },
  },
};

function AdminDashboard() {
  const [accuracy, setAccuracy] = useState(null);
  const [loadingAccuracy, setLoadingAccuracy] = useState(true);
  const [accuracyError, setAccuracyError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAccuracy() {
      try {
        setLoadingAccuracy(true);
        setAccuracyError('');
        const data = await fetchMediaAcuracidade();

        if (isMounted) {
          setAccuracy(data);
        }
      } catch (error) {
        if (isMounted) {
          setAccuracyError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingAccuracy(false);
        }
      }
    }

    loadAccuracy();

    return () => {
      isMounted = false;
    };
  }, []);

  const accuracyValue = Math.max(0, Math.min(100, Number(accuracy?.media_acuracidade || 0)));

  const revenueData = useMemo(() => ({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Faturamento',
        data: [12000, 15000, 18000, 24000, 19800, 21000, 23000],
        borderColor: chartColors.navy,
        backgroundColor: 'rgba(16, 24, 44, 0.08)',
        pointBackgroundColor: chartColors.navy,
        pointBorderColor: chartColors.navy,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  }), []);

  const funnelData = useMemo(() => ({
    labels: ['Visitantes', 'Adicoes', 'Checkout', 'Compras'],
    datasets: [
      {
        data: [61, 25, 9, 5],
        backgroundColor: [chartColors.navy, chartColors.slate, chartColors.sky, chartColors.gold],
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  }), []);

  const productData = useMemo(() => ({
    labels: ['Vela de Soja', 'Ima Aparecida', 'Vela de Mirra', 'Vela de Incenso', 'Terco Oliveira', 'Terco Madeira'],
    datasets: [
      {
        label: 'Unidades vendidas',
        data: [100, 42, 36, 31, 24, 18],
        backgroundColor: 'rgba(16, 24, 44, 0.12)',
        borderColor: chartColors.navy,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), []);

  const satisfactionData = useMemo(() => ({
    labels: ['Atendimento', 'Entrega', 'Qualidade', 'Preco', 'Experiencia'],
    datasets: [
      {
        label: 'Satisfacao',
        data: [0.75, 0.78, 0.92, 0.68, 0.82],
        borderColor: '#a7824f',
        backgroundColor: 'rgba(167, 130, 79, 0.22)',
        pointBackgroundColor: '#a7824f',
      },
    ],
  }), []);

  const accuracyData = useMemo(() => ({
    labels: ['Acuracidade media', 'Diferenca'],
    datasets: [
      {
        data: [accuracyValue, 100 - accuracyValue],
        backgroundColor: [chartColors.teal, '#bfc5c8'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
        cutout: '68%',
      },
    ],
  }), [accuracyValue]);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <img src={logo} alt="Tres Pescadores Store" />
          <div>
            <h1>Painel Administrativo</h1>
            <p>Visao geral e gestao rapida</p>
          </div>
        </header>

        <section className={styles.kpiGrid} aria-label="Indicadores principais">
          <article className={styles.kpiCard}>
            <span>Faturamento mensal</span>
            <strong>R$ 198.450,90</strong>
          </article>
          <article className={styles.kpiCard}>
            <span>Taxa de conversao</span>
            <strong>2,35%</strong>
          </article>
          <article className={styles.kpiCard}>
            <span>Ticket medio</span>
            <strong>R$ 243,65</strong>
          </article>
          <article className={styles.kpiCard}>
            <span>Taxa de recompra</span>
            <strong>26,8%</strong>
          </article>
        </section>

        <section className={styles.dashboardGrid}>
          <article className={`${styles.chartBlock} ${styles.wide}`}>
            <h2>Faturamento ao longo do tempo</h2>
            <div className={styles.chartCanvas}>
              <Line
                data={revenueData}
                options={{
                  ...commonOptions,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: {
                      min: 12000,
                      max: 24000,
                      ticks: { callback: (value) => `R$ ${value}` },
                      grid: { color: chartColors.grid },
                    },
                  },
                }}
              />
            </div>
          </article>

          <article className={styles.chartBlock}>
            <h2>Funil de conversao</h2>
            <div className={styles.chartCanvas}>
              <Doughnut data={funnelData} options={commonOptions} />
            </div>
          </article>

          <article className={`${styles.chartBlock} ${styles.productChart}`}>
            <h2>Produtos mais vendidos</h2>
            <div className={styles.chartCanvas}>
              <Bar
                data={productData}
                options={{
                  ...commonOptions,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { maxRotation: 12, minRotation: 12 } },
                    y: { beginAtZero: true, grid: { color: chartColors.grid } },
                  },
                }}
              />
            </div>
          </article>

          <article className={styles.chartBlock}>
            <h2>Satisfacao</h2>
            <div className={styles.chartCanvas}>
              <Radar
                data={satisfactionData}
                options={{
                  ...commonOptions,
                  plugins: { legend: { display: false } },
                  scales: {
                    r: {
                      min: 0,
                      max: 1,
                      ticks: { stepSize: 0.2, backdropColor: 'transparent' },
                      grid: { color: chartColors.grid },
                      angleLines: { color: chartColors.grid },
                    },
                  },
                }}
              />
            </div>
          </article>

          <article className={styles.accuracyCard}>
            <div className={styles.accuracyHeader}>
              <div>
                <h2>Acuracidade</h2>
                <span>{accuracy?.total_auditorias || 0} produtos auditados</span>
              </div>
              {loadingAccuracy && <FiRefreshCw className={styles.loadingIcon} />}
            </div>
            <div className={styles.accuracyChart}>
              <Doughnut
                data={accuracyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${Number(context.raw).toFixed(2)}%`,
                      },
                    },
                  },
                }}
              />
              <div className={styles.accuracyValue}>
                <strong>{loadingAccuracy ? '--' : `${accuracyValue.toFixed(2)}%`}</strong>
                <span>Acuracidade media</span>
              </div>
            </div>
            {accuracyError && <p className={styles.errorText}>{accuracyError}</p>}
          </article>
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;
