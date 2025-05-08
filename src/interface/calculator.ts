export interface CalculatorInput {
  // Dimensiones de la pieza en mm
  height: number;
  width: number;
  depth: number;
  // Volumen real en cm³ (opcional, se calcula si no se proporciona)
  volume?: number;
  // Densidad del material en g/cm³
  density: number;
  // Precio del material por gramo (en ARS)
  materialPrice: number;
  // Porcentaje de relleno (infill) (0-100)
  infillPercentage: number;
  // Tiempo de impresión
  printTimeHours: number;
  printTimeMinutes: number;
  // Coste de energía
  energyCost: number; // por kWh (en ARS)
  printerConsumption: number; // en kW
  // Coste de depreciación de la máquina
  machineCostPerHour: number; // en ARS por hora
  // Costes adicionales
  additionalCosts: number; // en ARS
  // Margen de beneficio (0-100)
  profitMargin: number;
}

export interface CalculatorResult {
  // Datos básicos
  volume: number; // en cm³
  weight: number; // en gramos
  printTimeTotal: number; // en horas

  // Desglose de costes
  materialCost: number;
  energyCost: number;
  machineCost: number;
  totalCostNoMargin: number;

  // Precio final
  finalPrice: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  density: number; // g/cm³
  defaultPrice: number; // por gramo
}

export const MATERIAL_OPTIONS: MaterialOption[] = [
  { id: "pla", name: "PLA", density: 1.24, defaultPrice: 15 },
  { id: "abs", name: "ABS", density: 1.04, defaultPrice: 15 },
  { id: "petg", name: "PETG", density: 1.27, defaultPrice: 18 },
  { id: "tpu", name: "TPU Flexible", density: 1.21, defaultPrice: 25 },
  { id: "nylon", name: "Nylon", density: 1.1, defaultPrice: 30 },
  { id: "resin", name: "Resina", density: 1.1, defaultPrice: 35 },
];
