import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScoreService } from './score.service';
import { ScoreCard } from './models';
import {
  iconoirArrowLeftCircle,
  iconoirMinus,
  iconoirPause,
  iconoirPlay,
  iconoirPlusCircle,
  iconoirSortDown,
  iconoirSortUp,
} from '@ng-icons/iconoir';
import { ScInput } from '../components/sc-input';
import { ScIconButton } from '../components/sc-icon-button/sc-icon-button';

@Component({
  selector: 'score-card-play',
  imports: [CommonModule, FormsModule, RouterLink, NgIcon, ScIconButton, ScInput],
  providers: [
    provideIcons({
      iconoirArrowLeftCircle,
      iconoirMinus,
      iconoirPause,
      iconoirPlay,
      iconoirPlusCircle,
      iconoirSortDown,
      iconoirSortUp,
    }),
  ],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      @if (scoreCard) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside class="md:col-span-1 bg-white shadow rounded-lg p-4">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-lg font-medium">{{ scoreCard.name }}</h2>
            <div class="text-right shrink-0">
              @if (scoreCard.finishedAt) {
              <sc-icon-button
                visual="primary"
                (click)="restartGame()"
                title="Restart game"
                icon="iconoir:play"
              />
              } @else {
              <sc-icon-button
                visual="danger"
                (click)="endGame()"
                title="Stop game"
                icon="iconoir:pause"
              />
              }
            </div>
          </div>

          <h3 class="text-sm text-slate-500 mt-4">Players/Teams</h3>
          <ul class="mt-3 space-y-2">
            @for (p of scoreCard.players; track p.id) {
            <li class="flex items-center justify-between">
              <div class="text-sm text-slate-800">{{ p.name }}</div>
              <div class="text-sm font-semibold text-slate-700">{{ totals[p.id] || 0 }}</div>
            </li>
            }
          </ul>
          <div class="mt-4 text-xs text-slate-500">
            @if(scoreCard.finishedAt) { Finished: {{ scoreCard.finishedAt | date : 'short' }} }
          </div>
          <div class="mt-3">
            <a
              class="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer"
              [routerLink]="['/score-cards']"
            >
              <ng-icon name="iconoir:arrow-left-circle" size="20px" />
              Back to Score Cards
            </a>
          </div>
        </aside>

        <main class="md:col-span-2">
          <div class="bg-white shadow rounded-lg p-4 mb-4">
            <h3 class="text-md font-medium mb-2">Add Scoring Round or Item</h3>
            <div class="flex items-center gap-2 mb-4">
              <sc-input
                name="round-label"
                ariaLabel="Round or Item label (e.g. Round 1, Hand 5, etc.)"
                [(value)]="newRoundLabel"
                placeholder="Round or Item label (e.g. Round 1, Hand 5, etc.)"
                (keyup.enter)="
                  !newRoundLabel.trim() || scoreCard.finishedAt ? undefined : addRound()
                "
                class="w-full"
              />
              <sc-icon-button
                visual="primary"
                (click)="addRound()"
                [disabled]="!newRoundLabel.trim() || !!scoreCard.finishedAt"
                title="Add Round"
                icon="iconoir:plus-circle"
              />
            </div>

            <div class="flex items-center justify-between mb-2 mt-8">
              <h3 class="text-md font-medium mb-2">Rounds</h3>
              <sc-icon-button
                visual="ghost"
                (click)="toggleRoundOrder()"
                [title]="roundsNewestFirst ? 'Show oldest first' : 'Show newest first'"
                [icon]="roundsNewestFirst ? 'iconoir:sort-down' : 'iconoir:sort-up'"
              />
            </div>
            <div class="space-y-4">
              @for (r of (roundsNewestFirst ? scoreCard.rounds.slice().reverse() :
              scoreCard.rounds); track r.id) {
              <div class="border rounded p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium">{{ r.label }}</div>
                  <sc-icon-button
                    visual="ghost"
                    title="Remove round"
                    (click)="removeRound(r.id)"
                    [disabled]="!!scoreCard.finishedAt"
                    icon="iconoir:minus"
                  />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  @for (p of scoreCard.players; track p.id) {
                  <sc-input
                    [label]="p.name"
                    name="player-{{ p.id }}-round-{{ r.id }}-score"
                    ariaLabel="Score for {{ p.name }} in {{ r.label }}"
                    type="number"
                    [value]="r.scores[p.id]"
                    (valueChange)="updateScore(r.id, p.id, $event)"
                    [disabled]="!!scoreCard.finishedAt"
                  />
                  }
                </div>
              </div>
              }
            </div>
          </div>
        </main>
      </div>
      } @else {
      <p class="text-center text-slate-600">Score card not found.</p>
      }
    </div>
  `,
})
export class ScoreCardPlay {
  protected scoreCard: ScoreCard | null = null;
  protected newRoundLabel = '';
  protected totals: Record<string, number> = {};
  protected roundsNewestFirst = true;

  private id: string | null = null;

  constructor(private route: ActivatedRoute, private svc: ScoreService) {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) this.load(this.id);
  }

  private load(id: string) {
    this.scoreCard = this.svc.get(id);
    this.recalcTotals();
  }

  protected addRound() {
    if (!this.scoreCard || !this.id) return;
    if (this.scoreCard.finishedAt) return;
    this.svc.addRound(this.id, this.newRoundLabel.trim());
    this.newRoundLabel = '';
    this.load(this.id);
  }

  protected toggleRoundOrder() {
    this.roundsNewestFirst = !this.roundsNewestFirst;
  }

  protected removeRound(roundId: string) {
    if (!this.scoreCard || !this.id) return;
    if (this.scoreCard.finishedAt) return;
    this.svc.removeRound(this.id, roundId);
    this.load(this.id);
  }

  protected updateScore(roundId: string, playerId: string, raw: any) {
    if (!this.scoreCard || !this.id) return;
    if (this.scoreCard.finishedAt) return;
    const r = this.scoreCard.rounds.find((x) => x.id === roundId);
    if (!r) return;
    const v = Number(raw) || 0;
    r.scores[playerId] = v;
    this.svc.save(this.scoreCard as ScoreCard);
    this.recalcTotals();
  }

  protected endGame() {
    if (!this.id) return;
    this.svc.endGame(this.id);
    if (this.id) this.load(this.id);
  }

  protected restartGame() {
    if (!this.id) return;
    this.svc.restartGame(this.id);
    if (this.id) this.load(this.id);
  }

  private recalcTotals() {
    this.totals = {};
    if (!this.scoreCard) return;
    for (const p of this.scoreCard.players) this.totals[p.id] = 0;
    for (const r of this.scoreCard.rounds) {
      for (const pid of Object.keys(r.scores)) {
        this.totals[pid] = (this.totals[pid] || 0) + (r.scores[pid] || 0);
      }
    }
  }
}
