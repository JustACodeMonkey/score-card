import { Component, inject, viewChild } from '@angular/core';
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
import { ScAddPlayers } from '../components/sc-add-players';
import { ScTag } from '../components/sc-tag';
import { ScButton } from '../components/sc-button/sc-button';
import { ScIconButton } from '../components/sc-icon-button/sc-icon-button';
import * as Yahtzee from './game-templates/yahtzee/yahtzee';
import * as SevenWonders from './game-templates/seven-wonders/seven-wonders';
import * as SevenWondersDuel from './game-templates/seven-wonders-duel/seven-wonders-duel';
import * as Clue from './game-templates/clue/clue';
import * as Catan from './game-templates/catan/catan';
import { ScCloneDialog } from '../components/dialogs/sc-clone-dialog';

@Component({
  selector: 'score-card-editor',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIcon,
    ScAddPlayers,
    ScCloneDialog,
    ScInput,
    ScTag,
    ScButton,
    ScIconButton,
  ],
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
    @if (cloneModalVisible) {
      <sc-clone-dialog
        [original]="cloneOriginalName"
        (cancel)="cancelClone()"
        (clone)="confirmClone($event)"
      />
    }
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
          <sc-add-players
            [players]="players"
            [sessionPlayers]="sessionPlayers"
            (add)="handlePlayerAdded($event)"
            (remove)="removeLocalPlayer($event)"
            class="w-full"
          />
        </div>

        <div class="mt-4">
          <label class="block text-sm text-slate-700 mb-2">Template</label>
          <select class="w-full border rounded px-3 py-2 mb-3" [(ngModel)]="selectedTemplate">
            <option [value]="''">None (start with no rounds)</option>
            <option [value]="'yahtzee'">Yahtzee (standard scorecard)</option>
            <option [value]="'seven-wonders'">Seven Wonders (common scoring lines)</option>
            <option [value]="'seven-wonders-duel'">Seven Wonders Duel (2-player variant)</option>
            <option [value]="'clue'">Clue (mystery deduction points)</option>
            <option [value]="'catan'">Catan (settlements/cities/bonuses)</option>
          </select>
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
                    Updated: {{ c.updatedAt | date: 'short' }}
                  </div>
                }
              </div>
              <div class="flex items-center gap-1">
                <a
                  class="flex text-blue-600 hover:text-blue-700
                  focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-gray-300 rounded-full p-1"
                  [routerLink]="['games', c.id]"
                >
                  @if (c.finishedAt) {
                    <ng-icon name="iconoir:eye" size="24px" class="align-self-center" />
                  } @else {
                    <ng-icon name="iconoir:play" size="24px" class="align-self-center" />
                  }
                </a>
                <sc-icon-button
                  visual="ghost"
                  (click)="toggleManage(c.id)"
                  title="Edit game settings"
                  [icon]="expanded[c.id] ? 'iconoir:xmark' : 'iconoir:edit-pencil'"
                />
                <sc-icon-button
                  visual="ghost"
                  (click)="openCloneDialog(c.id, c.name)"
                  title="Duplicate game"
                  icon="iconoir:plus-circle"
                />
              </div>
            </li>
            @if (expanded[c.id]) {
              <li class="p-3 border border-slate-200 rounded bg-slate-50">
                <div class="mt-3">
                  <sc-add-players
                    [players]="c.players"
                    [sessionPlayers]="sessionPlayers"
                    (add)="addSessionPlayerToCardWithPlayer(c.id, $event)"
                    (remove)="removePlayerFromCard(c.id, $event)"
                  />
                </div>

                <div class="mt-4 border border-red-300 bg-red-50 p-3 rounded">
                  <div class="text-sm font-medium text-red-800 mb-1">Danger Zone</div>
                  <p class="text-xs mb-3">
                    Deleting a game will remove all rounds and scores. This cannot be undone.
                  </p>

                  @if (!confirmDelete[c.id]) {
                    <div class="flex gap-2">
                      <sc-button
                        visual="danger"
                        (click)="confirmDeleteCard(c.id)"
                        title="Delete game"
                      >
                        Delete Game
                      </sc-button>
                    </div>
                  } @else {
                    <div class="flex gap-2">
                      <sc-button visual="danger" (click)="deleteCard(c.id)" title="Confirm delete">
                        Confirm Delete
                      </sc-button>
                      <sc-button visual="ghost" (click)="cancelDeleteCard(c.id)">Cancel</sc-button>
                    </div>
                  }
                </div>
              </li>
            }
          }
        </ul>
      </section>
    </div>
  `,
})
export class ScoreCardEditor {
  protected name = '';
  protected newPlayerName = '';
  protected players: Player[] = [];
  protected sessionPlayers: Player[] = [];
  protected addingNewPlayer = false;
  protected selectedSessionPlayerId = '';
  protected manageSelected: Record<string, string> = {};
  protected selectedTemplate = '';
  protected scoreCards: ScoreCard[] = [];
  protected expanded: Record<string, boolean> = {};
  protected confirmDelete: Record<string, boolean> = {};

  private svc = inject(ScoreService);
  private router = inject(Router);

  protected cloneModalVisible = false;
  protected cloneSourceId: string | null = null;
  protected cloneOriginalName = '';
  protected cloneName = '';

  constructor() {
    this.loadCards();
    this.loadSessionPlayers();
  }

  protected newPlayerInput = viewChild<ScInput>('newPlayerInput');

  protected addPlayer() {
    // If a session player is selected, add that one
    if (this.selectedSessionPlayerId && this.selectedSessionPlayerId !== '__add_new__') {
      const sp = this.sessionPlayers.find((s) => s.id === this.selectedSessionPlayerId);
      if (sp) {
        this.players.push({ id: sp.id, name: sp.name });
      }
      // reset selection
      this.selectedSessionPlayerId = '';
      this.addingNewPlayer = false;
      return;
    }

    const n = this.newPlayerName?.trim();
    if (!n) return;
    // if the entered name matches an existing session player (case-insensitive), reuse it
    const existing = this.sessionPlayers.find(
      (p) => p.name.trim().toLowerCase() === n.toLowerCase(),
    );
    let saved = existing;
    if (!saved) {
      // save to session players for reuse
      saved = this.svc.saveSessionPlayer(n);
      this.sessionPlayers = this.svc.listSessionPlayers();
    }
    this.players.push({ id: saved.id, name: saved.name });
    this.newPlayerName = '';
    this.addingNewPlayer = false;
  }

  protected handlePlayerAdded(p: Player) {
    if (!this.players.find((x) => x.id === p.id)) this.players.push({ id: p.id, name: p.name });
  }

  protected onSessionPlayerChange(e: Event | any) {
    const val = this.selectedSessionPlayerId;
    if (val === '__add_new__') {
      this.addingNewPlayer = true;
      this.newPlayerName = '';
      // focus the new player input
      setTimeout(() => this.newPlayerInput()?.focus(), 0);
      return;
    }

    // if an existing session player was selected, add them immediately
    if (val) {
      const sp = this.sessionPlayers.find((s) => s.id === val);
      if (sp) {
        // avoid duplicates
        if (!this.players.find((p) => p.id === sp.id)) {
          this.players.push({ id: sp.id, name: sp.name });
        }
      }
      // reset selection
      this.selectedSessionPlayerId = '';
      this.addingNewPlayer = false;
    }
  }

  private loadSessionPlayers() {
    this.sessionPlayers = this.svc.listSessionPlayers();
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
    // apply selected template by explicitly adding template labels to the newly-created card
    if (this.selectedTemplate && scoreCard && scoreCard.id) {
      let labelsToAdd: string[] = [];
      if (this.selectedTemplate === 'yahtzee') {
        labelsToAdd = [...Yahtzee.upperLabels, ...Yahtzee.lowerLabels];
      } else if (this.selectedTemplate === 'seven-wonders') {
        labelsToAdd = (SevenWonders as any).labels || [];
      } else if (this.selectedTemplate === 'seven-wonders-duel') {
        labelsToAdd = (SevenWondersDuel as any).labels || [];
      } else if (this.selectedTemplate === 'clue') {
        labelsToAdd = (Clue as any).labels || [];
      } else if (this.selectedTemplate === 'catan') {
        labelsToAdd = (Catan as any).labels || [];
      }

      for (const label of labelsToAdd) {
        this.svc.addRound(scoreCard.id, label);
      }
    }
    this.name = '';
    this.players = [];
    this.selectedTemplate = '';
    // navigate to the newly created game's play view
    this.router.navigate(['games', scoreCard.id]);
  }

  protected duplicateCard(id: string) {
    // legacy direct duplication (no prompt)
    const copy = this.svc.duplicate(id);
    if (copy) this.loadCards();
  }

  protected openCloneDialog(id: string, original: string) {
    this.cloneSourceId = id;
    this.cloneOriginalName = original;
    this.cloneName = `Copy of ${original}`;
    this.cloneModalVisible = true;
  }

  protected cancelClone() {
    this.cloneModalVisible = false;
    this.cloneSourceId = null;
    this.cloneName = '';
  }

  protected confirmClone(name?: string) {
    if (!this.cloneSourceId) return;
    const newName = (name && name.trim()) || this.cloneName || `Copy of ${this.cloneOriginalName}`;
    const orig = this.svc.get(this.cloneSourceId);
    if (!orig) return;
    // create a copy with the provided name, preserving structure but clearing scores
    const copy = this.svc.duplicate(this.cloneSourceId);
    if (copy) {
      copy.name = newName;
      this.svc.save(copy);
      this.loadCards();
    }
    this.cancelClone();
  }

  protected addSessionPlayerToCard(cardId: string) {
    const pid = this.manageSelected[cardId];
    if (!pid) return;
    const sp = this.sessionPlayers.find((s) => s.id === pid);
    if (!sp) return;
    this.svc.addPlayerToCard(cardId, sp);
    this.loadCards();
    this.manageSelected[cardId] = '';
  }

  protected addSessionPlayerToCardWithPlayer(cardId: string, player: Player) {
    if (!cardId || !player) return;
    this.svc.addPlayerToCard(cardId, player);
    this.loadCards();
  }

  // enabled when either an existing session player is selected or a non-empty new name is entered
  protected get canAddPlayer() {
    const hasSelected =
      !!this.selectedSessionPlayerId && this.selectedSessionPlayerId !== '__add_new__';
    const hasNew = !!(this.addingNewPlayer && this.newPlayerName && this.newPlayerName.trim());
    return hasSelected || hasNew;
  }

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
