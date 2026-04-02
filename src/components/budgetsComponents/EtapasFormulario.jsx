import React from "react";
import "../styles/budgetsStyles/EtapasFormulario.css";

const EtapasFormulario = ({
  modulos = [],
  etapaAtual = 0,
  formData = {},
  setFormData,
  patients = [],
  patientsLoading = false,
}) => {
  const moduloAtual = modulos[etapaAtual];

  // 🔧 helper para atualizar campos profundos
  const updateField = (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let ref = newData;

      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        ref[key] = { ...ref[key] };
        ref = ref[key];
      }

      ref[path[path.length - 1]] = value;
      return newData;
    });
  };

  // 🔧 pegar nome paciente
  const getPatientName = () => {
    if (formData.patient?.mode === "linked") {
      const found = patients.find(
        (p) => String(p.id) === String(formData.patient.patient_id)
      );
      return found?.nome || "";
    }

    if (formData.patient?.mode === "manual") {
      return formData.patient.manual?.nome || "";
    }

    return "";
  };

  // ================================
  // 📌 MÓDULO: DADOS INICIAIS
  // ================================
  const renderDados = () => {
    const dados = formData?.dados || {};
    const patient = formData?.patient || {};

    return (
      <div className="etapasForm__section">
        <h3>Dados iniciais</h3>

        <div className="etapasForm__grid">
          <select
            value={patient.mode || "linked"}
            onChange={(e) =>
              updateField(["patient", "mode"], e.target.value)
            }
          >
            <option value="linked">Paciente existente</option>
            <option value="manual">Paciente manual</option>
          </select>

          {patient.mode === "linked" ? (
            <select
              value={patient.patient_id || ""}
              onChange={(e) =>
                updateField(["patient", "patient_id"], e.target.value)
              }
            >
              <option value="">
                {patientsLoading ? "Carregando..." : "Selecione"}
              </option>

              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Nome do paciente"
              value={patient.manual?.nome || ""}
              onChange={(e) =>
                updateField(["patient", "manual", "nome"], e.target.value)
              }
            />
          )}

          <input
            type="date"
            value={dados.data_consulta || ""}
            onChange={(e) =>
              updateField(["dados", "data_consulta"], e.target.value)
            }
          />

          <input
            type="date"
            value={dados.previsao_cirurgia || ""}
            onChange={(e) =>
              updateField(["dados", "previsao_cirurgia"], e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Tipo de cirurgia"
            value={dados.cirurgia || ""}
            onChange={(e) =>
              updateField(["dados", "cirurgia"], e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Tempo de sala"
            value={dados.tempo_sala || ""}
            onChange={(e) =>
              updateField(["dados", "tempo_sala"], e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Tipo de anestesia"
            value={dados.tipo_anestesia || ""}
            onChange={(e) =>
              updateField(["dados", "tipo_anestesia"], e.target.value)
            }
          />
        </div>

        <div className="etapasForm__info">
          <strong>Paciente:</strong> {getPatientName() || "Não informado"}
        </div>
      </div>
    );
  };
    // ================================
  // 🔧 HELPERS DOS MÓDULOS
  // ================================
  const orcamentoItems = [
    { key: "cirurgiao_plastico", label: "Cirurgião Plástico" },
    { key: "cirurgiao_auxiliar", label: "Cirurgião Auxiliar" },
    { key: "instrumentadora", label: "Instrumentadora" },
    { key: "protese", label: "Prótese" },
    { key: "laser", label: "Laser" },
    { key: "retraction", label: "Retraction" },
    { key: "microair", label: "MicroAir" },
  ];

  const kitItems = [
    { key: "cinta", label: "Cinta cirúrgica" },
    { key: "sutia", label: "Sutiã cirúrgico" },
    { key: "placas", label: "Placas" },
    { key: "meia", label: "Meia anti-trombo" },
    { key: "manta", label: "Manta térmica" },
    { key: "sequel", label: "Sequel (bota pneumática)" },
    { key: "taping", label: "Taping" },
  ];

  const ensureNestedObject = (obj, path) => {
    const newObj = { ...(obj || {}) };
    let ref = newObj;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      ref[key] = { ...(ref[key] || {}) };
      ref = ref[key];
    }

    return newObj;
  };

  // ================================
  // 💰 MÓDULO: ORÇAMENTO
  // ================================
  const renderOrcamento = () => {
    const orcamento = ensureNestedObject(formData, ["orcamento", "items"]).orcamento.items;

    return (
      <div className="etapasForm__section">
        <h3>Orçamento</h3>

        <div className="etapasForm__stack">
          {orcamentoItems.map((item) => {
            const current = orcamento[item.key] || {};

            return (
              <div className="etapasForm__card" key={item.key}>
                <div className="etapasForm__row etapasForm__row--between">
                  <label className="etapasForm__checkbox">
                    <input
                      type="checkbox"
                      checked={current.enabled || false}
                      onChange={(e) =>
                        updateField(
                          ["orcamento", "items", item.key, "enabled"],
                          e.target.checked
                        )
                      }
                    />
                    {item.label}
                  </label>

                  <span className="etapasForm__tag">
                    {current.enabled ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {current.enabled && (
                  <div className="etapasForm__grid">
                    <input
                      type="number"
                      placeholder="Valor"
                      value={current.valor_cents || ""}
                      onChange={(e) =>
                        updateField(
                          ["orcamento", "items", item.key, "valor_cents"],
                          Number(e.target.value)
                        )
                      }
                    />

                    <select
                      value={current.pago_por || "paciente"}
                      onChange={(e) =>
                        updateField(
                          ["orcamento", "items", item.key, "pago_por"],
                          e.target.value
                        )
                      }
                    >
                      <option value="paciente">Pago pela paciente</option>
                      <option value="consultorio">Pago pelo consultório</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ================================
  // 🎁 MÓDULO: KIT E BRINDES
  // ================================
  const renderKit = () => {
    const kit = ensureNestedObject(formData, ["kit", "items"]).kit.items;

    return (
      <div className="etapasForm__section">
        <h3>Kit e brindes</h3>

        <div className="etapasForm__stack">
          {kitItems.map((item) => {
            const current = kit[item.key] || {};

            return (
              <div className="etapasForm__card" key={item.key}>
                <div className="etapasForm__row etapasForm__row--between">
                  <label className="etapasForm__checkbox">
                    <input
                      type="checkbox"
                      checked={current.enabled || false}
                      onChange={(e) =>
                        updateField(["kit", "items", item.key, "enabled"], e.target.checked)
                      }
                    />
                    {item.label}
                  </label>

                  <span className="etapasForm__tag">
                    {current.enabled ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {current.enabled && (
                  <div className="etapasForm__grid">
                    <select
                      value={current.tipo || "brinde"}
                      onChange={(e) =>
                        updateField(["kit", "items", item.key, "tipo"], e.target.value)
                      }
                    >
                      <option value="brinde">Brinde / incluso</option>
                      <option value="aparte">Cobrado à parte</option>
                    </select>

                    {current.tipo === "aparte" ? (
                      <input
                        type="number"
                        placeholder="Valor"
                        value={current.valor_cents || ""}
                        onChange={(e) =>
                          updateField(
                            ["kit", "items", item.key, "valor_cents"],
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        value="Incluso"
                        disabled
                        readOnly
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ================================
  // 🏥 MÓDULO: HOSPITAL
  // ================================
  const renderHospital = () => {
    const hospital = formData?.hospital || {};
    const hospitalPrincipal = hospital.hospital || {};
    const hospitalOpcao2 = hospital.hospital_opcao2 || {};
    const pagamento = hospital.pagamento || {};

    return (
      <div className="etapasForm__section">
        <h3>Hospital</h3>

        <div className="etapasForm__stack">
          <div className="etapasForm__card">
            <h4 className="etapasForm__subtitle">Hospital principal</h4>

            <div className="etapasForm__grid">
              <input
                type="text"
                placeholder="Nome do hospital"
                value={hospitalPrincipal.nome || ""}
                onChange={(e) =>
                  updateField(["hospital", "hospital", "nome"], e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Valor"
                value={hospitalPrincipal.valor_cents || ""}
                onChange={(e) =>
                  updateField(
                    ["hospital", "hospital", "valor_cents"],
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="etapasForm__card">
            <div className="etapasForm__row etapasForm__row--between">
              <label className="etapasForm__checkbox">
                <input
                  type="checkbox"
                  checked={hospitalOpcao2.enabled || false}
                  onChange={(e) =>
                    updateField(
                      ["hospital", "hospital_opcao2", "enabled"],
                      e.target.checked
                    )
                  }
                />
                Adicionar segunda opção
              </label>

              <span className="etapasForm__tag">
                {hospitalOpcao2.enabled ? "Ativo" : "Inativo"}
              </span>
            </div>

            {hospitalOpcao2.enabled && (
              <div className="etapasForm__grid">
                <input
                  type="text"
                  placeholder="Nome do hospital"
                  value={hospitalOpcao2.nome || ""}
                  onChange={(e) =>
                    updateField(["hospital", "hospital_opcao2", "nome"], e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Valor"
                  value={hospitalOpcao2.valor_cents || ""}
                  onChange={(e) =>
                    updateField(
                      ["hospital", "hospital_opcao2", "valor_cents"],
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            )}
          </div>

          <div className="etapasForm__card">
            <h4 className="etapasForm__subtitle">Pagamento hospitalar</h4>

            <div className="etapasForm__grid">
              <select
                value={pagamento.fluxo || "direto_hospital"}
                onChange={(e) =>
                  updateField(["hospital", "pagamento", "fluxo"], e.target.value)
                }
              >
                <option value="direto_hospital">Direto no hospital</option>
                <option value="pago_consultorio">Pago no consultório</option>
              </select>

              <input
                type="text"
                placeholder="Observação"
                value={pagamento.observacao || ""}
                onChange={(e) =>
                  updateField(["hospital", "pagamento", "observacao"], e.target.value)
                }
              />
            </div>

            <textarea
              placeholder="Texto de validade / observação hospitalar"
              value={hospital.validade_texto || ""}
              onChange={(e) =>
                updateField(["hospital", "validade_texto"], e.target.value)
              }
            />
          </div>
        </div>
      </div>
    );
  };
    // ================================
  // 👨‍⚕️ MÓDULO: EQUIPE CIRÚRGICA
  // ================================
  const renderEquipe = () => {
    const equipe = formData?.equipe || {};
    const grupos = [
      { key: "anestesista", title: "Anestesista" },
      { key: "instrumentadora", title: "Instrumentadora" },
      { key: "medico_auxiliar", title: "Médico Auxiliar" },
    ];

    const updateProfissional = (grupoKey, index, field, value) => {
      const profissionais = [...(equipe?.[grupoKey]?.profissionais || [])];
      profissionais[index] = {
        ...(profissionais[index] || {}),
        [field]: value,
      };

      updateField(["equipe", grupoKey, "profissionais"], profissionais);
    };

    const addProfissional = (grupoKey) => {
      const profissionais = [...(equipe?.[grupoKey]?.profissionais || [])];
      profissionais.push({
        nome: "",
        tipo: "equipe_hospital",
        cobranca: "incluso_hospital",
        valor_cents: 0,
      });

      updateField(["equipe", grupoKey, "profissionais"], profissionais);
      updateField(["equipe", grupoKey, "enabled"], true);
    };

    const removeProfissional = (grupoKey, index) => {
      const profissionais = [...(equipe?.[grupoKey]?.profissionais || [])];
      profissionais.splice(index, 1);

      updateField(["equipe", grupoKey, "profissionais"], profissionais);
    };

    return (
      <div className="etapasForm__section">
        <h3>Equipe cirúrgica</h3>

        <div className="etapasForm__stack">
          {grupos.map((grupo) => {
            const grupoAtual = equipe?.[grupo.key] || {};
            const profissionais = grupoAtual.profissionais || [];

            return (
              <div className="etapasForm__card" key={grupo.key}>
                <div className="etapasForm__row etapasForm__row--between">
                  <label className="etapasForm__checkbox">
                    <input
                      type="checkbox"
                      checked={grupoAtual.enabled || false}
                      onChange={(e) =>
                        updateField(["equipe", grupo.key, "enabled"], e.target.checked)
                      }
                    />
                    {grupo.title}
                  </label>

                  <span className="etapasForm__tag">
                    {grupoAtual.enabled ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {grupoAtual.enabled && (
                  <div className="etapasForm__stack">
                    {profissionais.map((profissional, index) => (
                      <div className="etapasForm__subcard" key={`${grupo.key}-${index}`}>
                        <div className="etapasForm__grid">
                          <input
                            type="text"
                            placeholder="Nome"
                            value={profissional.nome || ""}
                            onChange={(e) =>
                              updateProfissional(grupo.key, index, "nome", e.target.value)
                            }
                          />

                          <select
                            value={profissional.tipo || "equipe_hospital"}
                            onChange={(e) =>
                              updateProfissional(grupo.key, index, "tipo", e.target.value)
                            }
                          >
                            <option value="equipe_hospital">Equipe do hospital</option>
                            <option value="particular">Particular</option>
                          </select>

                          <select
                            value={profissional.cobranca || "incluso_hospital"}
                            onChange={(e) =>
                              updateProfissional(grupo.key, index, "cobranca", e.target.value)
                            }
                          >
                            <option value="incluso_hospital">Incluso no hospital</option>
                            <option value="valor_separado">Valor separado</option>
                          </select>

                          <input
                            type="number"
                            placeholder="Valor"
                            disabled={profissional.cobranca !== "valor_separado"}
                            value={
                              profissional.cobranca === "valor_separado"
                                ? profissional.valor_cents || ""
                                : ""
                            }
                            onChange={(e) =>
                              updateProfissional(
                                grupo.key,
                                index,
                                "valor_cents",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="etapasForm__actions">
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() => removeProfissional(grupo.key, index)}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="etapasForm__actions">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => addProfissional(grupo.key)}
                      >
                        Adicionar {grupo.title.toLowerCase()}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ================================
  // 🩺 MÓDULO: KIT CIRÚRGICO E MALHAS
  // ================================
  const renderKitMalhas = () => {
    const kitMalhas = formData?.kitMalhas || {};
    const kitCirurgico = kitMalhas.kit_cirurgico || {};
    const malhas = kitMalhas.malhas || {};

    const renderBloco = (pathKey, title, data) => (
      <div className="etapasForm__card">
        <div className="etapasForm__row etapasForm__row--between">
          <label className="etapasForm__checkbox">
            <input
              type="checkbox"
              checked={data.enabled || false}
              onChange={(e) =>
                updateField(["kitMalhas", pathKey, "enabled"], e.target.checked)
              }
            />
            {title}
          </label>

          <span className="etapasForm__tag">{data.enabled ? "Ativo" : "Inativo"}</span>
        </div>

        {data.enabled && (
          <div className="etapasForm__grid">
            <input
              type="text"
              placeholder="Descrição"
              value={data.descricao || ""}
              onChange={(e) =>
                updateField(["kitMalhas", pathKey, "descricao"], e.target.value)
              }
            />

            <input
              type="number"
              placeholder="Valor"
              value={data.valor_cents || ""}
              onChange={(e) =>
                updateField(
                  ["kitMalhas", pathKey, "valor_cents"],
                  Number(e.target.value)
                )
              }
            />
          </div>
        )}
      </div>
    );

    return (
      <div className="etapasForm__section">
        <h3>Kit cirúrgico e malhas</h3>

        <div className="etapasForm__stack">
          {renderBloco("kit_cirurgico", "Kit cirúrgico", kitCirurgico)}
          {renderBloco("malhas", "Malhas", malhas)}
        </div>
      </div>
    );
  };

  // ================================
  // 💆 MÓDULO: DRENAGENS
  // ================================
  const renderDrenagens = () => {
    const drenagens = formData?.drenagens || {};

    return (
      <div className="etapasForm__section">
        <h3>Drenagens</h3>

        <div className="etapasForm__card">
          <div className="etapasForm__row etapasForm__row--between">
            <label className="etapasForm__checkbox">
              <input
                type="checkbox"
                checked={drenagens.enabled || false}
                onChange={(e) =>
                  updateField(["drenagens", "enabled"], e.target.checked)
                }
              />
              Incluir drenagens
            </label>

            <span className="etapasForm__tag">
              {drenagens.enabled ? "Ativo" : "Inativo"}
            </span>
          </div>

          {drenagens.enabled && (
            <div className="etapasForm__grid">
              <input
                type="number"
                placeholder="Quantidade"
                value={drenagens.quantidade || ""}
                onChange={(e) =>
                  updateField(["drenagens", "quantidade"], Number(e.target.value))
                }
              />

              <input
                type="number"
                placeholder="Valor total"
                value={drenagens.valor_cents || ""}
                onChange={(e) =>
                  updateField(["drenagens", "valor_cents"], Number(e.target.value))
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // ================================
  // 📊 MÓDULO: RESUMO FINANCEIRO
  // ================================
  const renderResumo = () => {
    const resumo = formData?.resumoFinanceiro || {};

    return (
      <div className="etapasForm__section">
        <h3>Resumo financeiro</h3>

        <div className="etapasForm__grid">
          <input type="text" value={`Honorário: ${resumo.honorario || 0}`} disabled readOnly />
          <input
            type="text"
            value={`Médico auxiliar: ${resumo.medicoAuxiliar || 0}`}
            disabled
            readOnly
          />
          <input type="text" value={`Hospital: ${resumo.hospital || 0}`} disabled readOnly />
          <input
            type="text"
            value={`Anestesista: ${resumo.anestesista || 0}`}
            disabled
            readOnly
          />
          <input type="text" value={`Aparelhos: ${resumo.aparelhos || 0}`} disabled readOnly />
          <input type="text" value={`Prótese: ${resumo.protese || 0}`} disabled readOnly />
          <input
            type="text"
            value={`Instrumentadora: ${resumo.instrumentadora || 0}`}
            disabled
            readOnly
          />
          <input
            type="text"
            value={`Kit cirúrgico: ${resumo.kitCirurgico || 0}`}
            disabled
            readOnly
          />
          <input type="text" value={`Malhas: ${resumo.malhas || 0}`} disabled readOnly />
          <input
            type="text"
            value={`Drenagens: ${resumo.drenagens || 0}`}
            disabled
            readOnly
          />
          <input
            type="text"
            value={`Total: ${resumo.total || 0}`}
            disabled
            readOnly
          />
        </div>
      </div>
    );
  };

  // ================================
  // 💳 MÓDULO: FORMA DE PAGAMENTO
  // ================================
  const renderPagamento = () => {
    const pagamento = formData?.pagamento || {};

    return (
      <div className="etapasForm__section">
        <h3>Forma de pagamento</h3>

        <div className="etapasForm__grid">
          <select
            value={pagamento.tipo || "pix"}
            onChange={(e) => updateField(["pagamento", "tipo"], e.target.value)}
          >
            <option value="pix">PIX</option>
            <option value="cartao">Cartão</option>
            <option value="boleto">Boleto</option>
            <option value="transferencia">Transferência</option>
          </select>

          <input
            type="number"
            placeholder="Entrada"
            value={pagamento.entrada_cents || ""}
            onChange={(e) =>
              updateField(["pagamento", "entrada_cents"], Number(e.target.value))
            }
          />

          <input
            type="number"
            placeholder="Parcelas"
            value={pagamento.parcelas || ""}
            onChange={(e) =>
              updateField(["pagamento", "parcelas"], Number(e.target.value))
            }
          />

          <input
            type="number"
            placeholder="Valor da parcela"
            value={pagamento.valor_parcela_cents || ""}
            onChange={(e) =>
              updateField(
                ["pagamento", "valor_parcela_cents"],
                Number(e.target.value)
              )
            }
          />

          <input
            type="date"
            value={pagamento.vencimento_primeira || ""}
            onChange={(e) =>
              updateField(["pagamento", "vencimento_primeira"], e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Validade em dias"
            value={pagamento.validade_dias || ""}
            onChange={(e) =>
              updateField(["pagamento", "validade_dias"], Number(e.target.value))
            }
          />

          <input
            type="date"
            value={pagamento.data_validade || ""}
            onChange={(e) =>
              updateField(["pagamento", "data_validade"], e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Consultora"
            value={pagamento.consultora || ""}
            onChange={(e) =>
              updateField(["pagamento", "consultora"], e.target.value)
            }
          />
        </div>

        <textarea
          placeholder="Observações"
          value={pagamento.observacoes || ""}
          onChange={(e) =>
            updateField(["pagamento", "observacoes"], e.target.value)
          }
        />
      </div>
    );
  };

  // ================================
  // 🔀 RENDER POR ETAPA
  // ================================
  const renderEtapa = () => {
    switch (moduloAtual) {
      case "dados":
        return renderDados();
      case "orcamento":
        return renderOrcamento();
      case "kit":
        return renderKit();
      case "hospital":
        return renderHospital();
      case "equipe":
        return renderEquipe();
      case "kit_malhas":
        return renderKitMalhas();
      case "drenagens":
        return renderDrenagens();
      case "resumo":
        return renderResumo();
      case "pagamento":
        return renderPagamento();
      default:
        return (
          <div className="etapasForm__section">
            <h3>Módulo em construção</h3>
            <p>Esse módulo ainda não foi implementado.</p>
          </div>
        );
    }
  };

  return <div className="etapasForm">{renderEtapa()}</div>;
};

export default EtapasFormulario;