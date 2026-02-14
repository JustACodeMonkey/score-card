import { ScoreService } from '../../score.service';
import { ScoreCard } from '../../models';

// A compact Seven Wonders Duel template: common scoring lines tuned for 2-player
export const labels = [
  'Military',
  'Treasury',
  'Civilian',
  'Commercial',
  'Guilds',
  'Science',
  'Wonders',
  'Endgame Bonuses',
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

export function isSevenWondersDuelCard(card?: ScoreCard | null) {
  if (!card) return false;
  const existing = card.rounds.map((r) => r.label);
  return labels.every((l) => existing.includes(l));
}

export function computeDerivedTotals(card?: ScoreCard | null): Record<string, number> {
  // No derived totals for the Duel template yet; return zeros
  const out: Record<string, number> = {};
  if (!card) return out;
  for (const p of card.players) out[p.id] = 0;
  return out;
}
