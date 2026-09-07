/**
 * Utilidades de moneda para el sistema CliniControl
 * Moneda oficial: Bolivianos (Bs.)
 * Formato: Bs. 1.234,56 (separador de miles: punto, decimal: coma)
 */

export const CURRENCY = {
  code: 'BOB',
  symbol: 'Bs.',
  locale: 'es-BO',
} as const;

/**
 * Formatea un número a Bolivianos
 * @param value - Valor numérico a formatear
 * @param options - Opciones de formateo
 * @returns String formateado: "Bs. 1.234,56"
 */
export function formatBs(
  value: number | null | undefined,
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showSymbol = true, showDecimals = true, compact = false } = options;
  const num = Number(value ?? 0);

  if (compact && Math.abs(num) >= 1000) {
    const formatter = new Intl.NumberFormat(CURRENCY.locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });
    const formatted = formatter.format(num);
    return showSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
  }

  const formatter = new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
    useGrouping: true,
  });

  const formatted = formatter.format(num);
  return showSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
}

/**
 * Formatea un valor para input (sin símbolo, con 2 decimales)
 * @param value - Valor numérico
 * @returns String para input: "1234.56"
 */
export function formatBsInput(value: number | null | undefined): string {
  const num = Number(value ?? 0);
  return num.toFixed(2);
}

/**
 * Parse un string de input a número
 * @param value - String del input
 * @returns Número
 */
export function parseBsInput(value: string): number {
  const cleaned = value.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper corto para uso en componentes (compatibilidad con código existente)
 */
export const bs = (n: number | null | undefined): string => formatBs(n);

/**
 * Formato para totales grandes (ej: arqueo de caja)
 */
export function formatBsTotal(value: number | null | undefined): string {
  return formatBs(value, { showSymbol: true, showDecimals: true });
}

/**
 * Formato para montos en tablas/lists
 */
export function formatBsCompact(value: number | null | undefined): string {
  return formatBs(value, { showSymbol: true, showDecimals: true, compact: false });
}