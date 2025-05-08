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

// Interfaces para la calculadora de kW
export interface KwCalculatorInput {
  // Datos de la impresora
  printerName: string;
  printerConsumption: number; // Consumo en kW
  hoursPerDay: number;
  // Datos de tarifa eléctrica
  energyCost: number; // Costo por kWh (en ARS)
  // Horas de uso
  daysPerMonth: number;
}

export interface KwCalculatorResult {
  // Consumo energético
  dailyConsumption: number; // kWh por día
  monthlyConsumption: number; // kWh por mes
  yearlyConsumption: number; // kWh por año

  // Costos
  dailyCost: number; // Costo por día (en ARS)
  monthlyCost: number; // Costo por mes (en ARS)
  yearlyCost: number; // Costo por año (en ARS)
}

// Impresoras 3D populares con sus consumos típicos
export const COMMON_PRINTERS = [
  { id: "ender3", name: "Ender 3", consumption: 0.36 },
  { id: "ender3pro", name: "Ender 3 Pro", consumption: 0.35 },
  { id: "ender3v2", name: "Ender 3 v2", consumption: 0.35 },
  { id: "ender5", name: "Ender 5", consumption: 0.37 },
  { id: "prusai3", name: "Prusa i3 MK3S+", consumption: 0.12 },
  { id: "artillery", name: "Artillery Sidewinder X1", consumption: 0.35 },
  { id: "cr10", name: "Creality CR-10", consumption: 0.35 },
  { id: "cr10s", name: "Creality CR-10S", consumption: 0.41 },
  { id: "anycubic", name: "Anycubic i3 Mega", consumption: 0.25 },
  { id: "custom", name: "Personalizado", consumption: 0.35 },
];
