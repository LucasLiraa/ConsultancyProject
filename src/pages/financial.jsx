import React, { useState } from "react";
import "./styles/inventory.css";
import Topbar from "../components/topbar";

// 💡 IMPORTAR O COMPONENTE DE MANUTENÇÃO
import MaintenanceMode from "../components/MaintenanceMode"; // Certifique-se que o caminho está correto

function Financial() {
  // ATIVAR/DESATIVAR MANUTENÇÃO AQUI 💡
  // Defina como 'true' para exibir a página de manutenção.
  const isMaintenanceMode = true; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const openModal = (title) => {
    setModalTitle(title);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Desabilita o scroll da página
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Restaura o scroll da página
  };

  // ---------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL LIMPA
  // ---------------------------------------------
  if (isMaintenanceMode) {
    // Se estiver em manutenção, retorna APENAS o componente de manutenção
    return <MaintenanceMode />;
  }

  // ---------------------------------------------
  // CONTEÚDO NORMAL DE INVENTÁRIO (Renderizado apenas se isMaintenanceMode for false)
  // ---------------------------------------------
  return (
    <section className="sectionContracts">
      <Topbar showSearch={true} />

      <div className="container">
        <header className="header">
          <h1>Resumo de Estoque</h1>
          <button className="btn-add">+ Adicionar Insumo</button>
        </header>

        <section className="summary">
          {/* ... Cartões de Resumo ... */}
          <div className="card blue" onClick={() => openModal("Próteses")}>
            <h2 className="title">Próteses</h2>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </div>
          <div className="card orange" onClick={() => openModal("Malhas")}>
            <h2 className="title">Malhas</h2>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </div>
        </section>

        <section className="inventory">
          {/* ... Tabela de Inventário ... */}
          <div className="inventory-header">
            <input type="text" placeholder="Pesquisar..." className="search" />
            <div className="actions">
              <button className="btn">Filtro</button>
              <button className="btn">Data</button>
              <button className="btn export">Exportar</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Insumos</th>
                <th>Entrada</th>
                <th>Preço Unitário</th>
                <th>Em Estoque</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Link produto</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="checkbox" /></td>
                <td><img src="https://via.placeholder.com/30" alt="Prótese" /> Prótese </td>
                <td>100</td>
                <td>R$1,00</td>
                <td>50</td>
                <td>R$50,00</td>
                <td className="status in-stock">Em estoque</td>
                <td>Link</td>
                <td>...</td>
              </tr>
            </tbody>
          </table>

          <div className="pagination"></div>
        </section>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h2>{modalTitle}</h2>
            <div className="modal-body">
              <p>Conteúdo em branco para {modalTitle}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Financial;