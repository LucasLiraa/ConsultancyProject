import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./NovaSenha.css";

const NovaSenha = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    const checkRecovery = async () => {
      try {
        // ✅ suporte a redirect com ?code=... (PKCE)
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // Se já existir sessão (ex.: logado via link), habilita troca de senha
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) {
          setIsRecoveryMode(true);
          return;
        }

        // fallback: links antigos com type=recovery (se algum dia usar)
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
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkRecovery();
  }, []);

  // 🔹 envia o e-mail (link) para recuperar/criar senha
  const handleReset = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/nova-senha` },
      });

      if (error) throw error;

      setMensagem("Enviamos um e-mail com um link para você definir sua senha.");
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
      // ✅ Atualiza senha e desativa flag de primeiro acesso (metadata)
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
        data: { must_change_password: false },
      });

      if (error) throw error;

      setMensagem("Senha atualizada com sucesso! Redirecionando...");
      setNovaSenha("");
      setConfirmarSenha("");

      // manda pro sistema (ou pro login, se preferir)
      navigate("/", { replace: true });
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
        <div className="reset-left">
          <img src="/loginImage.jpg" alt="Background" className="reset-bg-img" />
          <h1>Redefinir senha</h1>
          <p>
            {isRecoveryMode
              ? "Defina uma nova senha para acessar sua conta."
              : "Digite seu e-mail e enviaremos um link para você recuperar o acesso."}
          </p>
        </div>

        <div className="reset-right">
          {mensagem && <div className="reset-success">{mensagem}</div>}
          {erro && <div className="reset-error">{erro}</div>}

          {isRecoveryMode ? (
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