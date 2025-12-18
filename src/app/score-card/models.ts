export interface Player {
  id: string;
  name: string;
}

export interface Round {
  id: string;
  label: string;
  // maps playerId -> score for this round
  scores: Record<string, number>;
}

export interface ScoreCard {
  id: string;
  name: string;
  players: Player[];
  rounds: Round[];
  createdAt: string;
  // optional finished timestamp when the game has ended
  finishedAt?: string | null;
  // optional last-updated timestamp (set whenever the card is saved)
  updatedAt?: string | null;
}
