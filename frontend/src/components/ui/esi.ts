export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export interface EsiMeta {
  label: string;
  desc: string;
  bg: string;
  text: string;
  accent: string;
  maxWaitMin: number;
}

export const ESI_META: Record<EsiLevel, EsiMeta> = {
  1: { label: 'E1', desc: 'Reanimación', bg: 'var(--esi-e1-bg)', text: 'var(--esi-e1-text)', accent: 'var(--esi-e1)', maxWaitMin: 0 },
  2: { label: 'E2', desc: 'Emergencia', bg: 'var(--esi-e2-bg)', text: 'var(--esi-e2-text)', accent: 'var(--esi-e2)', maxWaitMin: 10 },
  3: { label: 'E3', desc: 'Urgente', bg: 'var(--esi-e3-bg)', text: 'var(--esi-e3-text)', accent: 'var(--esi-e3)', maxWaitMin: 30 },
  4: { label: 'E4', desc: 'Menor urgencia', bg: 'var(--esi-e4-bg)', text: 'var(--esi-e4-text)', accent: 'var(--esi-e4)', maxWaitMin: 60 },
  5: { label: 'E5', desc: 'No urgente', bg: 'var(--esi-e5-bg)', text: 'var(--esi-e5-text)', accent: 'var(--esi-e5)', maxWaitMin: 120 },
};

export const esiMeta = (nivel: number | string): EsiMeta =>
  ESI_META[Number(nivel) as EsiLevel] ?? ESI_META[3];
