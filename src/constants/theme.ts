export const colors = {
  // Brand
  primary:      '#FF5A3C',
  primaryDark:  '#ED401E',
  primarySoft:  '#FFE0D5',
  primaryTint:  '#FFF1ED',
  accent:       '#FFC23C',
  accentStrong: '#F5A800',

  // Ink (warm neutrals)
  text:         '#17140F',
  textBody:     '#241F18',
  textMuted:    '#79705F',
  textSubtle:   '#A99E8C',
  textOnDark:   '#FAF6EF',

  // Surfaces
  background:   '#FFFBF5',
  surface:      '#FAF6EF',
  surfaceCard:  '#FFFFFF',
  surfaceSunken:'#F2ECE2',

  // Borders
  border:        '#E7E0D5',
  borderDefault: '#D2C9BA',

  // Status
  danger:      '#E0322B',
  dangerSoft:  '#FCDAD7',
  success:     '#1FA971',
  successSoft: '#D6F5E6',
  info:        '#3B9EFF',
  infoSoft:    '#DCEEFF',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  xxl:  30,
  pill: 999,
};

export const fonts = {
  display: 'Fredoka',
  sans:    'Hanken Grotesk',
  mono:    'DM Mono',
};

export const shadows = {
  sm: {
    shadowColor: '#17140F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#17140F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  primary: {
    shadowColor: '#FF5A3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 22,
    elevation: 6,
  },
};
