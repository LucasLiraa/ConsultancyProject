import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

import './styles/sidebar.css';

const NavSidebar = () => {
    const [isOpen, setIsOpen] = useState(true); // Controla se o sidebar está aberto ou fechado
    const location = useLocation();  // Obtém a rota atual
    const { signOut } = useAuth();

    const getLinkClass = (path) => {
        return location.pathname === path ? 'active' : '';  // Retorna 'active' se a rota corresponder
    };

    return (
        <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
            {/* Botão de alternância */}
            <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                <i className={`fa ${isOpen ? "fa-angles-left" : "fa-angles-right"}`}></i>
            </button>

            {/* Logo */}
            <Link to="/">
                <img 
                    src={`${process.env.PUBLIC_URL}/${isOpen ? "logo.png" : "logop.png"}`} 
                    className="logo" 
                    alt="Logo" 
                />
            </Link>


            {/* Lista de navegação */}
            <ul>
                <Link to="/" className={getLinkClass('/')}><li><i className="fa fa-house"></i>{isOpen && <span>Início</span>}</li></Link>
                <Link to="/pacientes" className={getLinkClass('/pacientes')}><li><i className="fa fa-users"></i>{isOpen && <span>Pacientes</span>}</li></Link>
                <Link to="/documentos" className={getLinkClass('/documentos')}><li><i className="fa fa-folder-open"></i>{isOpen && <span>Documentos</span>}</li></Link>
                <Link to="/agendamentos" className={getLinkClass('/agendamentos')}><li><i className="fa-solid fa-calendar-days"></i>{isOpen && <span>Agendamentos</span>}</li></Link>
                <Link to="/prontuarios" className={getLinkClass('/prontuarios')}><li><i className="fa fa-file-medical"></i>{isOpen && <span>Pós-Operatórios</span>}</li></Link>
                <Link to="/orcamentos" className={getLinkClass('/orcamentos')}><li><i className="fa-solid fa-money-bill-wave"></i>{isOpen && <span>Orçamentos</span>}</li></Link>
                <Link to="/faturamentos" className={getLinkClass('/faturamentos')}><li><i className="fa fa-money-bill-trend-up"></i>{isOpen && <span>Faturamento</span>}</li></Link>
                <Link to="/insumos" className={getLinkClass('/insumos')}><li><i className="fa fa-boxes-stacked"></i>{isOpen && <span>Insumos</span>}</li></Link>
                <a
                    href="https://drive.google.com/file/d/1trJgjf9KnVvpecrw5xG49Btk1x5RV4qd/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getLinkClass('/https://drive.google.com/file/d/1trJgjf9KnVvpecrw5xG49Btk1x5RV4qd/view?usp=sharing')}
                    >
                    <li>
                        <i className="fa-solid fa-newspaper"></i>
                        {isOpen && <span>Cartilha</span>}
                    </li>
                </a>
            </ul>

            {/* Configurações */}
            <div className='navSettings'>
                <Link to="/login"><i className="fa-solid fa-gear"></i>{isOpen && <span>Configurações</span>}</Link>
                <button onClick={signOut}>Sair</button>
            </div>
        </nav>
    );
};

export default NavSidebar;