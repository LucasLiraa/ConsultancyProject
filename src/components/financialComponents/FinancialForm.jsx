import React from "react";

const FinancialForm = ({
  tipoRegistro,
  subtipo,
  formData,
  setFormData,
  pagamentoExtra,
  setPagamentoExtra,
  multiFormaPagamento,
  setMultiFormaPagamento,
  formData2,
  setFormData2,
  outrosPagosAtConsultorio,
  setOutrosPagosAtConsultorio,
  repasseTipo,
  setRepasseTipo,
  repHospital,
  setRepHospital,
  repEquipeChecks,
  setRepEquipeChecks,
  repEquipe,
  setRepEquipe,
  repEquip,
  setRepEquip,
  repOutros,
  setRepOutros,
  saidaSubtipoCir,
  setSaidaSubtipoCir,
  gastosCirurgicos,
  setGastosCirurgicos,
  profPagamentos,
  setProfPagamentos,
  formatCurrencyInput,
}) => {
  return (
    <>
      {/* -------- ENTRADA: PAGAMENTO DA PACIENTE -------- */}
      {tipoRegistro === "Entrada" && subtipo === "Pagamento da Paciente" && (
        <>
          <label>Nome do paciente</label>
          <input
            type="text"
            value={formData.nome_paciente}
            onChange={(e) =>
              setFormData({
                ...formData,
                nome_paciente: e.target.value,
              })
            }
            required
          />

          <label>Procedimento</label>
          <input
            type="text"
            value={formData.procedimento}
            onChange={(e) =>
              setFormData({
                ...formData,
                procedimento: e.target.value,
              })
            }
            required
          />

          <label>Data da cirurgia</label>
          <input
            type="date"
            value={formData.data_cirurgia}
            onChange={(e) =>
              setFormData({
                ...formData,
                data_cirurgia: e.target.value,
              })
            }
            required
          />

          <label>Valor total honorário (R$)</label>
          <input
            type="text"
            value={formData.valor_honorario}
            onChange={(e) =>
              setFormData({
                ...formData,
                valor_honorario: formatCurrencyInput(e.target.value),
              })
            }
            required
          />

          {/* Pagamento #1 */}
          <div className="input-group">
            <label>Valor recebido (R$) — pagamento #1</label>
            <input
              type="text"
              value={formData.valor_recebido}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valor_recebido: formatCurrencyInput(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="input-group">
            <label>Data do pagamento — pagamento #1</label>
            <input
              type="date"
              value={formData.data_pagamento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data_pagamento: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Forma de pagamento */}
          <label>Forma de pagamento</label>
          <select
            value={formData.forma_pagamento}
            onChange={(e) => {
              const v = e.target.value;
              setFormData({
                ...formData,
                forma_pagamento: v,
              });
              setMultiFormaPagamento(v === "Mais de uma forma");
            }}
          >
            <option value="">Selecione...</option>
            <option>Pix</option>
            <option>Boleto</option>
            <option>Cartão de crédito</option>
            <option>Cartão de débito</option>
            <option>Dinheiro</option>
            <option value="Mais de uma forma">Mais de uma forma de pagamento</option>
          </select>

          {multiFormaPagamento && (
            <>
              <label>Descreva as formas</label>
              <input
                type="text"
                placeholder="Ex.: parte Pix + parte cartão"
                value={formData.multi_pag_texto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    multi_pag_texto: e.target.value,
                  })
                }
              />
            </>
          )}

          {/* Segundo pagamento opcional */}
          <label>Deseja adicionar mais uma data de pagamento?</label>
          <select
            value={pagamentoExtra ? "sim" : "nao"}
            onChange={(e) => setPagamentoExtra(e.target.value === "sim")}
          >
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>

          {pagamentoExtra && (
            <div className="opcional">
              <div className="opcional-bloco">
                <div>
                  <label>Valor recebido (R$) — pagamento #2</label>
                  <input
                    type="number"
                    value={formData2.valor_recebido}
                    onChange={(e) =>
                      setFormData2({
                        ...formData2,
                        valor_recebido: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Data do pagamento — pagamento #2</label>
                  <input
                    type="date"
                    value={formData2.data_pagamento}
                    onChange={(e) =>
                      setFormData2({
                        ...formData2,
                        data_pagamento: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>É um pagamento agendado?</label>
                  <select
                    value={formData2.agendado ? "sim" : "nao"}
                    onChange={(e) =>
                      setFormData2({
                        ...formData2,
                        agendado: e.target.value === "sim",
                      })
                    }
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Outros valores pagos ao consultório → rebatem em Saída */}
          <label>Outros valores pagos ao consultório?</label>
          <select
            value={outrosPagosAtConsultorio ? "sim" : "nao"}
            onChange={(e) =>
              setOutrosPagosAtConsultorio(e.target.value === "sim")
            }
          >
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>

          {outrosPagosAtConsultorio && (
            <>
              <label>Selecione o tipo</label>
              <select
                value={repasseTipo}
                onChange={(e) => setRepasseTipo(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option>Hospital</option>
                <option>Equipe cirúrgica</option>
                <option>Equipamento cirúrgico</option>
                <option>Outros</option>
              </select>

              {/* Hospital */}
              {repasseTipo === "Hospital" && (
                <div className="opcional">
                  <label>Hospital selecionado</label>
                  <input
                    type="text"
                    value={repHospital.hospital}
                    onChange={(e) =>
                      setRepHospital({
                        ...repHospital,
                        hospital: e.target.value,
                      })
                    }
                  />
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={repHospital.valor}
                    onChange={(e) =>
                      setRepHospital({
                        ...repHospital,
                        valor: e.target.value,
                      })
                    }
                  />
                  <label>Data do pagamento ao consultório</label>
                  <input
                    type="date"
                    value={repHospital.data}
                    onChange={(e) =>
                      setRepHospital({
                        ...repHospital,
                        data: e.target.value,
                      })
                    }
                  />
                  <label>Repassar para saída?</label>
                  <select
                    value={repHospital.repassarSaida ? "sim" : "nao"}
                    onChange={(e) =>
                      setRepHospital({
                        ...repHospital,
                        repassarSaida: e.target.value === "sim",
                      })
                    }
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
              )}

              {/* Equipe cirúrgica */}
              {repasseTipo === "Equipe cirúrgica" && (
                <div className="opcional">
                  <div
                    className="opcional-bloco"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    {Object.keys(repEquipeChecks).map((fn) => (
                      <label
                        key={fn}
                        style={{ display: "flex", gap: 8, alignItems: "center" }}
                      >
                        <input
                          type="checkbox"
                          checked={repEquipeChecks[fn]}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setRepEquipeChecks({
                              ...repEquipeChecks,
                              [fn]: checked,
                            });
                            if (checked) {
                              setRepEquipe((prev) => [
                                ...prev,
                                {
                                  funcao: fn,
                                  nome: "",
                                  valor: "",
                                  data: "",
                                  repassarSaida: true,
                                },
                              ]);
                            } else {
                              setRepEquipe((prev) =>
                                prev.filter((p) => p.funcao !== fn)
                              );
                            }
                          }}
                        />
                        {fn}
                      </label>
                    ))}
                  </div>

                  {repEquipe.map((p, idx) => (
                    <div key={idx} className="opcional" style={{ marginTop: 8 }}>
                      <strong>{p.funcao}</strong>
                      <label>Nome do profissional</label>
                      <input
                        type="text"
                        value={p.nome}
                        onChange={(e) => {
                          const v = [...repEquipe];
                          v[idx].nome = e.target.value;
                          setRepEquipe(v);
                        }}
                      />
                      <label>Valor (R$)</label>
                      <input
                        type="number"
                        value={p.valor}
                        onChange={(e) => {
                          const v = [...repEquipe];
                          v[idx].valor = e.target.value;
                          setRepEquipe(v);
                        }}
                      />
                      <label>Data do pagamento ao consultório</label>
                      <input
                        type="date"
                        value={p.data}
                        onChange={(e) => {
                          const v = [...repEquipe];
                          v[idx].data = e.target.value;
                          setRepEquipe(v);
                        }}
                      />
                      <label>Repassar para saída?</label>
                      <select
                        value={p.repassarSaida ? "sim" : "nao"}
                        onChange={(e) => {
                          const v = [...repEquipe];
                          v[idx].repassarSaida = e.target.value === "sim";
                          setRepEquipe(v);
                        }}
                      >
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Equipamento */}
              {repasseTipo === "Equipamento cirúrgico" && (
                <div className="opcional">
                  <label>Equipamento utilizado</label>
                  <input
                    type="text"
                    value={repEquip.equipamento}
                    onChange={(e) =>
                      setRepEquip({
                        ...repEquip,
                        equipamento: e.target.value,
                      })
                    }
                  />
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={repEquip.valor}
                    onChange={(e) =>
                      setRepEquip({
                        ...repEquip,
                        valor: e.target.value,
                      })
                    }
                  />
                  <label>Data do pagamento ao consultório</label>
                  <input
                    type="date"
                    value={repEquip.data}
                    onChange={(e) =>
                      setRepEquip({
                        ...repEquip,
                        data: e.target.value,
                      })
                    }
                  />
                  <label>Repassar para saída?</label>
                  <select
                    value={repEquip.repassarSaida ? "sim" : "nao"}
                    onChange={(e) =>
                      setRepEquip({
                        ...repEquip,
                        repassarSaida: e.target.value === "sim",
                      })
                    }
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
              )}

              {/* Outros */}
              {repasseTipo === "Outros" && (
                <div className="opcional">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={repOutros.descricao}
                    onChange={(e) =>
                      setRepOutros({
                        ...repOutros,
                        descricao: e.target.value,
                      })
                    }
                  />
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    value={repOutros.valor}
                    onChange={(e) =>
                      setRepOutros({
                        ...repOutros,
                        valor: e.target.value,
                      })
                    }
                  />
                  <label>Data do pagamento ao consultório</label>
                  <input
                    type="date"
                    value={repOutros.data}
                    onChange={(e) =>
                      setRepOutros({
                        ...repOutros,
                        data: e.target.value,
                      })
                    }
                  />
                  <label>Repassar para saída?</label>
                  <select
                    value={repOutros.repassarSaida ? "sim" : "nao"}
                    onChange={(e) =>
                      setRepOutros({
                        ...repOutros,
                        repassarSaida: e.target.value === "sim",
                      })
                    }
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
              )}
            </>
          )}

          <label>Observações</label>
          <textarea
            rows="3"
            value={formData.observacoes}
            onChange={(e) =>
              setFormData({
                ...formData,
                observacoes: e.target.value,
              })
            }
          />
        </>
      )}

      {/* -------- ENTRADA: OUTRO TIPO -------- */}
      {tipoRegistro === "Entrada" && subtipo === "Outro Tipo de Pagamento" && (
        <>
          <label>Descrição do pagamento</label>
          <input
            type="text"
            value={formData.procedimento}
            onChange={(e) =>
              setFormData({
                ...formData,
                procedimento: e.target.value,
              })
            }
          />

          <label>Valor do pagamento</label>
          <input
            type="number"
            value={formData.valor_recebido}
            onChange={(e) =>
              setFormData({
                ...formData,
                valor_recebido: e.target.value,
              })
            }
          />

          <label>Data do pagamento</label>
          <input
            type="date"
            value={formData.data_pagamento}
            onChange={(e) =>
              setFormData({
                ...formData,
                data_pagamento: e.target.value,
              })
            }
          />

          <label>Observações</label>
          <textarea
            rows="3"
            value={formData.observacoes}
            onChange={(e) =>
              setFormData({
                ...formData,
                observacoes: e.target.value,
              })
            }
          />
        </>
      )}

      {/* -------- SAÍDA: PAGAMENTO CIRÚRGICO -------- */}
      {tipoRegistro === "Saída" && subtipo === "Pagamento cirúrgico" && (
        <>
          <label>Categoria do gasto</label>
          <select
            value={saidaSubtipoCir}
            onChange={(e) => setSaidaSubtipoCir(e.target.value)}
          >
            <option value="">Selecione...</option>
            <option>Hospital</option>
            <option>Anestesista</option>
            <option>Prótese</option>
            <option>Malhas</option>
            <option>Outros gastos cirúrgicos</option>
          </select>

          <div className="opcional">
            <div
              className="opcional-bloco"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              <div>
                <label>Descrição</label>
                <input
                  type="text"
                  onChange={(e) => {
                    const base = {
                      tipo: saidaSubtipoCir || "Outros gastos cirúrgicos",
                      descricao: e.target.value,
                      valor: "",
                      data: "",
                      observacoes: "",
                    };
                    setGastosCirurgicos([base]);
                  }}
                />
              </div>
              <div>
                <label>Valor total (R$)</label>
                <input
                  type="number"
                  onChange={(e) => {
                    setGastosCirurgicos((prev) =>
                      prev.length
                        ? [
                            {
                              ...prev[0],
                              valor: e.target.value,
                            },
                          ]
                        : [
                            {
                              tipo: saidaSubtipoCir,
                              descricao: "",
                              valor: e.target.value,
                              data: "",
                              observacoes: "",
                            },
                          ]
                    );
                  }}
                />
              </div>
            </div>
            <label>Data do pagamento</label>
            <input
              type="date"
              onChange={(e) => {
                setGastosCirurgicos((prev) =>
                  prev.length
                    ? [
                        {
                          ...prev[0],
                          data: e.target.value,
                        },
                      ]
                    : [
                        {
                          tipo: saidaSubtipoCir,
                          descricao: "",
                          valor: "",
                          data: e.target.value,
                          observacoes: "",
                        },
                      ]
                );
              }}
            />
            <label>Observações</label>
            <textarea
              rows="2"
              onChange={(e) => {
                setGastosCirurgicos((prev) =>
                  prev.length
                    ? [
                        {
                          ...prev[0],
                          observacoes: e.target.value,
                        },
                      ]
                    : [
                        {
                          tipo: saidaSubtipoCir,
                          descricao: "",
                          valor: "",
                          data: "",
                          observacoes: e.target.value,
                        },
                      ]
                );
              }}
            />
          </div>
        </>
      )}

      {/* -------- SAÍDA: PROFISSIONAIS -------- */}
      {tipoRegistro === "Saída" &&
        subtipo === "Pagamento para profissionais" && (
          <>
            <div className="opcional">
              <div className="opcional-bloco">
                <div>
                  <label>Profissional</label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setProfPagamentos([
                        {
                          nome: e.target.value,
                          valor: "",
                          data: "",
                          observacoes: "",
                        },
                      ])
                    }
                  />
                </div>
                <div>
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    onChange={(e) =>
                      setProfPagamentos((prev) =>
                        prev.length
                          ? [
                              {
                                ...prev[0],
                                valor: e.target.value,
                              },
                            ]
                          : [
                              {
                                nome: "",
                                valor: e.target.value,
                                data: "",
                                observacoes: "",
                              },
                            ]
                      )
                    }
                  />
                </div>
                <div>
                  <label>Data</label>
                  <input
                    type="date"
                    onChange={(e) =>
                      setProfPagamentos((prev) =>
                        prev.length
                          ? [
                              {
                                ...prev[0],
                                data: e.target.value,
                              },
                            ]
                          : [
                              {
                                nome: "",
                                valor: "",
                                data: e.target.value,
                                observacoes: "",
                              },
                            ]
                      )
                    }
                  />
                </div>
              </div>
              <label>Observações</label>
              <textarea
                rows="2"
                onChange={(e) =>
                  setProfPagamentos((prev) =>
                    prev.length
                      ? [
                          {
                            ...prev[0],
                            observacoes: e.target.value,
                          },
                        ]
                      : [
                          {
                            nome: "",
                            valor: "",
                            data: "",
                            observacoes: e.target.value,
                          },
                        ]
                  )
                }
              />
            </div>
          </>
        )}

      {/* -------- SAÍDA: CONTAS / OUTROS -------- */}
      {tipoRegistro === "Saída" &&
        (subtipo === "Pagamento de contas" ||
          subtipo === "Outros tipos de pagamento") && (
          <>
            <label>Descrição</label>
            <input
              type="text"
              value={formData.procedimento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  procedimento: e.target.value,
                })
              }
            />
            <label>Valor (R$)</label>
            <input
              type="number"
              value={formData.valor_recebido}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valor_recebido: e.target.value,
                })
              }
            />
            <label>Data do pagamento</label>
            <input
              type="date"
              value={formData.data_pagamento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data_pagamento: e.target.value,
                })
              }
            />
            <label>Observações</label>
            <textarea
              rows="2"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observacoes: e.target.value,
                })
              }
            />
          </>
        )}
    </>
  );
};

export default FinancialForm;