import { calculatePaperDivision } from './src/utils/paperSizes';
console.log('A2 to A5:', calculatePaperDivision('A2', 'A5'));
console.log('789x1092 to A5:', calculatePaperDivision('789x1092', 'A5'));
