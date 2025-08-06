export const buscarAcompanhamentos = () => {
  const data = localStorage.getItem("acompanhamentos");
  return data ? JSON.parse(data) : [];
};

export const salvarAcompanhamento = (acompanhamento) => {
  const acompanhamentos = buscarAcompanhamentos();
  acompanhamentos.push(acompanhamento);
  localStorage.setItem("acompanhamentos", JSON.stringify(acompanhamentos));
};