import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  viewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreService } from '../score-card/score.service';
import { Player } from '../score-card/models';
import { ScInput } from './sc-input';
import { ScTag } from './sc-tag';
import { ScIconButton } from './sc-icon-button/sc-icon-button';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'sc-add-players',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ScInput, ScTag, ScIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex-1 block">
      <span class="text-sm text-slate-700 block mb-1">Players/Teams</span>
      @if (!addingNew()) {
        <div>
          <select
            class="w-full border rounded px-3 py-2"
            [formControl]="selectedSessionPlayerControl"
            (change)="onSessionChange($event)"
            aria-label="Select existing player or add new"
          >
            <option [ngValue]="null">-- Select existing player --</option>
            <option [value]="'__add_new__'">+ Add new player...</option>
            @for (sp of availableSessionPlayers(); track sp.id) {
              <option [value]="sp.id">{{ sp.name }}</option>
            }
          </select>
        </div>
      } @else {
        <div class="flex gap-2">
          <sc-input
            #newPlayerInput
            class="flex-1"
            name="players-teams-name"
            [formControl]="newPlayerNameControl"
            placeholder="New player/team"
            (keyup.enter)="addClicked()"
            aria-label="New player name"
          />
          <sc-icon-button
            visual="primary"
            (click)="addClicked()"
            [disabled]="!canAdd()"
            icon="iconoir:plus-circle"
            title="Add player"
          />
          <sc-icon-button
            visual="ghost"
            (click)="cancelNew()"
            icon="iconoir:xmark"
            title="Cancel"
          />
        </div>
      }
    </label>

    @if (players().length > 0) {
      <div class="mt-3">
        <div class="flex flex-wrap gap-2">
          @for (p of players(); track p.id) {
            <sc-tag [label]="p.name" (iconClick)="removeClicked(p.id)" icon="iconoir:xmark" />
          }
        </div>
      </div>
    }
  `,
})
export class ScAddPlayers {
  private svc = inject(ScoreService);

  readonly players = input<Player[]>([]);
  readonly sessionPlayers = input<Player[]>([]);

  readonly add = output<Player>();
  readonly remove = output<string>();

  protected addingNew = signal(false);
  protected selectedSessionPlayerControl = new FormControl<string | null>(null);
  protected newPlayerNameControl = new FormControl<string>('');

  protected newPlayerInput = viewChild<ScInput>('newPlayerInput');

  protected onSessionChange(_e?: Event) {
    const val = this.selectedSessionPlayerControl.value;
    if (val === '__add_new__') {
      this.addingNew.set(true);
      this.newPlayerNameControl.setValue('');
      setTimeout(() => this.newPlayerInput()?.focus(), 0);
      return;
    }
    this.addingNew.set(false);
    if (val && val !== '__add_new__') {
      const sp = (this.sessionPlayers() || []).find((s) => s.id === val);
      if (sp) this.add.emit(sp);
      this.selectedSessionPlayerControl.setValue(null);
    }
  }

  protected canAdd() {
    if (this.addingNew())
      return !!this.newPlayerNameControl.value && !!this.newPlayerNameControl.value.trim();
    return (
      !!this.selectedSessionPlayerControl.value &&
      this.selectedSessionPlayerControl.value !== '__add_new__'
    );
  }

  protected addClicked() {
    if (this.addingNew() && this.newPlayerNameControl.value?.trim()) {
      const name = this.newPlayerNameControl.value.trim();
      // reuse existing session player by case-insensitive match
      const existing = (this.sessionPlayers() || []).find(
        (p) => p.name.trim().toLowerCase() === name.toLowerCase(),
      );
      let saved = existing;
      if (!saved) saved = this.svc.saveSessionPlayer(name);
      this.add.emit?.(saved);
      this.newPlayerNameControl.setValue('');
      this.addingNew.set(false);
      return;
    }
    const sel = this.selectedSessionPlayerControl.value;
    if (sel && sel !== '__add_new__') {
      const sp = (this.sessionPlayers() || []).find((s) => s.id === sel);
      if (sp) this.add.emit(sp);
      this.selectedSessionPlayerControl.setValue(null);
    }
  }

  protected removeClicked(id: string) {
    this.remove.emit(id);
  }

  protected cancelNew() {
    this.addingNew.set(false);
    this.newPlayerNameControl.setValue('');
    this.selectedSessionPlayerControl.setValue(null);
  }

  protected availableSessionPlayers(): Player[] {
    const all = this.sessionPlayers() || [];
    const existing = this.players() || [];
    return all.filter((s) => !existing.some((p) => p.id === s.id));
  }
}
