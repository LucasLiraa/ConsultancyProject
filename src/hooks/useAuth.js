<<<<<<< HEAD
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1️⃣ Verifica se já existe uma sessão salva (persistida)
    const verificarSessao = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUsuario(data.session.user);
      }
      setCarregando(false);
    };

    verificarSessao();

    // 2️⃣ Escuta alterações de login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { usuario, carregando };
=======
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1️⃣ Verifica se já existe uma sessão salva (persistida)
    const verificarSessao = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUsuario(data.session.user);
      }
      setCarregando(false);
    };

    verificarSessao();

    // 2️⃣ Escuta alterações de login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { usuario, carregando };
>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
};