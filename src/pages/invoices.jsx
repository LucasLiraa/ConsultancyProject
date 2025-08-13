import React from "react";
import "./styles/invoices.css";
import Topbar from "../components/topbar";

function Invoices() {

  return (
    <section className="sectionContracts">
      <Topbar showSearch={true} />

      <div className="containerInvoices">
        <div className="invoicesHeader">
            <h3>Controle de Faturas - Consultório</h3>
            
             <div className="contentInvoicesHeader">
                <div className="contentInvoicesHeaderButton">
                    <button>Dia</button>
                    <button>Semana</button>
                    <button>Mensal</button>
                </div>
           
                <div>
                    01 de Agosto á 31 de Agosto de 2025
                </div>
            </div>
        </div>

        <div className="contentInvoiceBalance">
            <div className="contentInvoiceBalanceEsq">
                <div className="contentInvoiceBalanceUp">
                    <div className="contentInvoicesBalanceUpLeft">
                        <span>Saldo atual</span>
                        <h1>R$ 20.000,00</h1>

                        <p><span>Fundo de reservas:</span> R$ 4.000,00 | <span>Pró-labore:</span> R$ 16.000,00</p>
                    </div>
                    <div className="contentInvoicesBalanceUpRight">
                        <h4>Entradas deste mês:</h4>
                        <p>R$ 27.611,00</p>
                        <div className="divisor"></div>
                        <h4>Saídas deste mês:</h4>
                        <p>R$ 8.453,17</p>
                    </div>
                </div>
                <div className="contentInvoiceBalanceDown">
                    <div className="contentInvoiceBalanceDownHeader">
                        <h4>Descrição</h4>
                        <h4>Valor (R$)</h4>
                        <h4>Forma de pagamento</h4>
                        <h4>Data</h4>
                        <h4>Tipo</h4>
                    </div>
                    
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Aluguel Consultorio</p>
                        <p>R$ 3.547,88</p>
                        <p>Pix</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Imac Doutor</p>
                        <p>R$ 306,65</p>
                        <p>Crédito</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Canva Design</p>
                        <p>R$ 34,90</p>
                        <p>Crédito</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Capcut Edit</p>
                        <p>R$ 32,90</p>
                        <p>Crédito</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Malhas NewForm</p>
                        <p>R$ 479,52</p>
                        <p>Crédito</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Internet/Telefone</p>
                        <p>R$ 200,00</p>
                        <p>Pix</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Conta energia</p>
                        <p>R$ 60,00</p>
                        <p>Pix</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Salário Vanusa</p>
                        <p>R$ 840,00</p>
                        <p>Pix</p>
                        <p>10 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Contabilidade Honorário</p>
                        <p>R$ 420,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto</p>
                        <p className="InvoicesNegative">Saída</p>
                    </div>
                </div>
            </div>
            <div className="contentInvoiceBalanceDir">
                <div className="contentInvoceBalancePositive">
                    <h4>Entradas futuras</h4>
                    <h1>R$ 27.611,00</h1>

                    <div className="contentInvoceBalanceList">
                        <h4>Descrição</h4>
                        <h4>Valor</h4>
                        <h4>Data</h4>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Elizangela Aparecida</p>
                        <p>R$ 7.500,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Marilia Arruda</p>
                        <p>R$ 2.500,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Claudia Maria</p>
                        <p>R$ 3.284,00</p>
                        <p>20 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Mel Pereira</p>
                        <p>R$ 1.327,00</p>
                        <p>20 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Leonora Felix</p>
                        <p>R$ 13.000,00</p>
                        <p>30 de agosto</p>
                    </div>
                </div>
                <div className="contentInvoceBalanceNegative">
                    <h4>Saídas futuras</h4>
                    <h1>R$ 8.453,17</h1>

                    <div className="contentInvoceBalanceList">
                        <h4>Descrição</h4>
                        <h4>Valor</h4>
                        <h4>Data</h4>
                    </div>
                    
                    <div className="contentInvoceBalanceCelis">
                        <p>Contabilidade Honorário</p>
                        <p>R$ 420,00</p>
                        <p>05 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Saláio Vanusa</p>
                        <p>R$ 2.824,00</p>
                        <p>08 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Aluguel Consultorio</p>
                        <p>R$ 3.547,88</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Imac Doutor</p>
                        <p>R$ 306,65</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Canva Design</p>
                        <p>R$ 34,90</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Capcut Edit</p>
                        <p>R$ 32,90</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Malhas NewForm</p>
                        <p>R$ 479,52</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Conta energia</p>
                        <p>R$ 60,00</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Internet/Telefone</p>
                        <p>R$ 200,00</p>
                        <p>10 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Parcela DAS</p>
                        <p>R$ 353,97</p>
                        <p>29 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Salário Alane</p>
                        <p>R$ 500,00</p>
                        <p>29 de agosto</p>
                    </div>

                </div>
            </div>
        </div>
      </div>

     </section>
  );
}

export default Invoices;