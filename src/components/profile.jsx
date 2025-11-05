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
                <p>Wermercone Pereira (Meo)</p>
                <p>05/11  - Mastopexia com prótese</p>
            </div>

            {/* Card status */}
            <div className="profileSubCardStatus">
                <h5>Status</h5>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option>Disponível</option>
                    <option>Em cirurgia</option>
                    <option>Ausente</option>
                </select>
            </div>
        </div>

      </div>
    </div>
  );
}

export default ProfileUser;
