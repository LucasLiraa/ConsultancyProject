// src/contexts/UserContext.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../utils/supabaseClient'; // Seu cliente Supabase

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Onde o tipo de usuário será armazenado
  const [loading, setLoading] = useState(true);

  // Função para buscar o perfil do usuário (seu papel: Admin, Paciente, etc.)
  const getProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`role`) // Supondo que você tenha uma coluna 'role' na sua tabela de perfis
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Inicia buscando a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Assina o listener de mudanças de estado
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Limpa o listener ao desmontar
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Funções de Autenticação (Acessíveis a todos os componentes)
  const value = {
    session,
    user,
    profile,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    // Adicione signup, resetPassword aqui se precisar
  };

  return (
    <UserContext.Provider value={value}>
      {/* Exibe um loading global enquanto verifica a sessão */}
      {loading ? <div>Carregando Autenticação...</div> : children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};