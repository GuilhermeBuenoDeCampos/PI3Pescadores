import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { fetchKpiAcuracidade } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FaTachometerAlt, FaChartLine, FaFilter, FaUsers, FaTags, FaBox, FaHeadset, FaCross, FaBible, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';

function AdminDashboard() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadKpiData = async () => {
    try {
      setLoading(true);
      const result = await fetchKpiAcuracidade(dataInicio, dataFim);
      const formattedData = result.map(item => ({
        ...item,
        data: new Date(item.data).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
        acuracidade_media: parseFloat(item.media_acuracidade).toFixed(2)
      }));
      setKpiData(formattedData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadKpiData(); }, [dataInicio, dataFim]);

  const globalAcuracidade = useMemo(() => {
    if (!kpiData.length) return 0;
    const sum = kpiData.reduce((acc, curr) => acc + parseFloat(curr.acuracidade_media), 0);
    return (sum / kpiData.length).toFixed(1);
  }, [kpiData]);

  const pieData = [
    { name: 'Acuracidade', value: parseFloat(globalAcuracidade) || 98.2 },
    { name: 'Falta', value: 100 - (parseFloat(globalAcuracidade) || 98.2) }
  ];
  const pieColors = ['#1e40af', '#e2e8f0'];

  const radarData = [
    { subject: 'Satisfação', A: 120, fullMark: 150 },
    { subject: 'Recompra', A: 98, fullMark: 150 },
    { subject: 'Lealdade', A: 86, fullMark: 150 },
    { subject: 'Reclamação', A: 40, fullMark: 150 },
    { subject: 'NPS', A: 99, fullMark: 150 },
    { subject: 'Promoção', A: 85, fullMark: 150 },
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <FaBible size={48} color="#eab308" />
        </div>
        <nav className={styles.navMenu}>
          <div className={`${styles.navItem} ${styles.active}`}><FaTachometerAlt /> Visão Geral</div>
          <div className={styles.navItem}><FaChartLine /> Vendas & Receita</div>
          <div className={styles.navItem}><FaFilter /> Conversão & Funil</div>
          <div className={styles.navItem}><FaUsers /> Clientes & Fidelização</div>
          <div className={styles.navItem}><FaTags /> Produtos</div>
          <Link to="/estoque" className={styles.navItem} style={{textDecoration: 'none', color: 'inherit'}}><FaBox /> Estoque</Link>
          <div className={styles.navItem}><FaHeadset /> Atendimentos</div>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.titleArea}>
            <p>LOJA ARTIGOS RELIGIOSOS</p>
            <h1>Dashboard - Visão geral do desempenho da loja</h1>
          </div>
          <div className={styles.dateFilter}>
            <span>Período:</span>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
            <span>-</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
            <button onClick={loadKpiData}>Aplicar</button>
          </div>
        </header>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <h3>Faturamento Mensal</h3>
            <div className={styles.value}>R$ 198.450,90 <span className={styles.positive}>(+18,6%)</span></div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Taxa de Conversão</h3>
            <div className={styles.value}>2,35%</div>
          </div>
           <div className={styles.kpiCard}>
            <h3>Ticket Médio</h3>
            <div className={styles.value}>R$ 243,65</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Taxa de Recompra</h3>
            <div className={styles.value}>26,8%</div>
          </div>
          <div className={styles.kpiCard}>
            <h3>Satisfação (NPS)</h3>
            <div className={styles.value}>4,7/5</div>
          </div>
        </div>

        <div className={styles.middleGrid}>
          <div className={styles.chartCard} style={{gridColumn: '1 / span 2'}}>
            <h3>Evolução da Acuracidade</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={kpiData.length ? kpiData : [{data: '01/05', acuracidade_media: 90}, {data: '31/05', acuracidade_media: 99}]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcura" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="acuracidade_media" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAcura)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3>Visitantes ➔ Carrinho ➔ Checkout ➔ Compras</h3>
            <div className={styles.funnelMock}>
              <div className={styles.funnelStep}><FaUsers size={32} color="#3b82f6" /><p>100%</p></div>
              <span>➔</span>
              <div className={styles.funnelStep}><FaShoppingCart size={32} color="#f59e0b" /><p>30%</p></div>
              <span>➔</span>
              <div className={styles.funnelStep}><FaMoneyBillWave size={32} color="#10b981" /><p>15%</p></div>
              <span>➔</span>
              <div className={styles.funnelStep}><FaBox size={32} color="#8b5cf6" /><p>2%</p></div>
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.chartCard} style={{flex: 5, flexBasis: '50%'}}>
            <h3>Produtos mais vendidos & pesquisados</h3>
            <div className={styles.productDisplay}>
              <div className={styles.prodGroup}>
                <div className={styles.prodItem}>Santo Terço</div>
                <div className={styles.prodItem}>Imagem NS Aparecida</div>
                <div className={styles.prodItem}>Sagrado Coração</div>
              </div>
              <div className={styles.prodGroup}>
                <div className={styles.prodItem}>Bíblia Sagrada</div>
                <div className={styles.prodItem}>Crucifixo de Parede</div>
                <div className={styles.prodItem}>Vela Aromática</div>
              </div>
            </div>
          </div>
          <div className={styles.chartCard} style={{flex: 3, flexBasis: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h3>Acuracidade do Estoque</h3>
            <div style={{ position: 'relative', width: 200, height: 200}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutCenter}>
                {globalAcuracidade > 0 ? globalAcuracidade : 98.2}%
              </div>
            </div>
          </div>
          <div className={styles.chartCard} style={{flex: 2, flexBasis: '20%'}}>
            <h3>Satisfação (NPS)</h3>
            <div style={{ width: '100%', height: 200}}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10}} />
                  <Radar name="NPS" dataKey="A" stroke="#d97706" fill="#fcd34d" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <Link to="/" className={styles.backLink}>Voltar para a Loja</Link>
      </main>
    </div>
  );
}

export default AdminDashboard;