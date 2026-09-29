import { describe, expect, it } from 'vitest';
import { cardArt, colors, elevation, fontAssets, motion, radius, space, typography } from '../src/index.js';

describe('generated tokens', () => {
  it('carries both modes for every semantic colour', () => {
    expect(colors.dark.bg.canvas).toBe('#0B0B0C');
    expect(colors.light.bg.canvas).toBe('#F6F3EC');
    expect(colors.dark.accent.primary).toBe('#3DF58A');
    expect(colors.light.status.danger.subtle).toBe('#FBE6E4');
    expect(colors.light.status.danger.base).toBe('#BA2C29');
  });
  it('rounds design weights to React Native weights, half-steps down', () => {
    expect(typography.title.l.designWeight).toBe(650);
    expect(typography.title.l.fontWeight).toBe('600');
    expect(typography.label.m.designWeight).toBe(590);
    expect(typography.label.m.fontWeight).toBe('600');
    expect(typography.display.xl.fontWeight).toBe('700');
  });
  it('maps families to expo-font asset keys and leaves the system font undefined', () => {
    expect(typography.display.xl.fontFamily).toBe('InterTight-Bold');
    expect(typography.mono.l.fontFamily).toBe('JetBrainsMono-Medium');
    expect(Object.hasOwn(typography.body.l, 'fontFamily')).toBe(false);
    expect([...fontAssets]).toEqual(['InterTight-Bold', 'InterTight-SemiBold', 'JetBrainsMono-Medium']);
  });
  it('keeps the 4pt grid, radii, elevation and motion values', () => {
    expect(space[4]).toBe(16);
    expect(space.gutter).toBe(16);
    expect(radius.card).toBe(16);
    expect(elevation.dark[0]).toEqual([]);
    expect(elevation.light[2]).toHaveLength(2);
    expect(motion.slow).toBe(320);
    expect(motion.spring.sheet.stiffness).toBe(420);
  });
  it('has eight card colours with ink', () => {
    expect(cardArt).toHaveLength(8);
    expect(cardArt[2]?.name).toBe('Brass');
    expect(cardArt[2]?.ink).toBe('#1A1206');
  });
});
