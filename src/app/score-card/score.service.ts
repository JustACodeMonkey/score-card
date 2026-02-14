import { Injectable } from '@angular/core';
import { ScoreCard, Player, Round } from './models';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private readonly storageKey = 'scorecards';
  private readonly sessionPlayersKey = 'session_players';

  list(): ScoreCard[] {
    try {
      const raw = localStorage.getItem(this.storageKey) || '[]';
      return JSON.parse(raw) as ScoreCard[];
    } catch {
      return [];
    }
  }

  save(scoreCard: ScoreCard): void {
    // mark updated timestamp
    scoreCard.updatedAt = new Date().toISOString();

    const all = this.list();
    const idx = all.findIndex((c) => c.id === scoreCard.id);
    if (idx >= 0) {
      all[idx] = scoreCard;
    } else {
      all.push(scoreCard);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  get(id: string): ScoreCard | null {
    return this.list().find((c) => c.id === id) ?? null;
  }

  create(name: string, players: Player[]): ScoreCard {
    const scoreCard: ScoreCard = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      name,
      players,
      rounds: [],
      roundsNewestFirst: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.save(scoreCard);
    return scoreCard;
  }

  // session-scoped players (saved to sessionStorage)
  listSessionPlayers(): Player[] {
    try {
      const raw = sessionStorage.getItem(this.sessionPlayersKey) || '[]';
      return JSON.parse(raw) as Player[];
    } catch {
      return [];
    }
  }

  saveSessionPlayer(name: string): Player {
    const all = this.listSessionPlayers();
    // avoid duplicates by name
    const existing = all.find((p) => p.name === name);
    if (existing) return existing;
    const p: Player = { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), name };
    all.push(p);
    sessionStorage.setItem(this.sessionPlayersKey, JSON.stringify(all));
    return p;
  }

  // add a player to an existing scorecard and initialize scores for existing rounds
  addPlayerToCard(cardId: string, player: Player): boolean {
    const scoreCard = this.get(cardId);
    if (!scoreCard) return false;
    // avoid duplicate ids
    if (scoreCard.players.find((p) => p.id === player.id)) return false;
    scoreCard.players.push(player);
    for (const r of scoreCard.rounds) {
      r.scores[player.id] = 0;
    }
    this.save(scoreCard);
    return true;
  }

  // duplicate a scorecard: same structure but new id, cleared scores, new timestamps
  duplicate(cardId: string): ScoreCard | null {
    const orig = this.get(cardId);
    if (!orig) return null;
    const copy: ScoreCard = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      name: `Copy of ${orig.name}`,
      players: orig.players.map((p) => ({ id: p.id, name: p.name })),
      rounds: orig.rounds.map((r) => ({
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        label: r.label,
        scores: Object.fromEntries(orig.players.map((p) => [p.id, 0])),
      })),
      roundsNewestFirst: orig.roundsNewestFirst,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.save(copy);
    return copy;
  }

  delete(id: string): void {
    const all = this.list().filter((c) => c.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  addRound(cardId: string, label: string): Round | null {
    const scoreCard = this.get(cardId);
    if (!scoreCard) return null;
    const round: Round = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      label,
      scores: {},
    };
    // initialize scores to 0 for each player
    for (const p of scoreCard.players) {
      round.scores[p.id] = 0;
    }
    scoreCard.rounds.push(round);
    this.save(scoreCard);
    return round;
  }

  endGame(cardId: string): boolean {
    const scoreCard = this.get(cardId);
    if (!scoreCard) return false;
    scoreCard.finishedAt = new Date().toISOString();
    this.save(scoreCard);
    return true;
  }

  restartGame(cardId: string): boolean {
    const scoreCard = this.get(cardId);
    if (!scoreCard) return false;
    scoreCard.finishedAt = null;
    this.save(scoreCard);
    return true;
  }

  removeRound(cardId: string, roundId: string): boolean {
    const scoreCard = this.get(cardId);
    if (!scoreCard) return false;
    const idx = scoreCard.rounds.findIndex((r) => r.id === roundId);
    if (idx < 0) return false;
    scoreCard.rounds.splice(idx, 1);
    this.save(scoreCard);
    return true;
  }

  removePlayer(cardId: string, playerId: string): boolean {
    const scoreCard = this.get(cardId);
    if (!scoreCard) return false;
    const pidx = scoreCard.players.findIndex((p) => p.id === playerId);
    if (pidx < 0) return false;
    // remove player
    scoreCard.players.splice(pidx, 1);
    // remove player's scores from every round
    for (const r of scoreCard.rounds) {
      if (r.scores && Object.prototype.hasOwnProperty.call(r.scores, playerId)) {
        delete r.scores[playerId];
      }
    }
    this.save(scoreCard);
    return true;
  }
}
