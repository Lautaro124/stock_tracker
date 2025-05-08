"use server";

import { CalculatorInput, CalculatorResult } from "@/interface/calculator";

/**
 * Calcula el presupuesto para una pieza impresa en 3D
 * @param input Parámetros de entrada para el cálculo
 * @returns Objeto con resultados detallados del presupuesto
 */
export async function calculateBudget(
  input: CalculatorInput
): Promise<CalculatorResult> {
  // Validaciones
  if (input.height <= 0 || input.width <= 0 || input.depth <= 0) {
    throw new Error("Las dimensiones deben ser números positivos");
  }

  if (input.infillPercentage < 0 || input.infillPercentage > 100) {
    throw new Error("El porcentaje de relleno debe estar entre 0 y 100");
  }

  if (input.profitMargin < 0) {
    throw new Error("El margen de beneficio no puede ser negativo");
  }

  if (input.density <= 0 || input.materialPrice <= 0) {
    throw new Error("La densidad y el precio del material deben ser positivos");
  }

  // Cálculo del volumen si no se proporciona
  const volumeCm3 =
    input.volume || (input.height * input.width * input.depth) / 1000; // convertir mm³ a cm³

  // Tiempo total de impresión en horas
  const printTimeTotal = input.printTimeHours + input.printTimeMinutes / 60;

  // Cálculo del peso: volumen × densidad × porcentaje de relleno
  const infillFactor = input.infillPercentage / 100;
  const weight = volumeCm3 * input.density * infillFactor;

  // Desglose de costes
  const materialCost = weight * input.materialPrice;
  const energyCost =
    printTimeTotal * input.printerConsumption * input.energyCost;
  const machineCost = printTimeTotal * input.machineCostPerHour;

  // Coste total sin margen
  const totalCostNoMargin =
    materialCost + energyCost + machineCost + input.additionalCosts;

  // Precio final con margen de beneficio
  const finalPrice = totalCostNoMargin * (1 + input.profitMargin / 100);

  return {
    volume: parseFloat(volumeCm3.toFixed(2)),
    weight: parseFloat(weight.toFixed(2)),
    printTimeTotal: parseFloat(printTimeTotal.toFixed(2)),
    materialCost: parseFloat(materialCost.toFixed(2)),
    energyCost: parseFloat(energyCost.toFixed(2)),
    machineCost: parseFloat(machineCost.toFixed(2)),
    totalCostNoMargin: parseFloat(totalCostNoMargin.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
  };
}

/**
 * Obtiene los valores predeterminados para la calculadora
 * @returns Valores predeterminados para el formulario
 */
export async function getDefaultCalculatorValues(): Promise<CalculatorInput> {
  return {
    height: 100,
    width: 100,
    depth: 100,
    density: 1.24, // PLA por defecto
    materialPrice: 15, // ARS/g
    infillPercentage: 20,
    printTimeHours: 2,
    printTimeMinutes: 30,
    energyCost: 80, // ARS/kWh (tarifa aproximada en Argentina)
    printerConsumption: 0.3, // kW
    machineCostPerHour: 350, // ARS/h
    additionalCosts: 0,
    profitMargin: 30,
  };
}
