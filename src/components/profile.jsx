import React, { useState } from "react";
import "./styles/profile.css";

function ProfileUser() {
  const [status, setStatus] = useState("Disponível");

  return (
    <div className="profileUser">

      <div className="profileHeader">
        <h3>Meu perfil</h3>
      </div>

      <div className="profileCard">
        {/* Cabeçalho do card */}
        <div className="profileHeaderCard">

          <div className="profileImage">
            <img src="/profile-dr-paulo.jpeg" alt="Foto de perfil" />
          </div>

          <div className="profileInfo">
            <h4 className="profileName">Dr. Paulo Vasconcelos</h4>
            <p className="profileInfo">Cirurgião Plástico</p>
            <p className="profileInfo">R. Voluntários da Pátria, 560 - Sala 705</p>
          </div>
        </div>

        {/* Card próxima cirurgia */}
        <div className="profileSubCardMain">
            <div className="profileSubCard">
                <h5>Próxima Cirurgia</h5>
                <p>Elza Pereira dos Santos</p>
                <p>03/12/2025 às 11:00</p>
            </div>
        </div>

      </div>
    </div>
  );
}

export default ProfileUser;