import React, { useState, useEffect } from 'react';
// Certifique-se de que os caminhos para UserContext e supabaseClient estão corretos
import { useUser } from '../contexts/UserContext'; 
import { supabase } from '../utils/supabaseClient'; 
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    // Obtém funções e estado do contexto de usuário
    const { signIn, session } = useUser(); 
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Estado para alternar entre login (false) e cadastro (true)
    const [isSigningUp, setIsSigningUp] = useState(false); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Redireciona para a home se o usuário já estiver logado
    useEffect(() => {
        if (session) {
            navigate('/', { replace: true });
        }
    }, [session, navigate]);

    // Função auxiliar para criar o perfil inicial na tabela 'profiles'
    const createProfile = async (userId, userEmail) => {
        const defaultRole = 'paciente'; 
        
        const { error } = await supabase
            .from('profiles')
            .insert([
                // Define a role inicial como 'paciente'
                { id: userId, email: userEmail, role: defaultRole, name: userEmail.split('@')[0] } 
            ]);

        if (error) {
            // Em um ambiente real, você pode querer reverter a criação do usuário aqui
            console.error('Erro ao criar perfil. O usuário pode existir, mas sem role de perfil:', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (isSigningUp) {
            // --- Lógica de Cadastro (Sign Up) ---
            const { data, error } = await supabase.auth.signUp({ email, password });

            if (error) {
                setError(`Erro ao cadastrar: ${error.message}`);
            } else if (data.user) {
                // Se o usuário foi criado, cria o perfil na tabela 'profiles'
                await createProfile(data.user.id, email);
                setMessage('Cadastro realizado! Por favor, verifique seu email para confirmar e faça login.');
                // Volta para o modo Login para o usuário entrar
                setIsSigningUp(false); 
            }
        } else {
            // --- Lógica de Login (Sign In) ---
            const { error } = await signIn(email, password);

            if (error) {
                setError(`Falha no Login: ${error.message}`);
            } else {
                setMessage('Login efetuado com sucesso! Redirecionando...');
                // O useEffect acima cuidará do redirecionamento após a sessão ser estabelecida
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-700">
                        {isSigningUp ? 'Cadastro de Novo Paciente' : 'Acesso à Clínica'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isSigningUp ? 'Insira seus dados para criar sua conta.' : 'Entre com seu email e senha para continuar.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    {message && (
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : (isSigningUp ? 'Cadastrar' : 'Entrar')}
                    </button>
                </form>

                {/* BOTÃO PARA ALTERNAR ENTRE LOGIN E CADASTRO */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSigningUp(!isSigningUp);
                            // Limpa mensagens ao alternar modo
                            setError('');
                            setMessage('');
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-150"
                        disabled={loading}
                    >
                        {isSigningUp ? 'Já tem uma conta? Clique aqui para Logar' : 'Não tem conta? Crie uma agora (para pacientes)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;