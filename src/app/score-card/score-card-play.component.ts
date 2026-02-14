import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScoreService } from './score.service';
import { ScoreCard, Player, Round } from './models';
import {
  iconoirArrowLeftCircle,
  iconoirMinus,
  iconoirPause,
  iconoirPlay,
  iconoirPlusCircle,
  iconoirSortDown,
  iconoirSortUp,
  iconoirXmark,
} from '@ng-icons/iconoir';
import { ScInput } from '../components/sc-input';
import { ScAddPlayers } from '../components/sc-add-players';
import { ScIconButton } from '../components/sc-icon-button/sc-icon-button';
import * as Yahtzee from './game-templates/yahtzee/yahtzee';
import * as SevenWonders from './game-templates/seven-wonders/seven-wonders';

@Component({
  selector: 'score-card-play',
  imports: [CommonModule, FormsModule, RouterLink, NgIcon, ScIconButton, ScInput, ScAddPlayers],
  providers: [
    provideIcons({
      iconoirArrowLeftCircle,
      iconoirMinus,
      iconoirPause,
      iconoirPlay,
      iconoirPlusCircle,
      iconoirSortDown,
      iconoirSortUp,
      iconoirXmark,
    }),
  ],
  template: `
    @if (scoreCard) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside class="md:col-span-1 bg-white shadow rounded-lg p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex align-center gap-2">
              <a
                class="flex items-center justify-center gap-2 text-blue-600 rounded hover:text-blue-700 cursor-pointer"
                [routerLink]="['/']"
              >
                <ng-icon name="iconoir:arrow-left-circle" size="24px" />
              </a>
              <h2 class="text-lg font-medium">{{ scoreCard.name }}</h2>
            </div>
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

          <h3 class="text-sm text-slate-500 mt-4">Players/Teams</h3>
          <ul class="mt-3 space-y-2">
            @for (p of scoreCard.players; track p.id) {
              <li class="flex items-center justify-between">
                <div class="text-sm text-slate-800">{{ p.name }}</div>
                <div class="text-sm font-semibold text-slate-700">{{ totals[p.id] || 0 }}</div>
              </li>
            }
          </ul>
          <div class="mt-4">
            <sc-add-players
              [players]="scoreCard.players || []"
              [sessionPlayers]="sessionPlayers"
              (add)="addPlayerToGameWithPlayer($event)"
              (remove)="removePlayerFromGame($event)"
            />
          </div>
          <div class="mt-4 text-xs text-slate-500">
            @if (scoreCard.finishedAt) {
              Finished: {{ scoreCard.finishedAt | date: 'short' }}
            }
          </div>
          <div class="mt-3"></div>
        </aside>

        <main class="md:col-span-2">
          <div class="bg-white shadow rounded-lg p-4">
            <h3 class="text-md font-medium mb-2">Add a round or line item</h3>
            <div class="flex items-center gap-2 mb-4">
              <sc-input
                name="round-label"
                ariaLabel="Round or line item label (e.g. Round 1, Hand 5, etc.)"
                [(value)]="newRoundLabel"
                placeholder="Round or line item (e.g. Round 1, Hand 5, etc.)"
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
              <h3 class="text-md font-medium mb-2">Rounds and Line Items</h3>
              <div class="flex items-center gap-2">
                <sc-icon-button
                  visual="ghost"
                  (click)="toggleRoundOrder()"
                  [title]="roundsNewestFirst ? 'Show oldest first' : 'Show newest first'"
                  [icon]="roundsNewestFirst ? 'iconoir:sort-down' : 'iconoir:sort-up'"
                />
                <!-- Template buttons removed: templates are applied from the editor only -->
              </div>
            </div>
            <div class="space-y-4">
              @if (isYahtzee) {
                <div>
                  <div class="text-sm font-medium mb-2">Upper Section</div>
                  @for (label of yahtzeeUpper; track label) {
                    <div class="border border-slate-200 rounded p-3 mb-2">
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium">{{ label }}</div>
                        <sc-icon-button
                          visual="ghost"
                          title="Remove round"
                          (click)="removeRoundByLabel(label)"
                          [disabled]="
                            !!scoreCard.finishedAt || !Yahtzee.getRoundByLabel(scoreCard, label)
                          "
                          icon="iconoir:minus"
                        />
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        @for (p of scoreCard.players; track p.id) {
                          <sc-input
                            [label]="p.name"
                            name="player-{{ p.id }}-round-{{ label }}-score"
                            ariaLabel="Score for {{ p.name }} in {{ label }}"
                            type="number"
                            [value]="Yahtzee.getRoundByLabel(scoreCard, label)?.scores?.[p.id] || 0"
                            (valueChange)="updateScoreByLabel(label, p.id, $event)"
                            [disabled]="
                              !!scoreCard.finishedAt || !Yahtzee.getRoundByLabel(scoreCard, label)
                            "
                          />
                        }
                      </div>
                    </div>
                  }

                  <div class="border border-slate-200 rounded p-3 bg-slate-50">
                    <div class="font-medium mb-2">Upper Total</div>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      @for (p of scoreCard.players; track p.id) {
                        <div class="p-2 text-center font-semibold">
                          {{ Yahtzee.computeUpperTotal(scoreCard, p.id) }}
                        </div>
                      }
                    </div>
                    <div class="font-medium mt-3 mb-2">Bonus</div>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      @for (p of scoreCard.players; track p.id) {
                        <div class="p-2 text-center font-semibold">
                          {{ Yahtzee.computeUpperBonus(scoreCard, p.id) }}
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <div class="text-sm font-medium mb-2">Lower Section</div>
                  @for (label of yahtzeeLower; track label) {
                    <div class="border border-slate-200 rounded p-3 mb-2">
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium">{{ label }}</div>
                        <sc-icon-button
                          visual="ghost"
                          title="Remove round"
                          (click)="removeRoundByLabel(label)"
                          [disabled]="
                            !!scoreCard.finishedAt || !Yahtzee.getRoundByLabel(scoreCard, label)
                          "
                          icon="iconoir:minus"
                        />
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        @for (p of scoreCard.players; track p.id) {
                          <sc-input
                            [label]="p.name"
                            name="player-{{ p.id }}-round-{{ label }}-score"
                            ariaLabel="Score for {{ p.name }} in {{ label }}"
                            type="number"
                            [value]="Yahtzee.getRoundByLabel(scoreCard, label)?.scores?.[p.id] || 0"
                            (valueChange)="updateScoreByLabel(label, p.id, $event)"
                            [disabled]="
                              !!scoreCard.finishedAt || !Yahtzee.getRoundByLabel(scoreCard, label)
                            "
                          />
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                @for (
                  r of roundsNewestFirst ? scoreCard.rounds.slice().reverse() : scoreCard.rounds;
                  track r.id
                ) {
                  <div class="border border-slate-200 rounded p-3">
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
              }
            </div>
          </div>
        </main>
      </div>
    } @else {
      <p class="text-center text-slate-600">Game score card not found.</p>
    }
  `,
})
export class ScoreCardPlay {
  protected scoreCard: ScoreCard | null = null;
  protected newRoundLabel = '';
  protected totals: Record<string, number> = {};
  protected get roundsNewestFirst() {
    return !!this.scoreCard?.roundsNewestFirst;
  }

