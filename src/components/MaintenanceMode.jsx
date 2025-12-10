<<<<<<< HEAD
// MaintenanceMode.jsx
import React from 'react';
import './styles/maintenanceMode.css'; // O CSS da manutenção que criamos antes

const MaintenanceMode = () => {
  // A URL do GIF de melhoria/ajustes.
  // **Substitua este placeholder pela URL do seu GIF de melhoria**
  const gifUrl = "https://camo.githubusercontent.com/2366b34bb903c09617990fb5fff4622f3e941349e846ddb7e73df872a9d21233/68747470733a2f2f63646e2e6472696262626c652e636f6d2f75736572732f3733303730332f73637265656e73686f74732f363538313234332f6176656e746f2e676966"; 
  
  return (
    <div className="maintenance-body">
      <div className="maintenance-container">
        <h1>🛠️ Estamos em Manutenção!</h1>
        <p>Pedimos desculpas pelo inconveniente, mas estamos realizando algumas <span className="highlight">melhorias importantes</span> no nosso sistema.</p>

        <div className="gif-wrapper">
          <img 
            src={gifUrl} 
            alt="GIF de ajustes e melhorias sendo feitos" 
            className="maintenance-gif"
          />
        </div>

        <p>Nosso objetivo é oferecer uma experiência ainda melhor para você! Estaremos de volta o mais breve possível.</p>

        <div className="contact-info">
          <p>Agradecemos a sua paciência. Volte em breve!</p>
          {/* Se desejar, adicione alguma forma de contato de emergência: */}
          {/* <p>Se for urgente, entre em contato: <a href="mailto:contato@seuemail.com">contato@seuemail.com</a></p> */}
        </div>
      </div>
    </div>
  );
};

=======
// MaintenanceMode.jsx
import React from 'react';
import './styles/maintenanceMode.css'; // O CSS da manutenção que criamos antes

const MaintenanceMode = () => {
  // A URL do GIF de melhoria/ajustes.
  // **Substitua este placeholder pela URL do seu GIF de melhoria**
  const gifUrl = "https://camo.githubusercontent.com/2366b34bb903c09617990fb5fff4622f3e941349e846ddb7e73df872a9d21233/68747470733a2f2f63646e2e6472696262626c652e636f6d2f75736572732f3733303730332f73637265656e73686f74732f363538313234332f6176656e746f2e676966"; 
  
  return (
    <div className="maintenance-body">
      <div className="maintenance-container">
        <h1>🛠️ Estamos em Manutenção!</h1>
        <p>Pedimos desculpas pelo inconveniente, mas estamos realizando algumas <span className="highlight">melhorias importantes</span> no nosso sistema.</p>

        <div className="gif-wrapper">
          <img 
            src={gifUrl} 
            alt="GIF de ajustes e melhorias sendo feitos" 
            className="maintenance-gif"
          />
        </div>

        <p>Nosso objetivo é oferecer uma experiência ainda melhor para você! Estaremos de volta o mais breve possível.</p>

        <div className="contact-info">
          <p>Agradecemos a sua paciência. Volte em breve!</p>
          {/* Se desejar, adicione alguma forma de contato de emergência: */}
          {/* <p>Se for urgente, entre em contato: <a href="mailto:contato@seuemail.com">contato@seuemail.com</a></p> */}
        </div>
      </div>
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default MaintenanceMode;