/**
 * Palettes from WiiBrew "Rendering Miis" / libmii. Hair, eyebrow, facial hair
 * and skin sprites are grayscale and tinted by multiplying with these colors.
 */

export const HAIR_COLORS: readonly string[] = [
  '#111111',
  '#332222',
  '#441111',
  '#BB6644',
  '#8888AA',
  '#443322',
  '#996644',
  '#DDBB99',
];

export const SKIN_COLORS: readonly string[] = [
  '#ECCFBD',
  '#F7BC7D',
  '#D78A48',
  '#F5B189',
  '#995122',
  '#563010',
];

export const EYE_COLORS: readonly string[] = [
  '#000000',
  '#778887',
  '#7E6355',
  '#888940',
  '#6A84D0',
  '#409B5A',
];

export const LIP_COLORS: readonly string[] = ['#C76C46', '#E44E3A', '#D88789'];

export const GLASSES_COLORS: readonly string[] = [
  '#626D6C',
  '#85703A',
  '#AB4E37',
  '#426996',
  '#B97F27',
  '#BDBFB9',
];

/**
 * Favorite-color indices 0-11 (shirt color on console). The Wii sprite pack does
 * not contain shirt art, so these hex values are UI swatches chosen to match the
 * documented color names; they are not console-verified pixels.
 */
export const FAVORITE_COLORS: ReadonlyArray<{ slug: string; hex: string }> = [
  { slug: 'red', hex: '#E22B2B' },
  { slug: 'orange', hex: '#F0801E' },
  { slug: 'yellow', hex: '#F2C41D' },
  { slug: 'lime-green', hex: '#7EC63F' },
  { slug: 'forest-green', hex: '#27793C' },
  { slug: 'royal-blue', hex: '#2764C7' },
  { slug: 'sky-blue', hex: '#49B7E8' },
  { slug: 'pink', hex: '#EE7FB4' },
  { slug: 'purple', hex: '#8A55C4' },
  { slug: 'brown', hex: '#8B5A33' },
  { slug: 'white', hex: '#F2F2F2' },
  { slug: 'black', hex: '#2A2A2A' },
];

export const HAIR_COLOR_COUNT = HAIR_COLORS.length;
export const EYE_COLOR_COUNT = EYE_COLORS.length;
export const LIP_COLOR_COUNT = LIP_COLORS.length;
export const GLASSES_COLOR_COUNT = GLASSES_COLORS.length;
export const FAVORITE_COLOR_COUNT = FAVORITE_COLORS.length;
