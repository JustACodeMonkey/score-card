import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScInput } from '../sc-input';
import { ScButton } from '../sc-button/sc-button';

@Component({
  selector: 'sc-clone-dialog',
  standalone: true,
  imports: [CommonModule, ScInput, ScButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 class="text-lg font-medium mb-3">Clone Game</h3>
        <p class="text-sm text-slate-600 mb-3">Provide a name for the cloned game.</p>
        <sc-input [(value)]="name" placeholder="New game name" />
        <div class="flex justify-end gap-2 mt-4">
          <sc-button visual="ghost" (click)="onCancel()">Cancel</sc-button>
          <sc-button visual="primary" (click)="onClone()" [disabled]="!name().trim()"
            >Clone Game</sc-button
          >
        </div>
      </div>
    </div>
  `,
})
export class ScCloneDialog {
  readonly original = input('');
  readonly cancel = output();
  readonly clone = output<string>();

  readonly name = signal(this.original());

  protected onCancel() {
    this.cancel.emit();
  }

  protected onClone() {
    this.clone.emit(this.name() || '');
  }
}
