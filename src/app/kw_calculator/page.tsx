"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  KwCalculatorInput,
  KwCalculatorResult,
  COMMON_PRINTERS,
} from "@/interface/calculator";
import {
  calculateKwConsumption,
  getDefaultKwCalculatorValues,
} from "@/lib/actions/calculator-actions";
import Link from "next/link";

export default function KwCalculatorPage() {
  const [input, setInput] = useState<KwCalculatorInput>({
    printerName: "Ender 3",
    printerConsumption: 0.36, // kW
    hoursPerDay: 8,
    energyCost: 80, // ARS/kWh
    daysPerMonth: 20,
  });
  const [result, setResult] = useState<KwCalculatorResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPrinter, setSelectedPrinter] = useState("ender3");

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await getDefaultKwCalculatorValues();
        setInput(defaults);
      } catch (error) {
        console.error("Error al cargar valores predeterminados:", error);
      }
    };
    loadDefaults();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Convertir a número si es un campo numérico
    if (
      name === "printerConsumption" ||
      name === "hoursPerDay" ||
      name === "energyCost" ||
      name === "daysPerMonth"
    ) {
      parsedValue = value === "" ? 0 : parseFloat(value);
    }

    setInput((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Limpiar error si existía
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambio de impresora predefinida
  const handlePrinterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const printerId = e.target.value;
    setSelectedPrinter(printerId);

    if (printerId === "custom") {
      // Si es personalizado, solo actualizar el nombre
      setInput((prev) => ({
        ...prev,
        printerName: "Personalizado",
      }));
    } else {
      // Buscar la impresora seleccionada
      const selectedPrinterData = COMMON_PRINTERS.find(
        (p) => p.id === printerId
      );
      if (selectedPrinterData) {
        setInput((prev) => ({
          ...prev,
          printerName: selectedPrinterData.name,
          printerConsumption: selectedPrinterData.consumption,
        }));
      }
    }
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (input.printerConsumption <= 0) {
      newErrors.printerConsumption = "El consumo debe ser mayor que 0";
    }

    if (input.hoursPerDay < 0 || input.hoursPerDay > 24) {
      newErrors.hoursPerDay = "Las horas deben estar entre 0 y 24";
    }

    if (input.daysPerMonth < 0 || input.daysPerMonth > 31) {
      newErrors.daysPerMonth = "Los días deben estar entre 0 y 31";
    }

    if (input.energyCost <= 0) {
      newErrors.energyCost = "El costo de energía debe ser mayor que 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setCalculating(true);
    try {
      const calculationResult = await calculateKwConsumption(input);
      setResult(calculationResult);
    } catch (error) {
      console.error("Error al calcular:", error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("Ocurrió un error al calcular");
      }
    } finally {
      setCalculating(false);
    }
  };

  // Formatear números para la visualización con manejo seguro de nulos
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) {
      return "0.00";
    }
    try {
      return num.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error("Error al formatear número:", error);
      return num.toFixed(2);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calculadora de Presupuestos 3D</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calcula el coste y precio de venta para tus piezas impresas en 3D
          </p>
        </div>
        <div>
          <Link
            href="/projects"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Volver al projectos
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Datos de la Impresora</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Selección de impresora predefinida */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Modelo de Impresora
                </label>
                <select
                  name="printerModel"
                  value={selectedPrinter}
                  onChange={handlePrinterChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                >
                  {COMMON_PRINTERS.map((printer) => (
                    <option key={printer.id} value={printer.id}>
                      {printer.name} ({printer.consumption} kW)
                    </option>
                  ))}
                </select>
              </div>

              {/* Consumo de la impresora */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Consumo (kW)
                </label>
                <input
                  type="number"
                  name="printerConsumption"
                  value={input.printerConsumption}
                  onChange={handleChange}
                  step="0.01"
                  disabled={selectedPrinter !== "custom"}
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.printerConsumption ? "border-red-500" : ""
                  } ${selectedPrinter !== "custom" ? "opacity-75" : ""}`}
                />
                {errors.printerConsumption && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.printerConsumption}
                  </p>
                )}
              </div>

              {/* Horas de uso por día */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Horas de uso por día
                </label>
                <input
                  type="number"
                  name="hoursPerDay"
                  value={input.hoursPerDay}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.5"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.hoursPerDay ? "border-red-500" : ""
                  }`}
                />
                {errors.hoursPerDay && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.hoursPerDay}
                  </p>
                )}
              </div>

              {/* Días de uso por mes */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Días de uso por mes
                </label>
                <input
                  type="number"
                  name="daysPerMonth"
                  value={input.daysPerMonth}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  className={`w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 ${
                    errors.daysPerMonth ? "border-red-500" : ""
                  }`}
                />
                {errors.daysPerMonth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.daysPerMonth}
                  </p>
                )}
              </div>

              {/* Costo de energía */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Costo de energía (ARS/kWh)
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
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50"
              >
                {calculating ? "Calculando..." : "Calcular Consumo"}
              </button>
            </div>
          </form>
        </div>

        {/* Resultados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>

          {result ? (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="font-medium text-lg mb-2">
                  {input.printerName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Consumo: {input.printerConsumption} kW | Uso:{" "}
                  {input.hoursPerDay} h/día, {input.daysPerMonth} días/mes
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Consumo Energético</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Diario
                      </p>
                      <p className="font-semibold">
                        {formatNumber(result.dailyConsumption)} kWh
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mensual
                      </p>
                      <p className="font-semibold">
                        {formatNumber(result.monthlyConsumption)} kWh
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anual
                      </p>
                      <p className="font-semibold">
                        {formatNumber(result.yearlyConsumption)} kWh
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Costo Estimado</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Diario
                      </p>
                      <p className="font-semibold">
                        ${formatNumber(result.dailyCost)} ARS
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mensual
                      </p>
                      <p className="font-semibold">
                        ${formatNumber(result.monthlyCost)} ARS
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anual
                      </p>
                      <p className="font-semibold">
                        ${formatNumber(result.yearlyCost)} ARS
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Nota:</strong> Estos cálculos son estimaciones basadas
                  en el consumo nominal y las horas de uso. El consumo real
                  puede variar dependiendo de factores como la temperatura de
                  impresión, el tipo de material, y otras variables.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="mb-4">
                Completa el formulario y haz clic en calcular para ver los
                resultados.
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/calculator"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ir a la calculadora de presupuesto para impresión 3D
        </Link>
      </div>
    </div>
  );
}
