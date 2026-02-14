import { ScoreService } from '../../score.service';
import { ScoreCard, Round } from '../../models';

export const upperLabels = ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'];
export const lowerLabels = [
  'Three of a Kind',
  'Four of a Kind',
  'Full House',
  'Small Straight',
  'Large Straight',
  'Yahtzee',
  'Chance',
];

export function isYahtzeeCard(card?: ScoreCard | null) {
  if (!card) return false;
  const labels = card.rounds.map((r) => r.label);
  return (
    upperLabels.every((l) => labels.includes(l)) && lowerLabels.every((l) => labels.includes(l))
  );
}

export function getRoundByLabel(card?: ScoreCard | null, label?: string): Round | undefined {
  if (!card || !label) return undefined;
  return card.rounds.find((r) => r.label === label);
}

export function computeUpperTotal(card: ScoreCard | null | undefined, playerId: string) {
  if (!card) return 0;
  let total = 0;
  for (const label of upperLabels) {
    const r = getRoundByLabel(card, label);
    if (r && r.scores && Object.prototype.hasOwnProperty.call(r.scores, playerId)) {
      total += r.scores[playerId] || 0;
    }
  }
  return total;
}

export function computeUpperBonus(card: ScoreCard | null | undefined, playerId: string) {
  const total = computeUpperTotal(card, playerId);
  return total >= 63 ? 35 : 0;
}

export function applyTemplate(svc: ScoreService, cardId: string) {
  const all = [...upperLabels, ...lowerLabels];
  // Add missing rounds only
  const card = svc.get(cardId);
  if (!card) return;
  const existing = new Set(card.rounds.map((r) => r.label));
  for (const label of all) {
    if (!existing.has(label)) svc.addRound(cardId, label);
  }
  // ensure rounds are shown oldest-first when using this template
  card.roundsNewestFirst = false;
  svc.save(card);
}

export function computeDerivedTotals(card: ScoreCard | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!card) return out;
  for (const p of card.players) {
    out[p.id] = computeUpperBonus(card, p.id) || 0;
  }
  return out;
}
