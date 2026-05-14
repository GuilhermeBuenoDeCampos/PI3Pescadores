import React from 'react';
import styles from './AdminDashboard.module.css';
import logo from '../assets/logo/logo.png';
import { RevenueChart, FunnelChart, AccuracyGauge, TopProductsChart, RadarChart } from '../components/Charts';
import { fetchFeedbackMetrics, getImageUrl } from '../services/api';
import { fetchHistoricoAuditoria, fetchProducts } from '../services/api';
import { useState, useEffect } from 'react';

function ImageUploader({ label, name }) {
  return (
    <div className={styles.uploader}>
      <div className={styles.uploaderPreview} aria-hidden>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3v12" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 7l4-4 4 4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className={styles.uploaderMeta}>
        <label className={styles.uploaderLabel}>{label}</label>
        <input type="file" name={name} accept="image/*" className={styles.uploaderInput} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [topProducts, setTopProducts] = useState({ labels: [], values: [] });
  const [satisfaction, setSatisfaction] = useState({ labels: [], values: [] });

  useEffect(() => {
    async function loadMetrics() {
      try {
        // fetch audit history (last 100) and compute average acuracidade
        const hist = await fetchHistoricoAuditoria(1, 100);
        const items = Array.isArray(hist.data) ? hist.data : [];
        if (items.length > 0) {
          const sum = items.reduce((acc, it) => acc + (Number(it.acuracidade) || 0), 0);
          setAvgAccuracy(sum / items.length);
        } else {
          setAvgAccuracy(0);
        }

        // derive top products (placeholder: use product count as proxy)
        const products = await fetchProducts();
        // try to sort by 'vendas' or 'qtd_vendida' if present, otherwise by estoque_atual desc
        const sorted = products.slice().sort((a,b) => (b.vendas || b.estoque_atual || 0) - (a.vendas || a.estoque_atual || 0)).slice(0,6);
        setTopProducts({ labels: sorted.map(p => p.nome || `#${p.id}`), values: sorted.map(p => p.vendas || p.estoque_atual || 0) });

        // load satisfaction metrics (try backend endpoint, fallback to sample)
        try {
          const fb = await fetchFeedbackMetrics();
          // expected shape: { labels: [], values: [] }
          if (fb && Array.isArray(fb.labels) && Array.isArray(fb.values)) {
            setSatisfaction({ labels: fb.labels, values: fb.values });
          } else {
            // fallback sample
            setSatisfaction({ labels: ['Atendimento','Entrega','Qualidade','Preço','Experiência'], values: [72, 88, 90, 66, 82] });
          }
        } catch (err) {
          console.warn('Feedback metrics not available, using sample', err);
          setSatisfaction({ labels: ['Atendimento','Entrega','Qualidade','Preço','Experiência'], values: [72, 88, 90, 66, 82] });
        }
      } catch (err) {
        console.error('Failed to load metrics', err);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <div className={styles.titleContainer}>
            <h1>Painel Administrativo</h1>
            <div className={styles.subtitle}>Visão geral e gestão rápida</div>
          </div>
        </header>

        {/* Ações rápidas removidas conforme solicitado */}

        <section className={styles.dashboardCards}>
          <div className={styles.card}>
            <h4>Faturamento Mensal</h4>
            <div className={styles.cardValue}>R$ 198.450,90</div>
          </div>

          <div className={styles.card}>
            <h4>Taxa de Conversão</h4>
            <div className={styles.cardValue}>2,35%</div>
          </div>

          <div className={styles.card}>
            <h4>Ticket Médio</h4>
            <div className={styles.cardValue}>R$ 243,65</div>
          </div>

          <div className={styles.card}>
            <h4>Taxa de Recompra</h4>
            <div className={styles.cardValue}>26,8%</div>
          </div>
        </section>

        {/* Caixa de dica removida conforme solicitado */}

        <section style={{ marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div>
              <h4>Faturamento ao longo do tempo</h4>
              <div className={styles.chartContainer}>
                <RevenueChart />
              </div>
            </div>
            <div>
              <h4>Funil de Conversão</h4>
              <div className={styles.chartContainer}>
                <FunnelChart />
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          <div>
            <h4>Produtos mais vendidos</h4>
            <div className={styles.chartContainer} style={{ height: 240 }}>
              <TopProductsChart labels={topProducts.labels} values={topProducts.values} />
            </div>
            <div
              className={styles.metricCard}
              style={{
                marginTop: 12,
                backgroundImage: `url(${getImageUrl('/uploads/img/acuracidade.jpeg')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <h4 style={{ zIndex: 2, margin: 0 }}>Acuracidade</h4>
              <div className={styles.accuracyWrapper}>
                <AccuracyGauge value={avgAccuracy || 0} height={120} />
              </div>
            </div>
          </div>

          <aside>
            <h4>Satisfação</h4>
            <div className={styles.chartContainer} style={{ height: 260 }}>
              <RadarChart labels={satisfaction.labels} values={satisfaction.values} />
            </div>
            {/* Produtos - imagens removido para padronização do painel */}
          </aside>
        </section>
      </div>
    </div>
  );
}
