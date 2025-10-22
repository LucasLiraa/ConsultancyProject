import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./NovaSenha.css";

const NovaSenha = () => {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    // Obtém o usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErro("Não foi possível identificar o usuário logado.");
      setCarregando(false);
      return;
    }

    // Atualiza a senha no Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: senha,
    });

    if (updateError) {
      setErro("Erro ao atualizar a senha. Tente novamente.");
      setCarregando(false);
      return;
    }

    // Atualiza o campo 'primeiro_login' na tabela 'usuarios'
    const { error: flagError } = await supabase
      .from("usuarios")
      .update({ primeiro_login: false })
      .eq("email", user.email);

    if (flagError) {
      setErro("Senha alterada, mas houve erro ao atualizar status de login.");
      setCarregando(false);
      return;
    }

    alert("Senha redefinida com sucesso!");
    navigate("/");
  };

  return (
    <div className="nova-senha-container">
      <form className="nova-senha-form" onSubmit={handleSubmit}>
        <h2>Defina uma nova senha</h2>
        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
        />
        <button type="submit" disabled={carregando}>
          {carregando ? "Salvando..." : "Salvar senha"}
        </button>
        {erro && <p className="erro">{erro}</p>}
      </form>
    </div>
  );
};

export default NovaSenha;