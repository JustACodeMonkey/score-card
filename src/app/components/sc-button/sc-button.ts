import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { scButtonRecipe } from './sc-button.recipe';

@Component({
  selector: 'sc-button',
  imports: [CommonModule, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="onClick($event)"
      [attr.aria-label]="ariaLabel() || undefined"
      [disabled]="disabled()"
      [class]="classes.button()"
    >
      @if (icon()) {
      <ng-icon [name]="icon()" [class]="classes.icon()" />
      }
      <ng-content></ng-content>
    </button>
  `,
  host: { class: 'inline-block' },
})
export class ScButton {
  readonly icon = input<string | undefined>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | undefined>();

  // Recipe variants
  readonly visual = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly clicked = output<void>();

  protected onClick(e: Event) {
    if (this.disabled?.()) return;
    (this.clicked as any)?.emit?.();
  }

  protected get classes() {
    return scButtonRecipe({
      visual: this.visual(),
      size: this.size(),
    });
  }
}
