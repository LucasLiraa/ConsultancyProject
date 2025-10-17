import React from "react";
import "./styles/invoices.css";
import Topbar from "../components/topbar";

function Invoices() {

  return (
    <section className="sectionContracts">
      <Topbar showSearch={false} />

      <div className="containerInvoices">
        <div className="contentInvoices">
          <h4>Total disponivel</h4>
        </div>
      </div>

     </section>
  );
}

export default Invoices;