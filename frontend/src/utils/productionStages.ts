export interface ProductionStageItem {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const PRODUCTION_STAGES: ProductionStageItem[] = [
  { id: 'PRE_PRESS', name: 'Хэвлэхийн өмнөх', label: 'Хэвлэхийн өмнөх', icon: '📝', color: '#6366f1', badgeBg: '#e0f2fe', badgeText: '#0369a1' },
  { id: 'PRINTING', name: 'Хэвлэх', label: 'Хэвлэх дамжлага', icon: '🖨️', color: '#0ea5e9', badgeBg: '#dcfce7', badgeText: '#15803d' },
  { id: 'POST_PRESS', name: 'Хэвлэсний дараах', label: 'Хэвлэсний дараах', icon: '✂️', color: '#f59e0b', badgeBg: '#fef3c7', badgeText: '#b45309' },
  { id: 'PACKAGING', name: 'Савлалт', label: 'Савлалт, хүргэлт', icon: '📦', color: '#10b981', badgeBg: '#f3e8ff', badgeText: '#6d28d9' },
];
