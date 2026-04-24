import type { TreeVariant } from '../types';

export interface TreePalette {
  trunkShadow: string;
  trunkDark: string;
  trunk: string;
  trunkLt: string;
  bark: string;
  leafDeep: string;
  leafDark: string;
  leaf: string;
  leafMid: string;
  leafLt: string;
  leafHi: string;
  leafSpec: string;
  glow: string;
}

export const TreePalettes: Record<TreeVariant, TreePalette> = {
  green: {
    trunkShadow: '#140a04',
    trunkDark: '#2a180c',
    trunk: '#4a2f18',
    trunkLt: '#6e4622',
    bark: '#3a2112',
    leafDeep: '#0d2a12',
    leafDark: '#1a4020',
    leaf: '#2a6026',
    leafMid: '#458838',
    leafLt: '#6bb046',
    leafHi: '#9ed865',
    leafSpec: '#d4ec9e',
    glow: 'rgba(112, 200, 90, 0.35)',
  },
  blossom: {
    trunkShadow: '#14090a',
    trunkDark: '#2a1810',
    trunk: '#4a2f20',
    trunkLt: '#6a4530',
    bark: '#3a2418',
    leafDeep: '#4a1034',
    leafDark: '#7a2055',
    leaf: '#b03d80',
    leafMid: '#d760a0',
    leafLt: '#f48ac0',
    leafHi: '#fbb5d5',
    leafSpec: '#ffe1ee',
    glow: 'rgba(247, 138, 192, 0.35)',
  },
  autumn: {
    trunkShadow: '#180c04',
    trunkDark: '#2a1808',
    trunk: '#4a2a10',
    trunkLt: '#6a3e20',
    bark: '#3a1e08',
    leafDeep: '#4a1204',
    leafDark: '#7a2208',
    leaf: '#b8380c',
    leafMid: '#d85a18',
    leafLt: '#f28628',
    leafHi: '#ffb848',
    leafSpec: '#ffe28a',
    glow: 'rgba(255, 140, 66, 0.45)',
  },
  winter: {
    trunkShadow: '#080408',
    trunkDark: '#1a1008',
    trunk: '#3a2218',
    trunkLt: '#4e2f22',
    bark: '#2a1812',
    leafDeep: '#a8b8cc',
    leafDark: '#c4d2e0',
    leaf: '#dce6ee',
    leafMid: '#eaf0f6',
    leafLt: '#f6f9fc',
    leafHi: '#ffffff',
    leafSpec: '#ffffff',
    glow: 'rgba(200, 220, 240, 0.35)',
  },
};

export function variantForStreak(streak: number): TreeVariant {
  if (streak >= 50) return 'winter';
  if (streak >= 25) return 'autumn';
  if (streak >= 10) return 'blossom';
  return 'green';
}
