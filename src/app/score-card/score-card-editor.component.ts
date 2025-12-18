import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScoreService } from './score.service';
import { Player, ScoreCard } from './models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { iconoirEditPencil, iconoirEye, iconoirPlay, iconoirPlusCircle } from '@ng-icons/iconoir';

@Component({
  selector: 'score-card-editor',
  imports: [CommonModule, FormsModule, RouterLink, NgIcon],
  providers: [provideIcons({ iconoirEditPencil, iconoirEye, iconoirPlay, iconoirPlusCircle })],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <header class="mb-6 flex flex-col">
        <div class="flex items-center gap-2">
          <img src="/score-card-icon.svg" alt="Score Card" class="h-10 w-10 rounded" />
          <h1 class="text-3xl font-semibold text-slate-800">Score Cards</h1>
        </div>
        <p class="ml-12 text-sm text-slate-500">
          Create and manage customizable score cards for any simple game.
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section class="bg-white shadow rounded-lg p-5">
          <h2 class="text-xl font-medium mb-3">Create New Score Card</h2>
          <label class="block text-sm text-slate-700 mb-2">Name</label>
          <input
            class="w-full border border-slate-300 hover:border-slate-500 focus-within:border-slate-500 outline-0 focus-visible:ring-0 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            [(ngModel)]="name"
            placeholder="e.g. Friday Euchre"
          />

          <div class="flex items-center gap-2 mb-3">
            <input
              class="flex-1 border rounded px-3 py-2 focus:outline-none"
              [(ngModel)]="newPlayerName"
              placeholder="Player/Team name"
              (keyup.enter)="addPlayer()"
            />
            <button
              class="flex text-blue-500 rounded hover:text-blue-600 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              (click)="addPlayer()"
              title="Add Player/Team"
            >
              <ng-icon name="iconoir:plus-circle" size="24px" />
            </button>
          </div>

          @if (players.length > 0) {
          <div class="mb-4">
            <h3 class="text-sm font-medium text-slate-700 mb-2">Players/Teams</h3>
            <div class="flex flex-wrap gap-2">
              @for (p of players; track p.id) {
              <span
                class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-800"
              >
                <span>{{ p.name }}</span>
                <button
                  class="text-slate-500 hover:text-rose-600 cursor-pointer"
                  (click)="removeLocalPlayer(p.id)"
                  title="Remove"
                >
                  &times;
                </button>
              </span>
              }
            </div>
          </div>
          }

          <div class="mt-4">
            <button
              class="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              (click)="create()"
              [disabled]="!canCreate"
            >
              <ng-icon name="iconoir:plus-circle" size="24px" />
              Create Score Card
            </button>
          </div>
        </section>

        <section class="bg-white shadow rounded-lg p-5">
          <h2 class="text-xl font-medium mb-3">Existing Score Cards</h2>
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
                  class="flex text-blue-500 hover:text-blue-600 hover:bg-slate-100 p-1"
                  [routerLink]="['/score-cards', c.id, 'play']"
                  >@if (c.finishedAt) {
                  <ng-icon name="iconoir:eye" size="24px" class="align-self-center" /> } @else {
                  <ng-icon name="iconoir:play" size="24px" class="align-self-center" /> }</a
                >
                <button
                  class="flex text-sm text-slate-500 rounded hover:text-slate-600 hover:bg-slate-100 p-1 cursor-pointer"
                  (click)="toggleManage(c.id)"
                  title="Edit game settings"
                >
                  <ng-icon name="iconoir:edit-pencil" size="24px" class="align-self-center" />
                </button>
              </div>
            </li>
            @if (expanded[c.id]) {
            <li class="p-3 border border-slate-200 rounded bg-slate-50">
              <div class="text-sm text-slate-700 font-medium mb-2">Players/Teams</div>
              <div class="flex flex-wrap gap-2">
                @for (p of c.players; track p.id) {
                <span
                  class="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded text-sm"
                >
                  <span class="text-slate-800">{{ p.name }}</span>
                  <button
                    class="text-rose-600 hover:text-rose-800 ml-2 cursor-pointer"
                    (click)="removePlayerFromCard(c.id, p.id)"
                    [disabled]="c.finishedAt"
                    title="Remove player/team"
                  >
                    &times;
                  </button>
                </span>
                }
              </div>
            </li>
            } }
          </ul>
        </section>
      </div>
    </div>
  `,
})
export class ScoreCardEditor {
  protected name = '';
  protected newPlayerName = '';
  protected players: Player[] = [];
  protected scoreCards: ScoreCard[] = [];
  protected expanded: Record<string, boolean> = {};

  constructor(private svc: ScoreService) {
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
    this.loadCards();
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
