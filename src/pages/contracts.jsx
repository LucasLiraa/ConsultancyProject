import React from "react";
import "./styles/contracts.css";
import Topbar from "../components/topbar";
import DocumentsCarousel from "../components/documentsComponents/documentsCarousel";

function Contracts() {
  const documents = [
    { title: "Contrato de Cirurgia", preview: "previewD.png" },
    { title: "Termo de Consentimento", preview: "previewD.png"  },
    { title: "Receita Médica", preview: "previewD.png" },
    { title: "Atestado", preview: "previewD.png" },
    { title: "Instruções Pós-Op", preview: "previewD.png"  },
    { title: "Ficha de Avaliação", preview: "previewD.png"  },
  ];

  return (
    <section className="sectionContracts">
      <Topbar showSearch={true} />

      <div className="containerContracts">
        <h2>Documentação</h2>
        <button>Todas as documentações</button>
        <button>Contratos & Termos</button>
        <button>Informátivos cirúrgicos</button>
        <button>Receitas & Atestados</button>
        <button>Outras documentações</button>
      </div>

      <DocumentsCarousel items={documents} />

      <div className="contentListContracts">
        <h3>Preenchidos recentemente</h3>

        <ul>
          <li>
            <p>Contrato de cirurgia</p>
            <div>
              <i class="fa fa-file-pdf"></i>
              <span>12MB</span>
            </div>
            <div className="contetProfileList">
              <img src="profile-icon.jpg"/>
              <span>Dr. Paulo Vasconcelos</span>
            </div>
            <p>01/01/2025</p>
            <span>Nome Paciente</span>
            <div className="contentIconsList">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              <i className="fa-solid fa-trash-can"></i>
            </div>
          </li>

          <li>
            <p>Contrato de cirurgia</p>
            <div>
              <i class="fa fa-file-pdf"></i>
              <span>14MB</span>
            </div>
            <div className="contetProfileList">
              <img src="profile-icon.jpg"/>
              <span>Dr. Paulo Vasconcelos</span>
            </div>
            <p>25/05/2025</p>
            <span>Nome Paciente</span>
            <div className="contentIconsList">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              <i className="fa-solid fa-trash-can"></i>
            </div>
          </li>

          <li>
            <p>Termo de Consentimento</p>
            <div>
              <i class="fa fa-file-pdf"></i>
              <span>12MB</span>
            </div>
            <div className="contetProfileList">
              <img src="profile-icon.jpg"/>
              <span>Vanusa de Paula Araújo</span>
            </div>
            <p>19/03/2025</p>
            <span>Nome Paciente</span>
            <div className="contentIconsList">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              <i className="fa-solid fa-trash-can"></i>
            </div>
          </li>


          <li>
            <p>Contrato de cirurgia</p>
            <div>
              <i class="fa fa-file-pdf"></i>
              <span>16MB</span>
            </div>
            <div className="contetProfileList">
              <img src="profile-icon.jpg"/>
              <span>Dr. Paulo Vasconcelos</span>
            </div>
            <p>18/03/2025</p>
            <span>Nome Paciente</span>
            <div className="contentIconsList">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              <i className="fa-solid fa-trash-can"></i>
            </div>
          </li>


          <li>
            <p>Receita Médica</p>
            <div>
              <i class="fa fa-file-pdf"></i>
              <span>6MB</span>
            </div>
            <div className="contetProfileList">
              <img src="profile-icon.jpg"/>
              <span>Vanusa de Paula Araújo</span>
            </div>
            <p>26/02/2025</p>
            <span>Nome Paciente</span>
            <div className="contentIconsList">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              <i className="fa-solid fa-trash-can"></i>
            </div>
          </li>

          <li>
            <p>Ficha de Avaliação</p>
            <div>
              <i class="fa fa-file-pdf"></i>
              <span>20MB</span>
            </div>
            <div className="contetProfileList">
              <img src="profile-icon.jpg"/>
              <span>Dr. Paulo Vasconcelos</span>
            </div>
            <p>05/04/2025</p>
            <span>Nome Paciente</span>
            <div className="contentIconsList">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              <i className="fa-solid fa-trash-can"></i>
            </div>
          </li>
        </ul>

      </div>
    </section>
  );
}

export default Contracts;