  private id: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private svc: ScoreService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) this.load(this.id);
  }

  protected playNewPlayerInput = viewChild<ScInput>('playNewPlayerInput');

  protected sessionPlayers: Player[] = [];
  protected playAddingNewPlayer = false;
  protected playSelectedSessionPlayerId = '';
  protected playNewPlayerName = '';
  protected yahtzeeUpper = Yahtzee.upperLabels;
  protected yahtzeeLower = Yahtzee.lowerLabels;
  readonly Yahtzee = Yahtzee;
  readonly SevenWonders = SevenWonders;

  private load(id: string) {
    this.scoreCard = this.svc.get(id);
    this.recalcTotals();
    this.sessionPlayers = this.svc.listSessionPlayers();
  }

  protected onPlaySessionPlayerChange(e: Event | any) {
    const val = this.playSelectedSessionPlayerId;
    if (val === '__add_new__') {
      this.playAddingNewPlayer = true;
      this.playNewPlayerName = '';
      // focus the new player input in the play view
      setTimeout(() => this.playNewPlayerInput()?.focus(), 0);
      return;
    }

    // if an existing session player was selected, add them immediately to the card
    if (val && this.id && this.scoreCard && !this.scoreCard.finishedAt) {
      const sp = this.sessionPlayers.find((s) => s.id === val);
      if (sp) {
        this.svc.addPlayerToCard(this.id, sp);
        // reset UI and reload
        this.playSelectedSessionPlayerId = '';
        this.playAddingNewPlayer = false;
        this.playNewPlayerName = '';
        this.load(this.id);
        return;
      }
    }

    this.playAddingNewPlayer = false;
  }

  protected addPlayerToGame() {
    if (!this.scoreCard || !this.id) return;
    if (this.scoreCard.finishedAt) return;
    if (this.playSelectedSessionPlayerId && this.playSelectedSessionPlayerId !== '__add_new__') {
      const sp = this.sessionPlayers.find((s) => s.id === this.playSelectedSessionPlayerId);
      if (sp) {
        this.svc.addPlayerToCard(this.id, sp);
      }
      // reset UI and reload
      this.playSelectedSessionPlayerId = '';
      this.playAddingNewPlayer = false;
      this.playNewPlayerName = '';
      this.load(this.id);
      return;
    }

    if (this.playAddingNewPlayer && this.playNewPlayerName?.trim()) {
      const name = this.playNewPlayerName.trim();
      // reuse existing session player by case-insensitive match
      const existing = this.sessionPlayers.find(
        (p) => p.name.trim().toLowerCase() === name.toLowerCase(),
      );
      let saved = existing;
      if (!saved) {
        saved = this.svc.saveSessionPlayer(name);
        this.sessionPlayers = this.svc.listSessionPlayers();
      }
      this.svc.addPlayerToCard(this.id, saved);

      // reset UI and reload
      this.playSelectedSessionPlayerId = '';
      this.playAddingNewPlayer = false;
      this.playNewPlayerName = '';
      this.load(this.id);
      return;
    }
  }

  protected addPlayerToGameWithPlayer(player: Player) {
    if (!this.scoreCard || !this.id) return;
    if (this.scoreCard.finishedAt) return;
    // avoid duplicate ids
    if (this.scoreCard.players.find((p) => p.id === player.id)) return;
    this.svc.addPlayerToCard(this.id, player);
    this.load(this.id);
  }

  protected removePlayerFromGame(playerId: string) {
    if (!this.id) return;
    this.svc.removePlayer(this.id, playerId);
    this.load(this.id);
  }
  get isYahtzee() {
    // Consider it a Yahtzee-style card if it fully matches the template
    // or if it contains any of the Yahtzee upper/lower labels (tolerant)
    if (Yahtzee.isYahtzeeCard(this.scoreCard)) return true;
    if (!this.scoreCard) return false;
    const labels = this.scoreCard.rounds.map((r) => r.label);
    const hasUpper = Yahtzee.upperLabels.some((l) => labels.includes(l));
    const hasLower = Yahtzee.lowerLabels.some((l) => labels.includes(l));
    return hasUpper || hasLower;
  }

  protected applyYahtzeeTemplate() {
    if (!this.id) return;
    Yahtzee.applyTemplate(this.svc, this.id);
    this.load(this.id);
  }

  // Safe helpers for template bindings to avoid passing undefined ids
  protected removeRoundByLabel(label?: string) {
    const r = Yahtzee.getRoundByLabel(this.scoreCard, label);
    if (r) this.removeRound(r.id);
  }

  protected updateScoreByLabel(label: string | undefined, playerId: string, raw: any) {
    const r = Yahtzee.getRoundByLabel(this.scoreCard, label);
    if (!r) return;
    this.updateScore(r.id, playerId, raw);
  }

  protected addRound() {
    if (!this.scoreCard || !this.id) return;
    if (this.scoreCard.finishedAt) return;
    this.svc.addRound(this.id, this.newRoundLabel.trim());
    this.newRoundLabel = '';
    this.load(this.id);
  }

  protected toggleRoundOrder() {
    if (!this.scoreCard) return;
    this.scoreCard.roundsNewestFirst = !this.roundsNewestFirst;
    this.svc.save(this.scoreCard);
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
    // Allow game templates to contribute derived totals (e.g. Yahtzee upper bonus)
    if (Yahtzee.isYahtzeeCard(this.scoreCard)) {
      const derived = Yahtzee.computeDerivedTotals(this.scoreCard);
      for (const pid of Object.keys(derived))
        this.totals[pid] = (this.totals[pid] || 0) + (derived[pid] || 0);
    }
    if (SevenWonders.isSevenWondersCard(this.scoreCard)) {
      const derived = SevenWonders.computeDerivedTotals(this.scoreCard);
      for (const pid of Object.keys(derived))
        this.totals[pid] = (this.totals[pid] || 0) + (derived[pid] || 0);
    }
  }
}
