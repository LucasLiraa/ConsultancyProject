// src/pages/LoginAuth/NovaSenha.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./NovaSenha.css";

const NovaSenha = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
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

  return (
    <div className="reset-page">
      <div className="reset-card">
        {/* COLUNA ESQUERDA - IMAGEM (invertido em relação ao login) */}
        <div className="reset-left">
          <img src="/loginImage.jpg" alt="Fundo" />
        </div>

        {/* COLUNA DIREITA - FORMULÁRIO */}
        <div className="reset-right">
          <div className="resetHeader">
            <h1>Esqueceu sua senha?</h1>
            <p>Digite seu e-mail para enviarmos um link de recuperação.</p>

            {mensagem && <div className="reset-success">{mensagem}</div>}
            {erro && <div className="reset-error">{erro}</div>}
          </div>

          <form onSubmit={handleReset}>
            <div className="input-wrapper">
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