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
                        <p>R$ 40.000,00</p>
                        <div className="divisor"></div>
                        <h4>Saídas deste mês:</h4>
                        <p>R$ 20.000,00</p>
                    </div>
                </div>
                <div className="contentInvoiceBalanceDown">
                    <div className="contentInvoiceBalanceDownHeader">
                        <h4>Descrição</h4>
                        <h4>Valor (R$)</h4>
                        <h4>Forma de pagamento</h4>
                        <h4>Data</h4>
                        <h4>Comprovante</h4>
                    </div>
                    
                    
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                    <div className="contentInvoiceBalanceDownCelis">
                        <p>Fabina Silva</p>
                        <p>R$ 12.000,00</p>
                        <p>Pix</p>
                        <p>01 de Agosto de 2025</p>
                        <p>comprovante</p>
                    </div>
                </div>
            </div>
            <div className="contentInvoiceBalanceDir">
                <div className="contentInvoceBalancePositive">
                    <h4>Entradas futuras</h4>
                    <h1>R$ 42.000,00</h1>

                    <div className="contentInvoceBalanceList">
                        <h4>Descrição</h4>
                        <h4>Valor</h4>
                        <h4>Data</h4>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Juliana Nascimento</p>
                        <p>R$ 12.000,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Juliana Nascimento</p>
                        <p>R$ 12.000,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Juliana Nascimento</p>
                        <p>R$ 12.000,00</p>
                        <p>15 de agosto</p>
                    </div>
                </div>
                <div className="contentInvoceBalanceNegative">
                    <h4>Saídas futuras</h4>
                    <h1>R$ 12.000,00</h1>

                    <div className="contentInvoceBalanceList">
                        <h4>Descrição</h4>
                        <h4>Valor</h4>
                        <h4>Data</h4>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Aluguel Consultorio</p>
                        <p>R$ 4.000,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Aluguel Consultorio</p>
                        <p>R$ 4.000,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Aluguel Consultorio</p>
                        <p>R$ 4.000,00</p>
                        <p>15 de agosto</p>
                    </div>
                    <div className="contentInvoceBalanceCelis">
                        <p>Aluguel Consultorio</p>
                        <p>R$ 4.000,00</p>
                        <p>15 de agosto</p>
                    </div>

                </div>
            </div>
        </div>
      </div>

     </section>
  );
}

export default Invoices;