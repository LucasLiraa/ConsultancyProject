// src/pages/LoginAuth/NovaSenha.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./NovaSenha.css";

const NovaSenha = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 modo de recuperação (quando veio pelo link / já tem sessão de recovery)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    const checkRecovery = async () => {
      // Supabase normalmente manda: #access_token=...&type=recovery
      const hash = window.location.hash || "";
      const search = window.location.search || "";

      const hashParams = new URLSearchParams(
        hash.startsWith("#") ? hash.slice(1) : hash
      );
      const searchParams = new URLSearchParams(search);

      const typeFromHash = hashParams.get("type");
      const typeFromSearch = searchParams.get("type");

      if (typeFromHash === "recovery" || typeFromSearch === "recovery") {
        setIsRecoveryMode(true);
        return;
      }

      // fallback: se já existir sessão (ex.: já logado via link), também habilita troca de senha
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        setIsRecoveryMode(true);
      }
    };

    checkRecovery();
  }, []);

  // 🔹 envia o e-mail de recuperação
  const handleReset = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // importante: voltar para /nova-senha, não /login
        redirectTo: `${window.location.origin}/nova-senha`,
      });

      if (error) throw error;

      setMensagem("Enviamos um e-mail para redefinir sua senha.");
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao enviar o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 troca a senha quando entrou pelo link
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) throw error;

      setMensagem("Senha atualizada com sucesso! Você já pode fazer login.");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error(error);
      setErro(error.message || "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        {/* COLUNA ESQUERDA (pode ser imagem ou texto, como já estava no seu CSS) */}
        <div className="reset-left">
          <h1>Redefinir senha</h1>
          <p>
            {isRecoveryMode
              ? "Defina uma nova senha para acessar sua conta."
              : "Digite seu e-mail e enviaremos um link para você recuperar o acesso."}
          </p>
        </div>

        {/* COLUNA DIREITA */}
        <div className="reset-right">
          {mensagem && <div className="reset-success">{mensagem}</div>}
          {erro && <div className="reset-error">{erro}</div>}

          {isRecoveryMode ? (
            // 👉 MODO 1: veio pelo link do e-mail → trocar senha
            <form onSubmit={handleChangePassword}>
              <label>
                Nova senha
                <input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </label>

              <label>
                Confirmar nova senha
                <input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </label>

              <button type="submit" disabled={loading}>
                {loading ? "Atualizando..." : "Salvar nova senha"}
              </button>
            </form>
          ) : (
            // 👉 MODO 2: apenas esqueceu a senha → pedir e-mail
            <form onSubmit={handleReset}>
              <label>
                E-mail
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}

          <div className="reset-footer">
            <Link to="/login">Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaSenha;