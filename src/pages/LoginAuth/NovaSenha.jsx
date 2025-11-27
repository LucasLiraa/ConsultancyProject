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

  // 👇 modo recuperação (quando veio do link do e-mail)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    // Supabase adiciona algo como: #access_token=...&type=recovery
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery")) {
      setIsRecoveryMode(true);
    }
  }, []);

  // Enviar e-mail de recuperação
  const handleReset = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

  // Definir nova senha após clicar no link
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
        {/* COLUNA ESQUERDA - IMAGEM */}
        <div className="reset-left">
          <img src="/loginImage.jpg" alt="Fundo" />
        </div>

        {/* COLUNA DIREITA - CONTEÚDO */}
        <div className="reset-right">
          <div className="resetHeader">
            {isRecoveryMode ? (
              <>
                <h1>Definir nova senha</h1>
                <p>Crie uma nova senha para acessar sua conta.</p>
              </>
            ) : (
              <>
                <h1>Esqueceu sua senha?</h1>
                <p>Digite seu e-mail para enviarmos um link de recuperação.</p>
              </>
            )}

            {mensagem && <div className="reset-success">{mensagem}</div>}
            {erro && <div className="reset-error">{erro}</div>}
          </div>

          {isRecoveryMode ? (
            // FORM DE NOVA SENHA (primeiro acesso / link)
            <form onSubmit={handleChangePassword}>
              <div className="reset-input-wrapper">
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>

              <div className="reset-input-wrapper">
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="reset-btn"
              >
                {loading ? "Atualizando..." : "Salvar nova senha"}
              </button>
            </form>
          ) : (
            // FORM DE PEDIR O E-MAIL
            <form onSubmit={handleReset}>
              <div className="reset-input-wrapper">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="reset-btn"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}

          <div className="resetFooter">
            <Link to="/login" className="back-to-login">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaSenha;