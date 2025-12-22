import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ScoreService } from './score.service';
import { Player, ScoreCard } from './models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  iconoirEditPencil,
  iconoirEye,
  iconoirPlay,
  iconoirPlusCircle,
  iconoirXmark,
} from '@ng-icons/iconoir';
import { ScInput } from '../components/sc-input';
import { ScTag } from '../components/sc-tag';
import { ScButton } from '../components/sc-button/sc-button';
import { ScIconButton } from '../components/sc-icon-button/sc-icon-button';

@Component({
  selector: 'score-card-editor',
  imports: [CommonModule, FormsModule, RouterLink, NgIcon, ScInput, ScTag, ScButton, ScIconButton],
  providers: [
    provideIcons({
      iconoirEditPencil,
      iconoirEye,
      iconoirPlay,
      iconoirPlusCircle,
      iconoirXmark,
    }),
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section class="bg-white shadow rounded-lg p-5">
        <h2 class="text-xl font-medium text-slate-800">New Game</h2>
        <sc-input
          label="Game Name"
          name="game-name"
          ariaLabel="Game Name"
          [(value)]="name"
          placeholder="e.g. Friday Euchre"
          class="mb-3"
        />

        <div class="flex items-center gap-2 mb-3">
          <sc-input
            name="players-teams-name"
            label="Add Players/Teams"
            ariaLabel="Add Players/Teams"
            [(value)]="newPlayerName"
            [placeholder]="'Player/Team ' + (players.length + 1)"
            (keyup.enter)="addPlayer()"
            class="w-full"
          />
          <sc-icon-button
            visual="primary"
            (click)="addPlayer()"
            title="Add Player/Team"
            icon="iconoir:plus-circle"
            class="mt-5"
          />
        </div>

        @if (players.length > 0) {
        <div class="mb-4">
          <h3 class="text-sm font-medium text-slate-700 mb-2">Players/Teams</h3>
          <div class="flex flex-wrap gap-2">
            @for (p of players; track p.id) {
            <sc-tag
              [label]="p.name"
              (iconClick)="removeLocalPlayer(p.id)"
              icon="iconoir:xmark"
              ariaLabel="Remove {{ p.name }} from new score card"
            />
            }
          </div>
        </div>
        }

        <div class="mt-4">
          <sc-button
            visual="secondary"
            (click)="create()"
            [disabled]="!canCreate"
            icon="iconoir:plus-circle"
            class="w-full"
          >
            Start Playing
          </sc-button>
        </div>
      </section>

      <section class="bg-white shadow rounded-lg p-5">
        <h2 class="text-xl font-medium mb-3">Existing Games</h2>
        <ul class="space-y-3">
          @for (c of scoreCards; track c.id) {
          <li
            class="flex items-center justify-between gap-4 p-3 border border-slate-200 rounded hover:bg-slate-50"
          >
            <div>
              <div class="font-medium text-slate-800">{{ c.name }}</div>
              <div class="text-sm text-slate-500">{{ c.players.length }} players/teams</div>
              @if (c.updatedAt) {
              <div class="text-xs text-slate-400 mt-1">
                Updated: {{ c.updatedAt | date : 'short' }}
              </div>
              }
            </div>
            <div class="flex items-center gap-1">
              <a
                class="flex text-blue-600 hover:text-blue-700
                  focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-gray-300 rounded-full p-1"
                [routerLink]="['games', c.id]"
                >@if (c.finishedAt) {
                <ng-icon name="iconoir:eye" size="24px" class="align-self-center" /> } @else {
                <ng-icon name="iconoir:play" size="24px" class="align-self-center" /> }</a
              >
              <sc-icon-button
                visual="ghost"
                (click)="toggleManage(c.id)"
                title="Edit game settings"
                [icon]="expanded[c.id] ? 'iconoir:xmark' : 'iconoir:edit-pencil'"
              />
            </div>
          </li>
          @if (expanded[c.id]) {
          <li class="p-3 border border-slate-200 rounded bg-slate-50">
            <div class="text-sm text-slate-700 font-medium mb-2">Players/Teams</div>
            <div class="flex flex-wrap gap-2">
              @for (p of c.players; track p.id) {
              <sc-tag
                [label]="p.name"
                (iconClick)="removePlayerFromCard(c.id, p.id)"
                icon="iconoir:xmark"
                ariaLabel="Remove {{ p.name }}"
                [disabled]="!!c.finishedAt"
              />
              }
            </div>

            <div class="mt-4 border border-red-300 bg-red-50 p-3 rounded">
              <div class="text-sm font-medium text-red-800 mb-1">Danger Zone</div>
              <p class="text-xs mb-3">
                Deleting a game will remove all rounds and scores. This cannot be undone.
              </p>

              @if (!confirmDelete[c.id]) {
              <div class="flex gap-2">
                <sc-button visual="danger" (click)="confirmDeleteCard(c.id)" title="Delete game">
                  Delete Game
                </sc-button>
              </div>
              } @else {
              <div class="flex gap-2">
                <sc-button visual="danger" (click)="deleteCard(c.id)" title="Confirm delete">
                  Confirm Delete
                </sc-button>
                <sc-button visual="secondary" (click)="cancelDeleteCard(c.id)">Cancel</sc-button>
              </div>
              }
            </div>
          </li>
          } }
        </ul>
      </section>
    </div>
  `,
})
export class ScoreCardEditor {
  protected name = '';
  protected newPlayerName = '';
  protected players: Player[] = [];
  protected scoreCards: ScoreCard[] = [];
  protected expanded: Record<string, boolean> = {};
  protected confirmDelete: Record<string, boolean> = {};

  private svc = inject(ScoreService);
  private router = inject(Router);

  constructor() {
    this.loadCards();
  }

  protected addPlayer() {
    const n = this.newPlayerName?.trim();
    if (!n) return;
    this.players.push({ id: String(Date.now()) + Math.random().toString(36).slice(2, 6), name: n });
    this.newPlayerName = '';
  }

  protected removeLocalPlayer(id: string) {
    const idx = this.players.findIndex((p) => p.id === id);
    if (idx >= 0) this.players.splice(idx, 1);
  }

  protected toggleManage(id: string) {
    this.expanded[id] = !this.expanded[id];
  }

  protected confirmDeleteCard(id: string) {
    this.confirmDelete[id] = true;
  }

  protected cancelDeleteCard(id: string) {
    this.confirmDelete[id] = false;
  }

  protected deleteCard(id: string) {
    this.svc.delete(id);
    this.loadCards();
    if (this.expanded[id]) this.expanded[id] = false;
    this.confirmDelete[id] = false;
  }

  protected removePlayerFromCard(cardId: string, playerId: string) {
    this.svc.removePlayer(cardId, playerId);
    this.loadCards();
  }

  protected get canCreate() {
    return !!this.name.trim() && this.players.length > 0;
  }

  protected create() {
    if (!this.canCreate) return;
    const scoreCard = this.svc.create(this.name.trim(), this.players.slice());
    this.name = '';
    this.players = [];
    // navigate to the newly created game's play view
    this.router.navigate(['games', scoreCard.id]);
  }

  // icon selection removed; single app logo at /public/score-card-icon.svg is used

  private loadCards() {
    const all = this.svc.list();
    all.sort((a, b) => {
      const ta = a.updatedAt ?? a.createdAt;
      const tb = b.updatedAt ?? b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
    this.scoreCards = all;
  }
}
