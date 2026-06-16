function calcPlates(colorStr, pressSheet) {
  if (!colorStr || !pressSheet) return 0;
  const parts = colorStr.split('+').map(Number);
  if (parts.length !== 2) return 0;
  const front = parts[0] || 0;
  const back = parts[1] || 0;
  const platesPerSheet = front + back;
  if (platesPerSheet === 0) return 0;

  const fullSheets = Math.floor(pressSheet);
  const fraction = pressSheet - fullSheets;

  let fractionalPlates = 0;
  if (fraction > 0) {
    if (back > 0) {
      fractionalPlates = Math.max(front, back);
    } else {
      fractionalPlates = front;
    }
  }
  return (fullSheets * platesPerSheet) + fractionalPlates;
}

console.log("calcPlates('4+4', 12.25) =", calcPlates('4+4', 12.25));
