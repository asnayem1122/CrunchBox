import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SwapButton } from '../../components/ui/SwapButton';
import { useAppStore } from '../../store/useAppStore';
import {
  UNIT_DEFINITIONS,
  UnitCategory,
  convertUnitValue,
} from './unitDefinitions';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface UnitConverterViewProps {
  themeMode?: ThemeMode;
}

const CATEGORIES: UnitCategory[] = [
  'AREA',
  'LENGTH',
  'WEIGHT',
  'TEMP',
  'DATA',
  'SPEED',
];

export const UnitConverterView: React.FC<UnitConverterViewProps> = ({
  themeMode = 'field',
}) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const {
    unitCategory,
    setUnitCategory,
    fromUnit,
    toUnit,
    setUnits,
    swapUnits,
    unitAmount,
    setUnitAmount,
    language,
  } = useAppStore();

  const currentCatMeta = UNIT_DEFINITIONS[unitCategory];
  const unitsList = currentCatMeta?.units || [];

  // Compute live conversion result
  const { convertedValue, formulaSubtitle } = useMemo(() => {
    const val = parseFloat(unitAmount.replace(/,/g, '')) || 0;
    const res = convertUnitValue(val, fromUnit, toUnit, unitCategory);

    // Reference formula: 1 FromUnit = X ToUnit
    const unit1Res = convertUnitValue(1, fromUnit, toUnit, unitCategory);
    const fromDef = unitsList.find((u) => u.id === fromUnit);
    const toDef = unitsList.find((u) => u.id === toUnit);

    const fromName = fromDef
      ? language === 'bn'
        ? fromDef.nameBn
        : fromDef.nameEn
      : fromUnit;
    const toName = toDef
      ? language === 'bn'
        ? toDef.nameBn
        : toDef.nameEn
      : toUnit;

    const formula = `1 ${fromName} = ${unit1Res} ${toName}`;

    return { convertedValue: res.toString(), formulaSubtitle: formula };
  }, [unitAmount, fromUnit, toUnit, unitCategory, unitsList, language]);

  const handleSelectCategory = (cat: UnitCategory) => {
    triggerTactileFeedback();
    setUnitCategory(cat);
  };

  const handleSelectFrom = (id: string) => {
    triggerTactileFeedback();
    setUnits(id, toUnit);
  };

  const handleSelectTo = (id: string) => {
    triggerTactileFeedback();
    setUnits(fromUnit, id);
  };

  return (
    <View style={styles.container}>
      {/* 1. 6-Category Horizontal Tactile Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((catKey) => {
          const isActive = unitCategory === catKey;
          const meta = UNIT_DEFINITIONS[catKey];
          const label = language === 'bn' ? meta.nameBn : meta.nameEn;

          return (
            <Pressable
              key={catKey}
              onPress={() => handleSelectCategory(catKey)}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isActive ? tokens.accentOps : tokens.keypadSurface,
                  borderColor: tokens.borderVisible || tokens.inkBorder,
                  borderWidth: 1.8,
                  borderRadius: hardwareConstants.borderRadiusSm,
                  borderBottomWidth: isActive ? 1.8 : 3.5,
                  transform: [{ translateY: isActive ? 1.5 : 0 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color: isActive ? tokens.keycapOperatorText : tokens.keycapNumberText,
                    fontWeight: isActive ? '900' : '700',
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 2. "FROM" Unit Card */}
      <View
        style={[
          styles.unitCard,
          {
            backgroundColor: tokens.innerPanel,
            borderColor: tokens.borderVisible || tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
          },
        ]}
      >
        <Text style={[styles.cardHeaderLabel, { color: tokens.textSecondary }]}>
          {t('units.from', 'FROM')}
        </Text>

        {/* Units Chips Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.unitChipsScroll}
        >
          {unitsList.map((u) => {
            const isSelected = u.id === fromUnit;
            const displayName = language === 'bn' ? u.nameBn : u.nameEn;
            return (
              <Pressable
                key={u.id}
                onPress={() => handleSelectFrom(u.id)}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                    borderColor: tokens.borderVisible || tokens.inkBorder,
                    borderWidth: 1.5,
                    borderRadius: 4,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    {
                      color: isSelected ? tokens.keycapOperatorText : tokens.keycapNumberText,
                      fontWeight: isSelected ? '900' : '600',
                    },
                  ]}
                >
                  {displayName} ({u.symbol})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Input Amount */}
        <View style={styles.inputRow}>
          <TextInput
            value={unitAmount}
            onChangeText={setUnitAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={tokens.textMuted}
            style={[styles.numericInput, { color: tokens.textPrimary }]}
            selectTextOnFocus
          />
        </View>
      </View>

      {/* 3. Middle Swap Button */}
      <View style={styles.swapRow}>
        <SwapButton onPress={swapUnits} themeMode={themeMode} size={42} />
      </View>

      {/* 4. "TO" Unit Card */}
      <View
        style={[
          styles.unitCard,
          {
            backgroundColor: tokens.innerPanel,
            borderColor: tokens.borderVisible || tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
          },
        ]}
      >
        <Text style={[styles.cardHeaderLabel, { color: tokens.textSecondary }]}>
          {t('units.to', 'TO')}
        </Text>

        {/* Units Chips Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.unitChipsScroll}
        >
          {unitsList.map((u) => {
            const isSelected = u.id === toUnit;
            const displayName = language === 'bn' ? u.nameBn : u.nameEn;
            return (
              <Pressable
                key={u.id}
                onPress={() => handleSelectTo(u.id)}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                    borderColor: tokens.borderVisible || tokens.inkBorder,
                    borderWidth: 1.5,
                    borderRadius: 4,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    {
                      color: isSelected ? tokens.keycapOperatorText : tokens.keycapNumberText,
                      fontWeight: isSelected ? '900' : '600',
                    },
                  ]}
                >
                  {displayName} ({u.symbol})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Output Result */}
        <View style={styles.inputRow}>
          <Text
            style={[styles.numericOutput, { color: tokens.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {convertedValue}
          </Text>
        </View>
      </View>

      {/* 5. Reference Formula & Land Note */}
      <View style={styles.footerFormulaBox}>
        <Text
          style={[styles.formulaText, { color: tokens.textSecondary }]}
          numberOfLines={1}
        >
          {formulaSubtitle}
        </Text>
        {unitCategory === 'AREA' ? (
          <Text style={[styles.landNoteText, { color: tokens.textMuted }]}>
            {t('units.land_units_note', 'Includes regional South Asian Bigha, Katha & Decimal')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  categoryTab: {
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  unitCard: {
    padding: 10,
    marginVertical: 4,
  },
  cardHeaderLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 6,
  },
  unitChipsScroll: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 2,
    marginBottom: 8,
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unitChipText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  inputRow: {
    paddingVertical: 4,
  },
  numericInput: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
    padding: 0,
  },
  numericOutput: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  swapRow: {
    alignItems: 'center',
    marginVertical: 2,
  },
  footerFormulaBox: {
    padding: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  formulaText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  landNoteText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
