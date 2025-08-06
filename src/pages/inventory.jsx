import React from "react";
import "./styles/inventory.css";
import Topbar from "../components/topbar";

function Inventory() {

  return (
    <section className="sectionContracts">
      <Topbar showSearch={true} />

        <div class="container">
            <header class="header">
            <h1>Resumo de Estoque</h1>
            <button class="btn-add">+ Adicionar Insumo</button>
            </header>

            <section class="summary">
            <div class="card blue">
                <p class="title">Categorias</p>
                <p class="total">12 itens</p>
            </div>
            <div class="card orange">
                <p class="title">Total de Produtos</p>
                <p class="total">120</p>
            </div>
            <div class="card red">
                <p class="title">Baixo Estoque</p>
                <p class="total">6 itens</p>
            </div>
            </section>

            <section class="inventory">
            <div class="inventory-header">
                <input type="text" placeholder="Pesquisar..." class="search" />
                <div class="actions">
                <button class="btn">Filtro</button>
                <button class="btn">Data</button>
                <button class="btn export">Exportar</button>
                </div>
            </div>

            <table>
                <thead>
                <tr>
                    <th><input type="checkbox" /></th>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Entrada</th>
                    <th>Preço Unitário</th>
                    <th>Em Estoque</th>
                    <th>Valor Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td><input type="checkbox" /></td>
                    <td><img src="https://via.placeholder.com/30" /> Luvas Cirúrgicas</td>
                    <td>Descartáveis</td>
                    <td>100</td>
                    <td>R$1,00</td>
                    <td>50</td>
                    <td>R$50,00</td>
                    <td class="status in-stock">Em estoque</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td><input type="checkbox" /></td>
                    <td><img src="https://via.placeholder.com/30" /> Máscaras N95</td>
                    <td>Proteção</td>
                    <td>50</td>
                    <td>R$5,00</td>
                    <td>0</td>
                    <td>R$0,00</td>
                    <td class="status out-stock">Sem estoque</td>
                    <td>...</td>
                </tr>
                </tbody>
            </table>

            <div class="pagination">

            </div>
            </section>

            <div className="sectionsInventory">
                <button><p>Próteses</p><p>12</p></button>
                <button><p>Malhas</p><p>08</p></button>
                <button><p>Kits Cirúrgicos</p><p>02</p></button>
            </div>
        </div>

     </section>
  );
}

export default Inventory;