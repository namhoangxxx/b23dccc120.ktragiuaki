export const COLORS = {
  primary: '#059669', // Emerald Green - Hiện đại, thể thao
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  secondary: '#0284C7', // Sky Blue
  
  active: '#10B981', // Xanh lá tươi
  activeBg: '#ECFDF5',
  maintenance: '#F97316', // Cam nổi bật
  maintenanceBg: '#FFF7ED',

  background: '#F8FAFC', // Slate background nhã nhặn
  cardBg: '#FFFFFF',
  
  textPrimary: '#0F172A', // Dark Slate
  textSecondary: '#64748B', // Cool Gray
  border: '#E2E8F0',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  disabled: '#94A3B8',
  white: '#FFFFFF',
  shadowColor: '#1E293B',
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};