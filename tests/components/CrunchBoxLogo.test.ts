import React from 'react';
import { CrunchBoxLogo } from '../../src/components/chassis/CrunchBoxLogo';

describe('CrunchBoxLogo Component', () => {
  it('is a defined React function component', () => {
    expect(typeof CrunchBoxLogo).toBe('function');
  });

  it('instantiates the "icon" variant without throwing', () => {
    const element = React.createElement(CrunchBoxLogo, {
      variant: 'icon',
      size: 120,
      lcdText: 'CB•09',
    });
    expect(element).toBeTruthy();
    expect(element.props.variant).toBe('icon');
    expect(element.props.size).toBe(120);
  });

  it('instantiates the "horizontal" nameplate variant without throwing', () => {
    const element = React.createElement(CrunchBoxLogo, {
      variant: 'horizontal',
      size: 100,
    });
    expect(element).toBeTruthy();
    expect(element.props.variant).toBe('horizontal');
  });

  it('instantiates the "stamp" paper tape stencil variant without throwing', () => {
    const element = React.createElement(CrunchBoxLogo, {
      variant: 'stamp',
      size: 80,
    });
    expect(element).toBeTruthy();
    expect(element.props.variant).toBe('stamp');
  });
});
