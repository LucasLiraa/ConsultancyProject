import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha incorretos.");
      setCarregando(false);
      return;
    }

    // Busca o usuário na tabela 'usuarios' para checar se é o primeiro login
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .select("primeiro_login")
      .eq("email", email)
      .single();

    if (usuarioError || !usuarioData) {
      setErro("Erro ao verificar o status do usuário.");
      setCarregando(false);
      return;
    }

    // Redireciona conforme o status
    if (usuarioData.primeiro_login) {
      navigate("/nova-senha");
    } else {
      navigate("/");
    }

    setCarregando(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        {erro && <p className="erro">{erro}</p>}
      </form>
    </div>
  );
};

export default Login;