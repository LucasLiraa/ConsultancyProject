import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import "./Login.css";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const normalizeEmail = (value) => value.trim().toLowerCase();

  const enviarLinkRecuperacao = async (emailValue) => {
    const emailNorm = normalizeEmail(emailValue);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailNorm,
      options: {
        emailRedirectTo: `${window.location.origin}/nova-senha`,
      },
    });

    if (otpError) throw otpError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);

    try {
      const emailNorm = normalizeEmail(email);

      // 1) Login normal com senha (você cria usuário e senha temporária no painel)
      await signIn(emailNorm, senha);

      // 2) Checa metadata para forçar troca de senha
      const { data } = await supabase.auth.getSession();
      const mustChange = !!data?.session?.user?.user_metadata?.must_change_password;

      if (mustChange) {
        navigate("/nova-senha", { replace: true });
        return;
      }

      // 3) Se não precisa trocar senha, vai pro destino normal
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErro(error?.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!email.trim()) {
      setErro("Informe seu e-mail para enviarmos o link.");
      return;
    }

    setLoading(true);
    try {
      await enviarLinkRecuperacao(email);
      setMensagem("Enviamos um link para seu e-mail para criar/recuperar sua senha.");
    } catch (error) {
      console.error(error);
      setErro(error?.message || "Erro ao enviar link. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* COLUNA ESQUERDA */}
        <div className="login-left">
          <div className="loginHeader">
            <h1>Bem-vindo de volta!</h1>
            <p>Acesse sua conta e vamos iniciar!</p>

            {erro && <div className="login-error">{erro}</div>}
            {mensagem && <div className="login-success">{mensagem}</div>}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Campo de E-mail */}
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="input-icon">
                <i className="fa-regular fa-envelope"></i>
              </span>
            </div>

            {/* Campo de Senha */}
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <span
                className="input-icon password-eye"
                onClick={() => setShowPassword((prev) => !prev)}
                role="button"
                tabIndex={0}
              >
                <i
                  className={
                    showPassword
                      ? "fa-regular fa-eye-slash"
                      : "fa-regular fa-eye"
                  }
                ></i>
              </span>
            </div>

            <div className="loginFooter">
              <div className="login-options">
                <div />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-link"
                  disabled={loading}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Entrando..." : "Login"}
              </button>
            </div>
          </form>
        </div>

        {/* COLUNA DIREITA */}
        <div className="login-right">
          <img src="/loginImage.jpg" alt="Fundo" />
        </div>
      </div>
    </div>
  );
};

export default Login;