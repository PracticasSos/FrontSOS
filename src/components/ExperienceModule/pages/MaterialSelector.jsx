import React from "react";
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
  return (
    <div className="page-container-material">
      <div className="content-wrapper">
        <div className="selector-container">
          {materials.map((mat) => (
            <div key={mat.name} className="material-card">
              <div className="material-content">
                <div className="circle">
                  <img src={mat.imgSrc} alt={mat.name} />
                </div>
                <h3 className="material-name">{mat.name}</h3>
                <div className="material-info">
                  {mat.info.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
