"use server";

import {
  CalculatorInput,
  CalculatorResult,
  KwCalculatorInput,
  KwCalculatorResult,
} from "@/interface/calculator";

/**
 * Calcula el presupuesto para una pieza impresa en 3D
 * @param input Parámetros de entrada para el cálculo
 * @returns Objeto con resultados detallados del presupuesto
 */
export async function calculateBudget(
  input: CalculatorInput
): Promise<CalculatorResult> {
  // Validaciones
  if (input.filamentWeight <= 0) {
    throw new Error("El peso del filamento debe ser un número positivo");
  }

  if (input.infillPercentage < 0 || input.infillPercentage > 100) {
    throw new Error("El porcentaje de relleno debe estar entre 0 y 100");
  }

  if (input.profitMargin < 0) {
    throw new Error("El margen de beneficio no puede ser negativo");
  }

  if (input.materialPrice <= 0) {
    throw new Error("El precio del material debe ser positivo");
  }

  // Tiempo total de impresión en horas
  const printTimeTotal = input.printTimeHours + input.printTimeMinutes / 60;

  // Usamos directamente el peso del filamento
  const weight = input.filamentWeight;

  // Estimación de volumen basada en el peso y una densidad promedio de 1.25 g/cm³
  // Solo si es necesario y no se proporciona
  const volumeCm3 = input.volume || weight / 1.25;

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
    filamentWeight: 50, // Peso de filamento en gramos
    materialPrice: 0.015, // ARS/g (15 ARS/kg)
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

/**
 * Calcula el consumo de kW y los costos para impresoras 3D
 * @param input Parámetros de entrada para el cálculo de kW
 * @returns Objeto con resultados detallados del consumo y costos
 */
export async function calculateKwConsumption(
  input: KwCalculatorInput
): Promise<KwCalculatorResult> {
  // Validaciones de seguridad - asegurar que todos los valores sean números válidos
  const printerConsumption = Number(input.printerConsumption) || 0;
  const hoursPerDay = Number(input.hoursPerDay) || 0;
  const daysPerMonth = Number(input.daysPerMonth) || 0;
  const energyCost = Number(input.energyCost) || 0;

  // Validaciones de negocio
  if (printerConsumption <= 0) {
    throw new Error("El consumo de la impresora debe ser un número positivo");
  }

  if (hoursPerDay < 0 || hoursPerDay > 24) {
    throw new Error("Las horas por día deben estar entre 0 y 24");
  }

  if (daysPerMonth < 0 || daysPerMonth > 31) {
    throw new Error("Los días por mes deben estar entre 0 y 31");
  }

  if (energyCost <= 0) {
    throw new Error("El costo de energía debe ser un número positivo");
  }

  try {
    // Cálculo del consumo diario en kWh
    const dailyConsumption = printerConsumption * hoursPerDay;

    // Cálculo del consumo mensual y anual
    const monthlyConsumption = dailyConsumption * daysPerMonth;
    const yearlyConsumption = monthlyConsumption * 12;

    // Cálculo de costos
    const dailyCost = dailyConsumption * energyCost;
    const monthlyCost = monthlyConsumption * energyCost;
    const yearlyCost = yearlyConsumption * energyCost;

    return {
      dailyConsumption: parseFloat(dailyConsumption.toFixed(2)),
      monthlyConsumption: parseFloat(monthlyConsumption.toFixed(2)),
      yearlyConsumption: parseFloat(yearlyConsumption.toFixed(2)),
      dailyCost: parseFloat(dailyCost.toFixed(2)),
      monthlyCost: parseFloat(monthlyCost.toFixed(2)),
      yearlyCost: parseFloat(yearlyCost.toFixed(2)),
    };
  } catch (error) {
    console.error("Error en el cálculo de kW:", error);
    // Devolver valores predeterminados en caso de error para evitar undefined
    return {
      dailyConsumption: 0,
      monthlyConsumption: 0,
      yearlyConsumption: 0,
      dailyCost: 0,
      monthlyCost: 0,
      yearlyCost: 0,
    };
  }
}

/**
 * Obtiene los valores predeterminados para la calculadora de kW
 * @returns Valores predeterminados para el formulario de kW
 */
export async function getDefaultKwCalculatorValues(): Promise<KwCalculatorInput> {
  return {
    printerName: "Ender 3",
    printerConsumption: 0.36, // kW
    hoursPerDay: 8,
    energyCost: 80, // ARS/kWh (tarifa aproximada en Argentina)
    daysPerMonth: 20,
  };
}
