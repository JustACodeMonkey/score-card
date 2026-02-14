import { ScoreService } from '../../score.service';
import { ScoreCard } from '../../models';

// Catan scoring lines — track common point sources
export const labels = [
  'Settlements',
  'Cities',
  'Longest Road',
  'Largest Army',
  'Development Cards',
  'Resources Bonus',
  'Trade/Ports',
  'Other',
];

export function applyTemplate(svc: ScoreService, cardId: string) {
  const card = svc.get(cardId);
  if (!card) return;
  const existing = new Set(card.rounds.map((r) => r.label));
  for (const label of labels) {
    if (!existing.has(label)) svc.addRound(cardId, label);
  }
  // prefer oldest-first display when using this template
  card.roundsNewestFirst = false;
  svc.save(card);
}

export function isCatanCard(card?: ScoreCard | null) {
  if (!card) return false;
  const existing = card.rounds.map((r) => r.label);
  return labels.every((l) => existing.includes(l));
}

export function computeDerivedTotals(card?: ScoreCard | null): Record<string, number> {
  // No derived totals for Catan yet
  const out: Record<string, number> = {};
  if (!card) return out;
  for (const p of card.players) out[p.id] = 0;
  return out;
}
