import React, { useState } from 'react';
import './styles/budgets.css'

import Topbar from '../components/topbar';
import SelecaoModulos from '../components/budgetsComponents/SelecaoModulos';
import EtapasFormulario from '../components/budgetsComponents/EtapasFormulario';

import PrevisualizacaoOrcamento from '../components/budgetsComponents/PrevisualizacaoOrcamento';

const OrcamentoBuilder = () => {
  const [modulosSelecionados, setModulosSelecionados] = useState([]);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [formData, setFormData] = useState({});
  const [mostrarResumo, setMostrarResumo] = useState(false);

  const avancar = () => {
    if (etapaAtual < modulosSelecionados.length - 1) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const voltar = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const handleGerarOrcamento = () => {
    setMostrarResumo(true);
  };

  const handleEditar = () => {
    setMostrarResumo(false);
  };

  return (
    <section className="sectionPatients">

      <div className="orcamentoBuilderContainer">
        <div className="orcamentoSidebar">
          <SelecaoModulos
            modulosSelecionados={modulosSelecionados}
            setModulosSelecionados={(mods) => {
              setEtapaAtual(0);
              setFormData({});
              setMostrarResumo(false);
              setModulosSelecionados(mods);
            }}
          />
        </div>

        <div className="orcamentoMainContent">
          {modulosSelecionados.length === 0 && (
            <p style={{ padding: '20px 0 20px 0' }}>Selecione os módulos para iniciar o orçamento.</p>
          )}

          {mostrarResumo ? (
            <PrevisualizacaoOrcamento
              formData={formData}
              modulosSelecionados={modulosSelecionados}
              onVoltar={handleEditar}
            />
          ) : (
            <>
              <EtapasFormulario
                modulos={modulosSelecionados}
                etapaAtual={etapaAtual}
                formData={formData}
                setFormData={setFormData}
              />

              <div className="botoesNavegacao">
                <button onClick={voltar} disabled={etapaAtual === 0}>Voltar</button>
                {etapaAtual < modulosSelecionados.length - 1 ? (
                  <button onClick={avancar}>Próximo</button>
                ) : (
                  <button onClick={handleGerarOrcamento}>Gerar Orçamento</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrcamentoBuilder;