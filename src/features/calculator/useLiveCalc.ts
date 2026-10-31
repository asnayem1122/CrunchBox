import { useMemo } from 'react';
import {
  evaluateExpression,
  formatCalcNumber,
  AngleMode,
} from './calcEngine';

const INCOMPLETE_FN_PREFIXES = [
  'sin(',
  'cos(',
  'tan(',
  'asin(',
  'acos(',
  'atan(',
  'log(',
  'ln(',
  'sqrt(',
  'cbrt(',
  'abs(',
];

/**
 * Sanitizes an incomplete calculator expression for 0ms speculative evaluation.
 * Follows Guardrail 1: Gracefully handles trailing open function prefixes (sin(, log(, sqrt()
 * by returning null rather than evaluating empty parentheses ().
 */
export function sanitizeIncompleteExpression(expr: string): string | null {
  const clean = expr.trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();
  for (const fn of INCOMPLETE_FN_PREFIXES) {
    if (lower.endsWith(fn)) {
      return null;
    }
  }

  // Strip trailing binary operators and whitespace
  let s = clean.replace(/[\+\-\*\/\^×÷−CP\s]+$/, '');
  if (!s) return null;

  // Re-check trailing function prefixes after stripping trailing operators
  const sLower = s.toLowerCase();
  for (const fn of INCOMPLETE_FN_PREFIXES) {
    if (sLower.endsWith(fn)) {
      return null;
    }
  }

  // If ends with dangling open paren e.g. "5 + ("
  if (s.endsWith('(')) {
    return null;
  }

  // Balance unclosed parentheses
  let openCount = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') openCount++;
    else if (s[i] === ')') openCount--;
  }

  if (openCount < 0) {
    return null;
  }

  if (openCount > 0) {
    s = s + ')'.repeat(openCount);
  }

  return s;
}

export interface LiveCalcResult {
  liveAnswer: string | null;
}

export function useLiveCalc(
  expression: string,
  angleMode: AngleMode = 'deg'
): LiveCalcResult {
  return useMemo(() => {
    const sanitized = sanitizeIncompleteExpression(expression);
    if (!sanitized) {
      return { liveAnswer: null };
    }

    const hasOperation =
      /[\+\-\*\/\^×÷−!%CP]|sin|cos|tan|log|ln|sqrt|cbrt|abs/i.test(expression);

    if (!hasOperation) {
      return { liveAnswer: null };
    }

    const { result, error } = evaluateExpression(sanitized, angleMode);
    if (error || Number.isNaN(result) || !Number.isFinite(result)) {
      return { liveAnswer: null };
    }

    return { liveAnswer: formatCalcNumber(result) };
  }, [expression, angleMode]);
}
