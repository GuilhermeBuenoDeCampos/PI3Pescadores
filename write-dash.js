const fs = require('fs');

const jsx = `import { useState, useEffect, useMemo } from 'react';
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
          <div className={\`\${styles.navItem} \${styles.active}\`}><FaTachometerAlt /> Visão Geral</div>
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
                      <Cell key={\`cell-\${index}\`} fill={pieColors[index % pieColors.length]} />
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
\`;

const css = \`
.adminLayout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.sidebar { width: 250px; background-color: #0f172a; color: #94a3b8; display: flex; flex-direction: column; flex-shrink: 0; }
.sidebarLogo { padding: 30px 20px; display: flex; justify-content: center; border-bottom: 1px solid #1e293b; }
.navMenu { display: flex; flex-direction: column; padding: 20px 0; }
.navItem { padding: 15px 30px; display: flex; align-items: center; gap: 14px; cursor: pointer; font-size: 0.95em; transition: all 0.2s; border-left: 4px solid transparent; }
.navItem:hover { background-color: #1e293b; color: #f8fafc; }
.navItem.active { background-color: #1e293b; color: #ffffff; border-left: 4px solid #eab308; }
.mainContent { flex: 1; padding: 30px 40px; overflow-y: auto; overflow-x: hidden; }
.topbar {
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;
}
.titleArea p { font-size: 0.9em; color: #64748b; margin-bottom: 4px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
.titleArea h1 { font-size: 1.8em; color: #0f172a; font-weight: 800; margin: 0; }
.dateFilter { display: flex; align-items: center; gap: 10px; background: #ffffff; padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 0.95em; color: #334155; }
.dateFilter input  { border: none; outline: none; color: #334155; font-family: inherit; }
.dateFilter button { background: #f1f5f9; border: 1px solid #64748b; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: 600; color: #10b981; }
.dateFilter button:hover { background: #10b981; color: white; border-color: #10b981; }
.kpiGrid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 38px; }
.kpiCard { background: #ffffff; border-radius: 16px; padding: 22px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.03); border: 1px solid #eef2f6; text-align: center; }
.kpiCard h3 { font-size: 0.9em; color: #475569; margin-bottom: 12px; font-weight: 700; }
.kpiCard .value { font-size: 1.5em; font-weight: 800; color: #0f172a; display: flex; justify-content: center; align-items: baseline; gap: 8px; }
.value .positive { font-size: 0.85em; color: #16a34a; font-weight: 700; }
.middleGrid { display: grid; grid-template-columns: 2fr 1.2fr; gap: 30px; margin-bottom: 30px; }
.bottomGrid { display: flex; gap: 30px; margin-bottom: 40px; }
.chartCard { background: #ffffff; border-radius: 16px; padding: 24px 25px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  border: 1px solid #eef2f6; }
.chartCard h3 { font-size: 1.05em; color: #1e293b; margin-bottom: 24px; font-weight: 700; }
.funnelMock { display: flex; align-items: center; justify-content: space-between; 
  height: 230px; padding: 0 20px; color: #64748b; }
.funnelStep { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #34d399; }
.funnelStep p { font-weight: 800; font-size: 1.2em; color: #334155; margin: 0; }
.productDisplay { display: flex; gap: 10px; height: 180px; }
.prodGroup { flex: 1; display: flex; flex-direction: column; gap: 12px; justify-content: space-between; }
.prodItem { flex: 1; background: #f8fafc; border-radius: 1px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 10px; font-size: 0.92em; color: #1e293b; font-weight: 600; border-radius: 6px; }
.prodItem:hover { background: #e0f2fe; cursor: pointer; border-color: #0ea5e9; }
.donutCenter { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.8em; font-weight: 800; color: #1e40af; }
.backLink { display: inline-block; margin-top: 10px; color: #1d4ed8; text-decoration: none; font-weight: 600; transition: color 0.2s; }
.backLink:hover { color: #0b98e5; text-decoration: underline; }
\`;

fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', jsx);
fs.writeFileSync('frontend/src/pages/AdminDashboard.module.css', css);
console.log('Done!');
