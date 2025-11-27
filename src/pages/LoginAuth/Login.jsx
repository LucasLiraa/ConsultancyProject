// src/pages/LoginAuth/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 NOVO

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await signIn(email, senha);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao fazer login. Tente novamente.");
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
                type={showPassword ? "text" : "password"} // 👈 alterna tipo
                placeholder="Password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <span
                className="input-icon password-eye"
                onClick={() => setShowPassword((prev) => !prev)} // 👈 toggle
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
              {/* Linha Remember + Forgot */}
              <div className="login-options">
                <div /> {/* espaço pra um "remember" no futuro */}
                <Link to="/nova-senha" className="forgot-link">
                  Esqueceu sua senha?
                </Link>
              </div>

              {/* Botão */}
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