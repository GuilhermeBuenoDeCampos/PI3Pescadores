import { useState, useEffect } from 'react';
import * as api from '../services/api';
import styles from './AuditoriaModal.module.css';

export default function AuditoriaModal({ isOpen, onClose, onSave }) {
  const [produtos, setProdutos] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen && produtos.length === 0) {
      carregarProdutos();
    }
  }, [isOpen]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const dados = await api.fetchProdutosAleatorios();
      setProdutos(dados);
      setAuditorias(dados.map(p => ({
        product_id: p.id,
        quantidade_sistema: p.quantidade_sistema,
        quantidade_fisica: 0,
      })));
      setCompleted(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos para auditoria');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantidadeChange = (index, valor) => {
    const novasAuditorias = [...auditorias];
    novasAuditorias[index].quantidade_fisica = parseInt(valor) || 0;
    setAuditorias(novasAuditorias);
  };

  const handleConcluir = async () => {
    try {
      setLoading(true);
      await api.salvarAuditoria(auditorias);
      setCompleted(true);
    } catch (error) {
      console.error('Erro ao salvar auditoria:', error);
      alert('Erro ao salvar auditoria');
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    setProdutos([]);
    setAuditorias([]);
    setCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleFechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Auditoria de Estoque</h2>
          <button className={styles.closeBtn} onClick={handleFechar}>✕</button>
        </div>

        {loading && !completed && (
          <div className={styles.content}>
            <p>Carregando produtos...</p>
          </div>
        )}

        {!loading && !completed && produtos.length > 0 && (
          <div className={styles.content}>
            <p className={styles.instrucoes}>
              Conte os itens abaixo e lance a quantidade física encontrada:
            </p>

            <div className={styles.produtos}>
              {auditorias.map((auditoria, index) => {
                const produto = produtos[index];
                return (
                  <div key={produto.id} className={styles.produtoItem}>
                    <div className={styles.produtoInfo}>
                      <h4>{produto.nome}</h4>
                      <p>Sistema: <strong>{auditoria.quantidade_sistema}</strong> unidades</p>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Quantidade Física:</label>
                      <input
                        type="number"
                        min="0"
                        value={auditoria.quantidade_fisica}
                        onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                        placeholder="Digite a quantidade"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={handleFechar}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleConcluir}>Concluir Auditoria</button>
            </div>
          </div>
        )}

        {!loading && completed && (
          <div className={styles.content}>
            <div className={styles.resultado}>
              <h3>Resultado da Auditoria</h3>
              <div className={styles.resultItems}>
                {auditorias.map((auditoria, index) => {
                  const produto = produtos[index];
                  const diferenca = auditoria.quantidade_fisica - auditoria.quantidade_sistema;
                  
                  // Calculate accuracy: if sistema=0, check if físico=0 (100%) or físico>0 (0%)
                  let acuracidade;
                  if (auditoria.quantidade_sistema === 0) {
                    acuracidade = auditoria.quantidade_fisica === 0 ? 100 : 0;
                  } else {
                    acuracidade = ((auditoria.quantidade_sistema - Math.abs(diferenca)) / auditoria.quantidade_sistema) * 100;
                  }
                  acuracidade = Math.max(0, Math.min(100, acuracidade));

                  return (
                    <div key={produto.id} className={styles.resultItem}>
                      <h5>{produto.nome}</h5>
                      <div className={styles.grid}>
                        <div>
                          <p>Sistema:</p>
                          <p className={styles.valor}>{auditoria.quantidade_sistema}</p>
                        </div>
                        <div>
                          <p>Físico:</p>
                          <p className={styles.valor}>{auditoria.quantidade_fisica}</p>
                        </div>
                        <div>
                          <p>Diferença:</p>
                          <p className={`${styles.valor} ${diferenca !== 0 ? styles.erro : ''}`}>
                            {diferenca > 0 ? '+' : ''}{diferenca}
                          </p>
                        </div>
                        <div>
                          <p>Acuracidade:</p>
                          <p className={`${styles.valor} ${acuracidade < 95 ? styles.alerta : styles.ok}`}>
                            {acuracidade.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.actions}>
                <button className={styles.submitBtn} onClick={handleFechar}>Fechar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
