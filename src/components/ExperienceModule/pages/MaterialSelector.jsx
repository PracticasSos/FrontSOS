import React, { useState } from "react";
import "./MaterialSelector.css";
import plasticoImg from "../../../assets/plastico.png";
import policarbonatoImg from "../../../assets/policarbonato.png";
import cristalImg from "../../../assets/cristal.png";

const materials = [
  {
    name: "Plástico",
    imgSrc: plasticoImg,
    info: "Ventajas: resistente, económico.\nDesventajas: menor claridad que cristal.",
  },
  {
    name: "Policarbonato",
    imgSrc: policarbonatoImg,
    info: "Ventajas: muy ligero, buena claridad óptica.\nDesventajas: se raya fácil.",
  },
  {
    name: "Cristal",
    imgSrc: cristalImg,
    info: "Ventajas: máxima claridad, muy resistente a rayaduras.\nDesventajas: más pesado y caro.",
  },
];

export default function MaterialSelector() {
  const [activeIdx, setActiveIdx] = useState(null);

  const toggleTooltip = (idx) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* <h1 className="main-title">Materiales de Lunas</h1> */}
        <div className="selector-container">
          {materials.map((mat, idx) => (
            <div key={mat.name} className="material-card">
              <div className="circle">
                <img src={mat.imgSrc} alt={mat.name} />
              </div>
              <div className="material-name">{mat.name}</div>
              <button
                className="tooltip-btn"
                onClick={() => toggleTooltip(idx)}
              >
                ?
                <div
                  className={`tooltip-box${
                    activeIdx === idx ? " active" : ""
                  }`}
                >
                  {mat.info.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
