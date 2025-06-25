// src/utils/recommendationLogic.js

// Definimos reglas de recomendación en un objeto declarativo
const rules = {
  frameByShape: {
    ovalado: "Rectangular o aviador",
    redondo: "Cuadrado o angular",
    cuadrado: "Ovalado o redondo",
    corazón: "Sin marco o cat-eye",
    triangulo: "Aviador o panto",
    diamante: "Ovalado o sin marco",
    oblongo: "Ancho o sin marco", 
  },
  frameMaterial: {
    Bajo: "Plástico ligero",
    Medio: "Metal ligero",
    Alto: "Titanio o premium",
  },
  antiReflective: hours => hours > 4 ? "Sí (filtro luz azul)" : "Opcional",
  transition: light => light === "Sí" ? "Recomendado" : "Opcional",
  astigmatismNote: label => label === "1"
    ? "Posible astigmatismo. Revisa con examen clínico"
    : "",
  lensType: ({ knows, sphLeft, sphRight, age }) => {
    // Si el usuario ingresa graduación y es mayor de 40, sugerir progresivos
    if (knows === 'yes' && age >= 40) return 'Progresivos';
    // Si no ingresa graduación pero edad avanzada, sugerir progresivos
    if (knows === 'no' && age >= 45) return 'Progresivos';
    return 'Monofocal';
  }
};

export function getRecommendations(answers) {
  // Extraemos respuestas por índice
  const usesLenses = answers[0];
  const activity = answers[1];
  const age = Number(answers[2] || 0);
  const astigLabel = answers[3];
  const scratchFreq = Number(answers[4] || 0);
  const faceShape = answers[5] || 'ovalado';
  const graduation = answers[6] || { knows: 'no', sphLeft: null, sphRight: null };
  const screenHours = Number(answers[7] || 0);
  const lightSensitivity = answers[8] || 'No';
  const budget = answers[9] || 'Medio';

  // 1. Armazón: basado en forma y actividad
  let frameByShape = rules.frameByShape[faceShape] || 'Rectangular';
  if (activity === 'Actividades deportivas o al aire libre') {
    frameByShape = 'Deportivo';
  }
  if (activity === 'Conducción') {
    frameByShape = 'Aviador';
  }

  // 2. Material de montura: según presupuesto
  const frameMaterial = rules.frameMaterial[budget] || 'Metal ligero';

  // 3. Tipo de lente: monofocal o progresivos
  const lensType = rules.lensType({
    knows: graduation.knows,
    sphLeft: graduation.sphLeft,
    sphRight: graduation.sphRight,
    age
  });

  // 4. Anti-reflejante: según horas de pantalla
  const antiReflective = rules.antiReflective(screenHours);

  // 5. Transition/Polarizado: según sensibilidad solar
  const transition = rules.transition(lightSensitivity);

  // 6. Nota astigmatismo
  const astigmatismNote = rules.astigmatismNote(astigLabel);

  return {
    frameByShape,
    frameMaterial,
    lensType,
    antiReflective,
    transition,
    astigmatismNote
  };
}
