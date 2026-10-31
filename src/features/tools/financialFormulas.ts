export interface LoanEmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
}

export interface TipSplitResult {
  tipAmount: number;
  totalBill: number;
  perPersonTotal: number;
  perPersonTip: number;
  guests: number;
}

export interface DiscountTaxResult {
  discountAmount: number;
  priceAfterDiscount: number;
  taxAmount: number;
  finalPrice: number;
  totalSavings: number;
}

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese' | 'unknown';

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  categoryLabelEn: string;
  categoryLabelBn: string;
}

/**
 * Calculates monthly loan EMI with strict zero-interest & zero-input guards.
 * If annualRatePercent === 0, returns linear monthlyEmi = principal / tenureMonths.
 */
export function calculateLoanEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): LoanEmiResult {
  if (
    Number.isNaN(principal) ||
    Number.isNaN(annualRatePercent) ||
    Number.isNaN(tenureMonths) ||
    principal <= 0 ||
    tenureMonths <= 0
  ) {
    return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0 };
  }

  // Mandatory Guard: Zero Interest Rate
  if (annualRatePercent === 0) {
    const monthlyEmi = principal / tenureMonths;
    return {
      monthlyEmi: parseFloat(monthlyEmi.toFixed(2)),
      totalInterest: 0,
      totalPayment: principal,
    };
  }

  // Compound EMI calculation
  const monthlyRate = annualRatePercent / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    monthlyEmi: parseFloat(monthlyEmi.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
  };
}

/**
 * Calculates tip and bill split, clamping numGuests to at least 1.
 */
export function calculateTipAndSplit(
  bill: number,
  tipPercent: number,
  numGuests: number
): TipSplitResult {
  const guests = Math.max(1, Math.round(Number.isNaN(numGuests) ? 1 : numGuests));

  if (Number.isNaN(bill) || bill <= 0) {
    return {
      tipAmount: 0,
      totalBill: 0,
      perPersonTotal: 0,
      perPersonTip: 0,
      guests,
    };
  }

  const safeTipPercent = Math.max(0, Number.isNaN(tipPercent) ? 0 : tipPercent);
  const tipAmount = bill * (safeTipPercent / 100);
  const totalBill = bill + tipAmount;
  const perPersonTotal = totalBill / guests;
  const perPersonTip = tipAmount / guests;

  return {
    tipAmount: parseFloat(tipAmount.toFixed(2)),
    totalBill: parseFloat(totalBill.toFixed(2)),
    perPersonTotal: parseFloat(perPersonTotal.toFixed(2)),
    perPersonTip: parseFloat(perPersonTip.toFixed(2)),
    guests,
  };
}

/**
 * Calculates discount and sales tax on a purchase.
 */
export function calculateDiscountAndTax(
  originalPrice: number,
  discountPercent: number,
  taxPercent: number
): DiscountTaxResult {
  if (Number.isNaN(originalPrice) || originalPrice <= 0) {
    return {
      discountAmount: 0,
      priceAfterDiscount: 0,
      taxAmount: 0,
      finalPrice: 0,
      totalSavings: 0,
    };
  }

  const safeDiscount = Math.max(0, Math.min(100, Number.isNaN(discountPercent) ? 0 : discountPercent));
  const safeTax = Math.max(0, Number.isNaN(taxPercent) ? 0 : taxPercent);

  const discountAmount = originalPrice * (safeDiscount / 100);
  const priceAfterDiscount = Math.max(0, originalPrice - discountAmount);
  const taxAmount = priceAfterDiscount * (safeTax / 100);
  const finalPrice = priceAfterDiscount + taxAmount;

  return {
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    priceAfterDiscount: parseFloat(priceAfterDiscount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    totalSavings: parseFloat(discountAmount.toFixed(2)),
  };
}

/**
 * Calculates Body Mass Index (BMI) and health category.
 */
export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  if (
    Number.isNaN(weightKg) ||
    Number.isNaN(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return {
      bmi: 0,
      category: 'unknown',
      categoryLabelEn: 'Unknown',
      categoryLabelBn: 'অজানা',
    };
  }

  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = parseFloat(rawBmi.toFixed(1));

  let category: BmiCategory = 'normal';
  let categoryLabelEn = 'Normal Weight';
  let categoryLabelBn = 'স্বাভাবিক ওজন';

  if (bmi < 18.5) {
    category = 'underweight';
    categoryLabelEn = 'Underweight';
    categoryLabelBn = 'কম ওজন';
  } else if (bmi < 25) {
    category = 'normal';
    categoryLabelEn = 'Normal Weight';
    categoryLabelBn = 'স্বাভাবিক ওজন';
  } else if (bmi < 30) {
    category = 'overweight';
    categoryLabelEn = 'Overweight';
    categoryLabelBn = 'অতিরিক্ত ওজন';
  } else {
    category = 'obese';
    categoryLabelEn = 'Obese';
    categoryLabelBn = 'স্থূলতা';
  }

  return { bmi, category, categoryLabelEn, categoryLabelBn };
}
