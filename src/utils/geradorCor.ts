export function gerarCorAleatoria() {
  const letrasHex = "0123456789ABCDEF";
  let cor = "#";
  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i < 6; ++i) {
    cor += letrasHex[Math.floor(Math.random() * 16)];
  }
  return cor;
}

export function generateColorTransition(
  startColor: string,
  endColor: string,
  numColors: number
): string[] {
  const startRGB = hexToRGB(startColor);
  const endRGB = hexToRGB(endColor);
  const intermediateColors: string[] = [];
  const interval = 100;

  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i <= numColors; ++i) {
    const percent = i / numColors;
    const r = Math.round(startRGB.r + percent * (endRGB.r - startRGB.r));
    const g = Math.round(startRGB.g + percent * (endRGB.g - startRGB.g));
    const b = Math.round(startRGB.b + percent * (endRGB.b - startRGB.b));
    const color = rgbToHex({ r, g, b });
    intermediateColors.push(color);

    if (i < numColors) {
      setTimeout(() => {}, i * interval);
    }
  }

  return intermediateColors;
}

function hexToRGB(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(rgb: { r: number; g: number; b: number }) {
  const rHex = Math.min(255, Math.max(0, rgb.r)).toString(16).padStart(2, "0");
  const gHex = Math.min(255, Math.max(0, rgb.g)).toString(16).padStart(2, "0");
  const bHex = Math.min(255, Math.max(0, rgb.b)).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}
