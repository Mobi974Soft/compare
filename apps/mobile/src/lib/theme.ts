export const colors = {
  ink: '#172521',
  muted: '#66746F',
  background: '#F7F8F4',
  surface: '#FFFFFF',
  primary: '#FF5B45',
  primaryDark: '#D94131',
  mint: '#BDEFD8',
  mintDark: '#147A57',
  sunshine: '#FFD66B',
  lavender: '#DDD5FF',
  line: '#E5E9E4',
  danger: '#C83A3A',
  white: '#FFFFFF',
  black: '#0D1613',
} as const;

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;
export const shadow = {
  shadowColor: '#172521',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 3,
} as const;
