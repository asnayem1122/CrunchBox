import {
  calculateLoanEmi,
  calculateTipAndSplit,
  calculateDiscountAndTax,
  calculateBmi,
} from '../../src/features/tools/financialFormulas';

describe('Financial Formulas - Precision & Mandatory Guards', () => {
  describe('calculateLoanEmi', () => {
    it('calculates standard compound loan EMI (10,000 at 12% for 12 months)', () => {
      const { monthlyEmi, totalInterest, totalPayment } = calculateLoanEmi(
        10000,
        12,
        12
      );
      // Standard EMI for 10000, 12% annual, 12 mo is ~888.49
      expect(monthlyEmi).toBeCloseTo(888.49, 1);
      expect(totalPayment).toBeCloseTo(10661.85, 1);
      expect(totalInterest).toBeCloseTo(661.85, 1);
    });

    it('safely handles 0% interest loans without NaN (principal / tenureMonths)', () => {
      const { monthlyEmi, totalInterest, totalPayment } = calculateLoanEmi(
        12000,
        0,
        12
      );
      expect(monthlyEmi).toBe(1000);
      expect(totalInterest).toBe(0);
      expect(totalPayment).toBe(12000);
    });

    it('guards against non-positive principal or tenure months', () => {
      expect(calculateLoanEmi(0, 10, 12)).toEqual({
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0,
      });
      expect(calculateLoanEmi(10000, 10, 0)).toEqual({
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0,
      });
      expect(calculateLoanEmi(-5000, 10, 12)).toEqual({
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0,
      });
    });
  });

  describe('calculateTipAndSplit', () => {
    it('calculates tip and split bill across guests ($100, 15% tip, 2 guests)', () => {
      const { tipAmount, totalBill, perPersonTotal, perPersonTip, guests } =
        calculateTipAndSplit(100, 15, 2);
      expect(tipAmount).toBe(15);
      expect(totalBill).toBe(115);
      expect(perPersonTotal).toBe(57.5);
      expect(perPersonTip).toBe(7.5);
      expect(guests).toBe(2);
    });

    it('clamps guest count to at least 1 when 0 or negative guests provided', () => {
      const res1 = calculateTipAndSplit(100, 20, 0);
      expect(res1.guests).toBe(1);
      expect(res1.perPersonTotal).toBe(120);

      const res2 = calculateTipAndSplit(100, 20, -3);
      expect(res2.guests).toBe(1);
    });

    it('returns zero for non-positive bills', () => {
      const res = calculateTipAndSplit(0, 15, 2);
      expect(res.totalBill).toBe(0);
      expect(res.tipAmount).toBe(0);
    });
  });

  describe('calculateDiscountAndTax', () => {
    it('calculates discount and sales tax correctly ($100 with 20% discount, 10% tax)', () => {
      const {
        discountAmount,
        priceAfterDiscount,
        taxAmount,
        finalPrice,
        totalSavings,
      } = calculateDiscountAndTax(100, 20, 10);
      expect(discountAmount).toBe(20);
      expect(priceAfterDiscount).toBe(80);
      expect(taxAmount).toBe(8); // 10% of 80
      expect(finalPrice).toBe(88);
      expect(totalSavings).toBe(20);
    });

    it('handles zero discount and zero tax', () => {
      const res = calculateDiscountAndTax(150, 0, 0);
      expect(res.finalPrice).toBe(150);
      expect(res.discountAmount).toBe(0);
      expect(res.taxAmount).toBe(0);
    });

    it('returns zeros for non-positive original price', () => {
      const res = calculateDiscountAndTax(-100, 20, 10);
      expect(res.finalPrice).toBe(0);
    });
  });

  describe('calculateBmi', () => {
    it('categorizes normal BMI (70kg, 175cm -> BMI 22.9)', () => {
      const { bmi, category } = calculateBmi(70, 175);
      expect(bmi).toBe(22.9);
      expect(category).toBe('normal');
    });

    it('categorizes underweight BMI (50kg, 175cm -> BMI 16.3)', () => {
      const { bmi, category } = calculateBmi(50, 175);
      expect(bmi).toBe(16.3);
      expect(category).toBe('underweight');
    });

    it('categorizes overweight BMI (85kg, 175cm -> BMI 27.8)', () => {
      const { bmi, category } = calculateBmi(85, 175);
      expect(bmi).toBe(27.8);
      expect(category).toBe('overweight');
    });

    it('categorizes obese BMI (105kg, 175cm -> BMI 34.3)', () => {
      const { bmi, category } = calculateBmi(105, 175);
      expect(bmi).toBe(34.3);
      expect(category).toBe('obese');
    });

    it('returns unknown for zero or negative height/weight', () => {
      expect(calculateBmi(0, 175).category).toBe('unknown');
      expect(calculateBmi(70, 0).category).toBe('unknown');
    });
  });
});
