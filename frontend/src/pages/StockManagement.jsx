import React, { useState, useEffect } from 'react';
import { fetchCategories, fetchProducts } from '../services/api';
import styles from './StockManagement.module.css';

const StockManagement = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = async () => {
    try {
      const dataCat = await fetchCategories();
      setCategories(Array.isArray(dataCat) ? dataCat : dataCat.data || []);
      
      const dataProd = await fetchProducts();
      setProducts(dataProd);
      const total = dataProd.reduce((acc, p) => acc + (p.estoque_atual || 0), 0);
      setTotalItems(total);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedImages([]); // Limpa as imagens ao fechar
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const newImages = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Acrescentar as imagens arrastadas/adicionadas
    // O backend multer recebe o arquivo no campo 'imagens'
    formData.delete('imagens'); // Remove caso já exista algo no form nativamente
    selectedImages.forEach(img => {
      formData.append('imagens', img.file);
    });

    try {
      const response = await fetch('http://localhost:3000/api/produtos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao criar produto');
      }

      alert('Produto salvo com sucesso!');
      closeModal();
      loadData(); // Recarrega a listagem de produtos
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar produto!');
    }
  };

  const [newCategoryName, setNewCategoryName] = useState('');
  
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newCategoryName })
      });

      if (!response.ok) throw new Error('Falha ao criar categoria');

      alert('Categoria salva com sucesso!');
      setNewCategoryName('');
      loadData(); // Recarrega listagem de categorias
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar categoria!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <header className={styles.header}>
          <img src="/src/assets/logo/logo.png" alt="Tres Pescadores Store Logo" className={styles.logo} onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
          <div className={styles.titleContainer}>
            <h1>Tres Pescadores Store</h1>
            <div className={styles.subtitle}>Gerenciar Estoque</div>
          </div>
        </header>

        {/* Main Content */}
        <div className={styles.content}>
          <h2>Painel do Fornecedor</h2>
          <p className={styles.subtitle}>Gerencie seu catálogo de produtos e estoques de forma eficiente</p>

          {/* Actions Bar */}
          <div className={styles.actionsBar}>
            <span className={styles.actionsLabel}>⚡ Ações Rápidas:</span>
            <button className={`${styles.btn} ${styles.btnBlue}`} onClick={() => setActiveModal('novo-produto')}>+ Novo Produto</button>
            <button className={`${styles.btn} ${styles.btnLight}`} onClick={() => setActiveModal('categorias')}>📋 Categorias</button>
            <button className={`${styles.btn} ${styles.btnGreenSearch}`} onClick={() => setActiveModal('lancar-produtos')}>+ Lançar Produtos</button>
            <button className={`${styles.btn} ${styles.btnYellow}`} onClick={() => setActiveModal('lancamento-massa')}>&equiv; Lançamento em Massa</button>
          </div>

          {/* Dashboards */}
          <div className={styles.dashboardCards}>
            <div className={`${styles.card} ${styles.card1}`}>
              <h3>Produtos</h3>
              <div className={styles.value}>{products.length} <span>cadastrados</span></div>
            </div>
            <div className={`${styles.card} ${styles.card2}`}>
              <h3>Quantidade</h3>
              <div className={styles.value}>{totalItems} <span>itens total</span></div>
            </div>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <span style={{fontSize: '18px'}}>ℹ️</span> Dica Prática: Organize seus produtos por estoques separados para facilitar o gerenciamento de diferentes centros de distribuição.
          </div>

          {/* Table Area */}
          <div className={styles.searchBar}>
            <div>
              <h3>Catálogo de Produtos</h3>
              <p className={styles.hint}>Visualize e gerencie todos os seus produtos</p>
            </div>
            <div>
              <input type="text" placeholder="Buscar por nome ou SKU..." className={styles.searchInput} />
              <button className={`${styles.btn} ${styles.btnLight}`} style={{marginLeft: '12px'}}>Filtros</button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Unidade</th>
                <th>Quantidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className={styles.tableBodyRow}>
                  <td>{product.nome}</td>
                  <td>{product.id}</td>
                  <td>un</td>
                  <td>{product.estoque_atual || 0}</td>
                  <td>
                    <button className={`${styles.btn} ${styles.btnLight}`} style={{padding:'4px 8px', fontSize:'12px'}}>Editar</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      
      {/* Novo Produto Modal */}
      {activeModal === 'novo-produto' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalSidebar} ${styles.sidebarBlue}`}>
              <h3>Dicas Rápidas</h3>
              <ul>
                <li>Use um nome descritivo e fácil de encontrar.</li>
                <li>Defina preços de varejo e atacado para ofertas atraentes.</li>
                <li>Categorias ajudam seus clientes a encontrar produtos rapidamente.</li>
              </ul>
            </div>
            <div className={styles.modalBody}>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
              <div className={styles.modalHeader}>
                <h2>Novo Produto</h2>
                <p>Preencha as informações e organize seu produto em poucos passos.</p>
              </div>
              <form onSubmit={handleCreateProduct}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>INFORMAÇÕES BÁSICAS</h4>
                  <div className={styles.formGroup}>
                    <label>Nome *</label>
                    <input type="text" name="nome" className={styles.formControl} placeholder="Ex.: Produto Exemplo" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Categoria(s) *</label>
                    <select name="id_categoria" multiple className={styles.formControl} required style={{ height: 'auto', minHeight: '100px' }}>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                    <span className={styles.hint}>Pressione Ctrl (ou Cmd) para selecionar mais de uma. (<i>Atualmente salva apenas na categoria principal no banco.</i>)</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Descrição</label>
                    <textarea name="descricao" className={styles.formControl} placeholder="Conte brevemente os principais diferenciais do produto"></textarea>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>PREÇO</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Preço de Custo (R$) *</label>
                      <input type="number" step="0.01" name="preco_custo" className={styles.formControl} placeholder="0.00" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Preço de Venda (R$) *</label>
                      <input type="number" step="0.01" name="preco_venda" className={styles.formControl} placeholder="0.00" required />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>DIMENSÕES E PESO</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Peso (kg)</label>
                      <input type="number" step="0.001" name="peso" className={styles.formControl} placeholder="0.000" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Altura (cm)</label>
                      <input type="number" step="0.01" name="altura" className={styles.formControl} placeholder="0.00" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Largura (cm)</label>
                      <input type="number" step="0.01" name="largura" className={styles.formControl} placeholder="0.00" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Profundidade (cm)</label>
                      <input type="number" step="0.01" name="profundidade" className={styles.formControl} placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>IMAGENS</h4>
                  <div className={styles.formGroup}>
                    <label>Upload de Imagens</label>
                    <div 
                      className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input 
                        type="file" 
                        name="imagens" 
                        multiple 
                        accept="image/*" 
                        className={styles.dropzoneInput} 
                        onChange={handleImageChange}
                        title="Arraste as imagens aqui ou clique para selecionar"
                      />
                      <div className={styles.dropzoneText}>
                        <strong>Arraste as imagens aqui</strong> ou clique para selecionar
                      </div>
                      <span className={styles.hint}>Suporta múltiplas imagens (JPG, PNG, etc).</span>
                    </div>

                    {/* Previews das Imagens */}
                    {selectedImages.length > 0 && (
                      <div className={styles.imagePreviewGallery}>
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className={styles.imagePreviewItem}>
                            <img src={img.preview} alt={`Preview ${idx}`} />
                            <button 
                              type="button" 
                              className={styles.removeImageBtn} 
                              onClick={() => removeImage(idx)}
                              title="Remover imagem"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.modalFooter}>
                   <button type="button" className={`${styles.btn} ${styles.btnLight}`} onClick={closeModal}>Cancelar</button>
                   <button type="submit" className={`${styles.btn} ${styles.btnBlue}`}>Salvar Produto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lançar Produtos Modal */}
      {activeModal === 'lancar-produtos' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalSidebar} ${styles.sidebarGreenLight}`}>
              <h3>Comece com o produto certo</h3>
              <ul>
                <li>Pesquise por nome ou SKU para localizar rapidamente.</li>
                <li>Reveja o estoque selecionado para confirmar o endereço.</li>
                <li>Defina a quantidade exata para evitar ajustes posteriores.</li>
              </ul>
            </div>
            <div className={styles.modalBody}>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
              <div className={styles.modalHeader}>
                <h2>Lançar produto no estoque</h2>
                <p>Selecione um produto do catálogo, escolha o estoque e informe a quantidade.</p>
              </div>
              <form>
                <div className={styles.formGroup}>
                  <label>Busque por nome, SKU ou descrição do produto...</label>
                  <input type="text" className={styles.formControl} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Estoque *</label>
                    <select className={styles.formControl}>
                      <option>-- Selecione um estoque --</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Quantidade *</label>
                    <input type="number" className={styles.formControl} placeholder="0.00" />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                   <button type="button" className={`${styles.btn} ${styles.btnLight}`} onClick={closeModal}>Cancelar</button>
                   <button type="button" className={`${styles.btn} ${styles.btnGreenDark}`}>Lançar no estoque</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lançamento em Massa Modal */}
      {activeModal === 'lancamento-massa' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalSidebar} ${styles.sidebarOrange}`}>
              <h3>Boas práticas</h3>
              <ul>
                <li>Escolha um único estoque de destino para esta operação.</li>
                <li>Adicione produtos usando busca rápida.</li>
                <li>Revise o resumo antes de confirmar.</li>
              </ul>
            </div>
            <div className={styles.modalBody}>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
              <div className={styles.modalHeader}>
                <h2>Lançamento em massa</h2>
                <p>Distribua diversas unidades em um único estoque de destino com rapidez.</p>
              </div>
              <form>
                <div className={styles.formGroup}>
                  <label>Estoque de destino *</label>
                  <select className={styles.formControl}>
                    <option>-- Selecione o estoque --</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Adicionar Produtos</label>
                  <input type="text" className={styles.formControl} placeholder="Digite para pesquisar e adicionar produtos..." />
                </div>
                <div className={styles.modalFooter}>
                   <button type="button" className={`${styles.btn} ${styles.btnLight}`} onClick={closeModal}>Cancelar</button>
                   <button type="button" className={`${styles.btn} ${styles.btnOrange}`}>Lançar em massa</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transferência Modal */}
      {activeModal === 'transferencia' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalSidebar} ${styles.sidebarBlue}`}>
              <h3>Recomendações</h3>
              <ul>
                <li>Selecione estoques origem e destino antes de pesquisar produtos.</li>
                <li>As transferências são atômicas.</li>
                <li>Revise o resumo para evitar mover itens incorretos.</li>
              </ul>
            </div>
            <div className={styles.modalBody}>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
              <div className={styles.modalHeader}>
                <h2>Transferência em massa</h2>
                <p>Mova diversos produtos entre estoques diferentes em uma única operação.</p>
              </div>
              <form>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Estoque origem *</label>
                    <select className={styles.formControl}>
                      <option>-- Selecione o estoque origem --</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Estoque destino *</label>
                    <select className={styles.formControl}>
                      <option>-- Selecione o estoque destino --</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Adicionar Produtos</label>
                  <input type="text" className={styles.formControl} placeholder="Selecione primeiro o estoque origem..." />
                </div>
                <div className={styles.modalFooter}>
                   <button type="button" className={`${styles.btn} ${styles.btnLight}`} onClick={closeModal}>Cancelar</button>
                   <button type="button" className={`${styles.btn} ${styles.btnBlue}`}>Transferir em massa</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Novo Estoque Modal */}
      {activeModal === 'novo-estoque' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalSidebar} ${styles.sidebarGreenLight}`}>
              <h3>Orientações</h3>
              <ul>
                <li>Cadastre estoques próximos aos seus centros de distribuição.</li>
                <li>Utilize endereços existentes para agilizar.</li>
                <li>Defina a disponibilidade.</li>
              </ul>
            </div>
            <div className={styles.modalBody}>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
              <div className={styles.modalHeader}>
                <h2>Novo estoque</h2>
                <p>Cadastre um novo local de armazenamento para organizar seus produtos.</p>
              </div>
              <form>
                <div className={styles.formGroup}>
                  <label>Nome do estoque *</label>
                  <input type="text" className={styles.formControl} />
                </div>
                <div className={styles.formGroup}>
                  <label>Descrição</label>
                  <textarea className={styles.formControl} placeholder="Descreva a finalidade deste estoque"></textarea>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>CEP *</label>
                    <input type="text" className={styles.formControl} placeholder="00000-000" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>UF *</label>
                    <input type="text" className={styles.formControl} />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                   <button type="button" className={`${styles.btn} ${styles.btnLight}`} onClick={closeModal}>Cancelar</button>
                   <button type="button" className={`${styles.btn} ${styles.btnGreenLight}`}>Salvar estoque</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Categorias Modal */}
      {activeModal === 'categorias' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalSidebar} ${styles.sidebarBlue}`}>
              <h3>Gestão de Categorias</h3>
              <ul>
                <li>Crie categorias claras para facilitar a navegação.</li>
                <li>Pense em como seus clientes encontram os produtos.</li>
                <li>Categorias bem definidas ajudam no controle de estoque.</li>
              </ul>
            </div>
            <div className={styles.modalBody}>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
              <div className={styles.modalHeader}>
                <h2>Gerenciar Categorias</h2>
                <p>Visualize e adicione novas categorias aos seus produtos.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>NOVA CATEGORIA</h4>
                <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className={styles.formGroup} style={{ marginBottom: 0, flex: 1 }}>
                    <label>Nome da Categoria *</label>
                    <input 
                      type="text" 
                      className={styles.formControl} 
                      placeholder="Ex.: Imagens, Cestas, Terços..." 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={`${styles.btn} ${styles.btnBlue}`} style={{ height: '42px', padding: '0 20px' }}>Adicionar</button>
                </form>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>CATEGORIAS CADASTRADAS</h4>
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e1e7ec', borderRadius: '8px' }}>
                  <table className={styles.table} style={{ margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>Nome da Categoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id} className={styles.tableBodyRow}>
                          <td style={{ color: '#64748b' }}>#{cat.id}</td>
                          <td>{cat.nome}</td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Nenhuma categoria cadastrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnLight}`} onClick={closeModal}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default StockManagement;