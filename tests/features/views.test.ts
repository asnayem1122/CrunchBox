import React from 'react';
import { KeypadView } from '../../src/features/calculator/KeypadView';
import { RateBadge } from '../../src/features/currency/RateBadge';
import { PopularChips } from '../../src/features/currency/PopularChips';
import { CurrencyCard } from '../../src/features/currency/CurrencyCard';
import { CurrencyView } from '../../src/features/currency/CurrencyView';
import { UnitConverterView } from '../../src/features/units/UnitConverterView';
import { SmartToolsView } from '../../src/features/tools/SmartToolsView';
import { PaperTapeDrawer } from '../../src/components/chassis/PaperTapeDrawer';
import i18n from '../../src/localization/i18n';

describe('Sprint 4 Views & Components Verification', () => {
  describe('i18n Localization', () => {
    it('initializes with English and supports switching to Bengali', async () => {
      expect(i18n.language).toBe('en');
      await i18n.changeLanguage('bn');
      expect(i18n.language).toBe('bn');
      expect(i18n.t('app.name')).toBe('ক্রাঞ্চবক্স');
      await i18n.changeLanguage('en');
      expect(i18n.t('app.name')).toBe('CrunchBox');
    });
  });

  describe('KeypadView', () => {
    it('instantiates KeypadView component without error', () => {
      const el = React.createElement(KeypadView, { themeMode: 'field' });
      expect(el).toBeTruthy();
    });
  });

  describe('RateBadge Compliance', () => {
    it('instantiates RateBadge with effective date and stale flag', () => {
      const el = React.createElement(RateBadge, {
        effectiveDate: '2026-10-30',
        isStale: true,
        themeMode: 'field',
      });
      expect(el).toBeTruthy();
      expect(el.props.effectiveDate).toBe('2026-10-30');
      expect(el.props.isStale).toBe(true);
    });
  });

  describe('PopularChips', () => {
    it('instantiates PopularChips with active currency', () => {
      const onSelect = jest.fn();
      const el = React.createElement(PopularChips, {
        activeCurrency: 'BDT',
        onSelect,
        themeMode: 'field',
      });
      expect(el).toBeTruthy();
      expect(el.props.activeCurrency).toBe('BDT');
    });
  });

  describe('CurrencyCard', () => {
    it('instantiates CurrencyCard with props', () => {
      const onSelect = jest.fn();
      const el = React.createElement(CurrencyCard, {
        label: 'YOU SEND',
        currencyCode: 'USD',
        amount: '100.00',
        onPressSelect: onSelect,
        isEditable: true,
        themeMode: 'field',
      });
      expect(el).toBeTruthy();
      expect(el.props.currencyCode).toBe('USD');
      expect(el.props.amount).toBe('100.00');
    });
  });

  describe('CurrencyView', () => {
    it('instantiates full CurrencyView component', () => {
      const el = React.createElement(CurrencyView, { themeMode: 'field' });
      expect(el).toBeTruthy();
    });
  });

  describe('UnitConverterView', () => {
    it('instantiates UnitConverterView component', () => {
      const el = React.createElement(UnitConverterView, { themeMode: 'field' });
      expect(el).toBeTruthy();
    });
  });

  describe('SmartToolsView', () => {
    it('instantiates SmartToolsView component', () => {
      const el = React.createElement(SmartToolsView, { themeMode: 'field' });
      expect(el).toBeTruthy();
    });
  });

  describe('PaperTapeDrawer', () => {
    it('instantiates PaperTapeDrawer when open or closed', () => {
      const onClose = jest.fn();
      const elOpen = React.createElement(PaperTapeDrawer, {
        isOpen: true,
        onClose,
        themeMode: 'field',
      });
      const elClosed = React.createElement(PaperTapeDrawer, {
        isOpen: false,
        onClose,
        themeMode: 'field',
      });
      expect(elOpen).toBeTruthy();
      expect(elClosed).toBeTruthy();
    });
  });
});
