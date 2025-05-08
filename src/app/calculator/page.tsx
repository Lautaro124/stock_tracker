"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  CalculatorInput,
  CalculatorResult,
  MATERIAL_OPTIONS,
} from "@/interface/calculator";
import {
  calculateBudget,
  getDefaultCalculatorValues,
} from "@/lib/actions/calculator-actions";
import Link from "next/link";

export default function CalculatorPage() {
  const [input, setInput] = useState<CalculatorInput>({
    height: 100,
    width: 100,
    depth: 100,
    density: 1.24,
    materialPrice: 0.02,
    infillPercentage: 20,
    printTimeHours: 2,
    printTimeMinutes: 30,
    energyCost: 0.15,
    printerConsumption: 0.3,
    machineCostPerHour: 0.5,
    additionalCosts: 0,
    profitMargin: 30,
  });
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState("pla");
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [materialPricePerKg, setMaterialPricePerKg] = useState<number>(15000);

  // Cargar valores predeterminados al inicio
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await getDefaultCalculatorValues();
        setInput(defaults);
        setMaterialPricePerKg(defaults.materialPrice * 1000);
      } catch (error) {
        console.error("Error al cargar valores predeterminados:", error);
      }
    };

    loadDefaults();
  }, []);

  // Actualizar densidad y precio cuando cambie el material
  useEffect(() => {
    const material = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial);
    if (material) {
      setInput((prev) => ({
        ...prev,
        density: material.density,
        materialPrice: material.defaultPrice,
      }));
      setMaterialPricePerKg(material.defaultPrice * 1000);
    }
  }, [selectedMaterial]);

  // Validar un campo específico
  const validateField = (name: string, value: unknown): string => {
    if (typeof value === "number") {
      if (
        value <= 0 &&
        [
          "height",
          "width",
          "depth",
          "density",
          "materialPrice",
          "energyCost",
          "printerConsumption",
          "machineCostPerHour",
        ].includes(name)
      ) {
        return "Este valor debe ser mayor que cero";
      }

      if (
        (name === "infillPercentage" || name === "profitMargin") &&
        (value < 0 || value > 100)
      ) {
        return "El porcentaje debe estar entre 0 y 100";
      }
    }
    return "";
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let parsedValue: string | number = value;
    if (e.target.type === "number") {
      parsedValue = value === "" ? 0 : parseFloat(value);

      if (name === "materialPricePerKg") {
        setMaterialPricePerKg(parsedValue as number);
        setInput((prev) => ({
          ...prev,
          materialPrice: (parsedValue as number) / 1000,
        }));
        return;
      }

      // Validar el campo
      const error = validateField(name, parsedValue);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }

    if (name === "selectedMaterial") {
      setSelectedMaterial(value);
    } else {
      setInput((prev) => ({ ...prev, [name]: parsedValue }));
    }
  };

  // Calcular al enviar el formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Verificar si hay errores
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setCalculating(true);
      const result = await calculateBudget(input);
      setResult(result);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Ha ocurrido un error al calcular"
      );
    } finally {
      setCalculating(false);
    }
  };

  // Formatear números con separadores de miles y 2 decimales
  const formatNumber = (num: number): string => {
    return num.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Formatear con separador de miles pero sin decimales (números enteros)
  const formatInteger = (num: number): string => {
    return Math.round(num).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Calculadora de Presupuestos 3D
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calcula el coste y precio de venta para tus piezas impresas en 3D
            </p>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Volver al Dashboard
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-2 mb-2">
                <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">
                  Información de la pieza
                </h2>
              </div>

              {/* Material selector */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Material
                </label>
                <select
                  name="selectedMaterial"
                  value={selectedMaterial}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                >
                  {MATERIAL_OPTIONS.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.density} g/cm³)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dimensiones */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Altura (mm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={input.height}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.height ? "border-red-500" : ""
                  }`}
                />
                {errors.height && (
                  <p className="text-red-500 text-xs mt-1">{errors.height}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Anchura (mm)
                </label>
                <input
                  type="number"
                  name="width"
                  value={input.width}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.width ? "border-red-500" : ""
                  }`}
                />
                {errors.width && (
                  <p className="text-red-500 text-xs mt-1">{errors.width}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Profundidad (mm)
                </label>
                <input
                  type="number"
                  name="depth"
                  value={input.depth}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.depth ? "border-red-500" : ""
                  }`}
                />
                {errors.depth && (
                  <p className="text-red-500 text-xs mt-1">{errors.depth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Volumen real (cm³, opcional)
                </label>
                <input
                  type="number"
                  name="volume"
                  value={input.volume || ""}
                  onChange={handleChange}
                  placeholder="Se calculará automáticamente"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dejar vacío para calcular automáticamente
                </p>
              </div>

              {/* Material properties */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Densidad (g/cm³)
                </label>
                <input
                  type="number"
                  name="density"
                  value={input.density}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.density ? "border-red-500" : ""
                  }`}
                />
                {errors.density && (
                  <p className="text-red-500 text-xs mt-1">{errors.density}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio material (ARS/kg)
                </label>
                <input
                  type="number"
                  name="materialPricePerKg"
                  value={materialPricePerKg}
                  onChange={handleChange}
                  step="1"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
                <p className="text-xs font-medium text-blue-600 mt-1">
                  Aprox. ${formatInteger(materialPricePerKg)} ARS/kg
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Porcentaje de relleno (%)
                </label>
                <input
                  type="number"
                  name="infillPercentage"
                  value={input.infillPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.infillPercentage ? "border-red-500" : ""
                  }`}
                />
                {errors.infillPercentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.infillPercentage}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 mt-4 mb-2">
                <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">
                  Tiempo y costes de operación
                </h2>
              </div>

              {/* Print time */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiempo: Horas
                </label>
                <input
                  type="number"
                  name="printTimeHours"
                  value={input.printTimeHours}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiempo: Minutos
                </label>
                <input
                  type="number"
                  name="printTimeMinutes"
                  value={input.printTimeMinutes}
                  onChange={handleChange}
                  min="0"
                  max="59"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              {/* Energy costs */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coste energía (ARS/kWh)
                </label>
                <input
                  type="number"
                  name="energyCost"
                  value={input.energyCost}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.energyCost ? "border-red-500" : ""
                  }`}
                />
                {errors.energyCost && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.energyCost}
                  </p>
                )}
                <p className="text-xs font-medium text-blue-600 mt-1">
                  Aprox. ${formatInteger(input.energyCost)} ARS/kWh
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Consumo impresora (kW)
                </label>
                <input
                  type="number"
                  name="printerConsumption"
                  value={input.printerConsumption}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.printerConsumption ? "border-red-500" : ""
                  }`}
                />
                {errors.printerConsumption && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.printerConsumption}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Coste máquina (ARS/hora)
                </label>
                <input
                  type="number"
                  name="machineCostPerHour"
                  value={input.machineCostPerHour}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.machineCostPerHour ? "border-red-500" : ""
                  }`}
                />
                {errors.machineCostPerHour && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.machineCostPerHour}
                  </p>
                )}
                <p className="text-xs font-medium text-blue-600 mt-1">
                  Aprox. ${formatInteger(input.machineCostPerHour)} ARS/hora
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Costes adicionales (ARS)
                </label>
                <input
                  type="number"
                  name="additionalCosts"
                  value={input.additionalCosts}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
                <p className="text-xs font-medium text-blue-600 mt-1">
                  Aprox. ${formatInteger(input.additionalCosts)} ARS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Margen de beneficio (%)
                </label>
                <input
                  type="number"
                  name="profitMargin"
                  value={input.profitMargin}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.profitMargin ? "border-red-500" : ""
                  }`}
                />
                {errors.profitMargin && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.profitMargin}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={calculating || Object.keys(errors).length > 0}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
              >
                {calculating ? "Calculando..." : "Calcular presupuesto"}
              </button>
            </div>
          </form>

          {/* Resultados */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">
              Resultados
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300">
                    Precio final
                  </h3>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">
                    ${formatInteger(result.finalPrice)}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Información de la pieza</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Volumen
                      </p>
                      <p className="font-medium">
                        {formatNumber(result.volume)} cm³
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Peso
                      </p>
                      <p className="font-medium">
                        {formatNumber(result.weight)} g
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tiempo total
                      </p>
                      <p className="font-medium">
                        {formatNumber(result.printTimeTotal)} h
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Desglose de costes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b pb-1 dark:border-gray-700">
                      <span>Material:</span>
                      <span className="font-medium">
                        ${formatInteger(result.materialCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1 dark:border-gray-700">
                      <span>Energía:</span>
                      <span className="font-medium">
                        ${formatInteger(result.energyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1 dark:border-gray-700">
                      <span>Máquina:</span>
                      <span className="font-medium">
                        ${formatInteger(result.machineCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1 dark:border-gray-700">
                      <span>Adicionales:</span>
                      <span className="font-medium">
                        ${formatInteger(input.additionalCosts)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-medium">
                        Coste total (sin margen):
                      </span>
                      <span className="font-medium">
                        ${formatInteger(result.totalCostNoMargin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-green-600 dark:text-green-400">
                      <span className="font-medium">Margen de beneficio:</span>
                      <span className="font-medium">
                        +$
                        {formatInteger(
                          result.finalPrice - result.totalCostNoMargin
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="text-gray-500 dark:text-gray-400">
                  Completa el formulario y haz clic en &quot;Calcular
                  presupuesto&quot; para ver los resultados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
