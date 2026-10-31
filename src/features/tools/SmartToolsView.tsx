import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  calculateTipAndSplit,
  calculateDiscountAndTax,
  calculateLoanEmi,
  calculateBmi,
} from './financialFormulas';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface SmartToolsViewProps {
  themeMode?: ThemeMode;
}

type ToolTab = 'tip' | 'discount' | 'loan' | 'bmi';

export const SmartToolsView: React.FC<SmartToolsViewProps> = ({
  themeMode = 'field',
}) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);
  const [activeTab, setActiveTab] = useState<ToolTab>('tip');

  // Tip/Split state
  const [tipBill, setTipBill] = useState<string>('120');
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [tipGuests, setTipGuests] = useState<number>(2);

  // Discount/Tax state
  const [discPrice, setDiscPrice] = useState<string>('250');
  const [discPercent, setDiscPercent] = useState<number>(20);
  const [discTax, setDiscTax] = useState<number>(7.5);

  // Loan EMI state
  const [loanPrincipal, setLoanPrincipal] = useState<string>('50000');
  const [loanRate, setLoanRate] = useState<string>('10.5');
  const [loanTenure, setLoanTenure] = useState<string>('36');

  // BMI state
  const [bmiWeight, setBmiWeight] = useState<string>('72');
  const [bmiHeight, setBmiHeight] = useState<string>('175');

  // Calculations
  const tipResult = useMemo(() => {
    const bill = parseFloat(tipBill) || 0;
    return calculateTipAndSplit(bill, tipPercent, tipGuests);
  }, [tipBill, tipPercent, tipGuests]);

  const discResult = useMemo(() => {
    const price = parseFloat(discPrice) || 0;
    return calculateDiscountAndTax(price, discPercent, discTax);
  }, [discPrice, discPercent, discTax]);

  const loanResult = useMemo(() => {
    const p = parseFloat(loanPrincipal) || 0;
    const r = parseFloat(loanRate) || 0;
    const n = parseInt(loanTenure, 10) || 0;
    return calculateLoanEmi(p, r, n);
  }, [loanPrincipal, loanRate, loanTenure]);

  const bmiResult = useMemo(() => {
    const w = parseFloat(bmiWeight) || 0;
    const h = parseFloat(bmiHeight) || 0;
    return calculateBmi(w, h);
  }, [bmiWeight, bmiHeight]);

  const handleTabChange = (tab: ToolTab) => {
    triggerTactileFeedback();
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Sub-Tab Navigation Bar */}
      <View
        style={[
          styles.tabsRow,
          {
            backgroundColor: tokens.innerPanel,
            borderColor: tokens.inkBorder,
            borderWidth: 1.8,
            borderRadius: hardwareConstants.borderRadiusSm,
          },
        ]}
      >
        <Pressable
          onPress={() => handleTabChange('tip')}
          style={[
            styles.tabItem,
            activeTab === 'tip' && {
              backgroundColor: tokens.accentOps,
              borderColor: tokens.inkBorder,
              borderWidth: 1.5,
              borderRadius: 4,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: tokens.inkBorder, fontWeight: activeTab === 'tip' ? '900' : '700' },
            ]}
          >
            {t('tools.tabs.tip', 'TIP & SPLIT')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('discount')}
          style={[
            styles.tabItem,
            activeTab === 'discount' && {
              backgroundColor: tokens.accentOps,
              borderColor: tokens.inkBorder,
              borderWidth: 1.5,
              borderRadius: 4,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: tokens.inkBorder, fontWeight: activeTab === 'discount' ? '900' : '700' },
            ]}
          >
            {t('tools.tabs.discount', 'DISCOUNT & TAX')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('loan')}
          style={[
            styles.tabItem,
            activeTab === 'loan' && {
              backgroundColor: tokens.accentOps,
              borderColor: tokens.inkBorder,
              borderWidth: 1.5,
              borderRadius: 4,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: tokens.inkBorder, fontWeight: activeTab === 'loan' ? '900' : '700' },
            ]}
          >
            {t('tools.tabs.loan', 'LOAN EMI')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('bmi')}
          style={[
            styles.tabItem,
            activeTab === 'bmi' && {
              backgroundColor: tokens.accentOps,
              borderColor: tokens.inkBorder,
              borderWidth: 1.5,
              borderRadius: 4,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: tokens.inkBorder, fontWeight: activeTab === 'bmi' ? '900' : '700' },
            ]}
          >
            {t('tools.tabs.bmi', 'BMI GAUGE')}
          </Text>
        </Pressable>
      </View>

      {/* SUB-DECK 1: TIP & SPLIT */}
      {activeTab === 'tip' ? (
        <View style={styles.deckContent}>
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>
              {t('tools.tip.bill_amount', 'BILL AMOUNT')}
            </Text>
            <TextInput
              value={tipBill}
              onChangeText={setTipBill}
              keyboardType="numeric"
              style={[styles.fieldInput, { color: tokens.textPrimary }]}
            />

            <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginTop: 10 }]}>
              {t('tools.tip.tip_percentage', 'TIP PERCENT')}: {tipPercent}%
            </Text>
            <View style={styles.presetsRow}>
              {[0, 10, 15, 20, 25].map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setTipPercent(p)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: tipPercent === p ? tokens.accentOps : tokens.keypadSurface,
                      borderColor: tokens.inkBorder,
                      borderWidth: 1.5,
                      borderRadius: 4,
                    },
                  ]}
                >
                  <Text style={[styles.presetText, { color: tokens.inkBorder }]}>{p}%</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginTop: 10 }]}>
              {t('tools.tip.guest_count', 'GUEST COUNT')}: {tipGuests}
            </Text>
            <View style={styles.stepperRow}>
              <Pressable
                onPress={() => setTipGuests((g) => Math.max(1, g - 1))}
                style={[styles.stepperBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.inkBorder }]}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Text style={[styles.stepperValueText, { color: tokens.textPrimary }]}>{tipGuests}</Text>
              <Pressable
                onPress={() => setTipGuests((g) => g + 1)}
                style={[styles.stepperBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.inkBorder }]}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Result Summary */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: tokens.chassisSurface,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.tip.per_person_total', 'Per Person Total')}:</Text>
              <Text style={styles.summaryValueBig}>${tipResult.perPersonTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.tip.per_person_tip', 'Per Person Tip')}:</Text>
              <Text style={styles.summaryValueLight}>${tipResult.perPersonTip.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.tip.grand_total', 'Total Bill')}:</Text>
              <Text style={styles.summaryValueLight}>${tipResult.totalBill.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* SUB-DECK 2: DISCOUNT & TAX */}
      {activeTab === 'discount' ? (
        <View style={styles.deckContent}>
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>
              {t('tools.discount.original_price', 'ORIGINAL PRICE')}
            </Text>
            <TextInput
              value={discPrice}
              onChangeText={setDiscPrice}
              keyboardType="numeric"
              style={[styles.fieldInput, { color: tokens.textPrimary }]}
            />

            <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginTop: 10 }]}>
              {t('tools.discount.discount_percent', 'DISCOUNT %')}: {discPercent}%
            </Text>
            <View style={styles.presetsRow}>
              {[5, 10, 20, 30, 50].map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setDiscPercent(p)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: discPercent === p ? tokens.accentOps : tokens.keypadSurface,
                      borderColor: tokens.inkBorder,
                      borderWidth: 1.5,
                      borderRadius: 4,
                    },
                  ]}
                >
                  <Text style={[styles.presetText, { color: tokens.inkBorder }]}>{p}%</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginTop: 10 }]}>
              {t('tools.discount.tax_percent', 'TAX / VAT %')}
            </Text>
            <TextInput
              value={discTax.toString()}
              onChangeText={(v) => setDiscTax(parseFloat(v) || 0)}
              keyboardType="numeric"
              style={[styles.fieldInputSmall, { color: tokens.textPrimary }]}
            />
          </View>

          {/* Result Summary */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: tokens.chassisSurface,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.discount.final_price', 'Final Payable')}:</Text>
              <Text style={styles.summaryValueBig}>${discResult.finalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.discount.savings', 'Total Savings')}:</Text>
              <Text style={styles.summaryValueLight}>${discResult.totalSavings.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.discount.tax_amount', 'Tax Amount')}:</Text>
              <Text style={styles.summaryValueLight}>${discResult.taxAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* SUB-DECK 3: LOAN EMI */}
      {activeTab === 'loan' ? (
        <View style={styles.deckContent}>
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>
              {t('tools.loan.principal', 'LOAN PRINCIPAL')}
            </Text>
            <TextInput
              value={loanPrincipal}
              onChangeText={setLoanPrincipal}
              keyboardType="numeric"
              style={[styles.fieldInput, { color: tokens.textPrimary }]}
            />

            <View style={styles.dualInputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginTop: 10 }]}>
                  {t('tools.loan.interest_rate', 'ANNUAL INTEREST %')}
                </Text>
                <TextInput
                  value={loanRate}
                  onChangeText={setLoanRate}
                  keyboardType="numeric"
                  style={[styles.fieldInputSmall, { color: tokens.textPrimary }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary, marginTop: 10 }]}>
                  {t('tools.loan.tenure_months', 'TENURE (MONTHS)')}
                </Text>
                <TextInput
                  value={loanTenure}
                  onChangeText={setLoanTenure}
                  keyboardType="numeric"
                  style={[styles.fieldInputSmall, { color: tokens.textPrimary }]}
                />
              </View>
            </View>
          </View>

          {/* Result Summary */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: tokens.chassisSurface,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.loan.monthly_emi', 'Monthly EMI')}:</Text>
              <Text style={styles.summaryValueBig}>${loanResult.monthlyEmi.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.loan.total_interest', 'Total Interest')}:</Text>
              <Text style={styles.summaryValueLight}>${loanResult.totalInterest.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.loan.total_payable', 'Total Payable')}:</Text>
              <Text style={styles.summaryValueLight}>${loanResult.totalPayment.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* SUB-DECK 4: BMI GAUGE */}
      {activeTab === 'bmi' ? (
        <View style={styles.deckContent}>
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <View style={styles.dualInputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>
                  {t('tools.bmi.weight_kg', 'WEIGHT (KG)')}
                </Text>
                <TextInput
                  value={bmiWeight}
                  onChangeText={setBmiWeight}
                  keyboardType="numeric"
                  style={[styles.fieldInput, { color: tokens.textPrimary }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: tokens.textSecondary }]}>
                  {t('tools.bmi.height_cm', 'HEIGHT (CM)')}
                </Text>
                <TextInput
                  value={bmiHeight}
                  onChangeText={setBmiHeight}
                  keyboardType="numeric"
                  style={[styles.fieldInput, { color: tokens.textPrimary }]}
                />
              </View>
            </View>
          </View>

          {/* Result Summary */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: tokens.chassisSurface,
                borderColor: tokens.inkBorder,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.bmi.bmi_score', 'BMI SCORE')}:</Text>
              <Text style={styles.summaryValueBig}>{bmiResult.bmi}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelLight}>{t('tools.bmi.status', 'Health Status')}:</Text>
              <Text
                style={[
                  styles.summaryValueLight,
                  {
                    color:
                      bmiResult.category === 'normal'
                        ? '#4ADE80'
                        : tokens.accentOps,
                  },
                ]}
              >
                {bmiResult.categoryLabelEn}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  deckContent: {
    marginTop: 6,
    gap: 6,
  },
  inputCard: {
    padding: 12,
    borderRadius: 8,
  },
  fieldLabel: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    paddingVertical: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1B241E',
  },
  fieldInputSmall: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    paddingVertical: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1B241E',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '900',
  },
  stepperValueText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  dualInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabelLight: {
    color: '#F5F0E1',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  summaryValueBig: {
    color: '#FFFDF7',
    fontSize: 22,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  summaryValueLight: {
    color: '#FFFDF7',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
});
