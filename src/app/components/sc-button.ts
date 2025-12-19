import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

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
      [class]="
        'inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full ' +
        'outline-gray-300 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gray-300 ' +
        (color() === 'primary'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : color() === 'secondary'
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
          : color() === 'danger'
          ? 'bg-rose-600  hover:bg-rose-700 text-white'
          : color() === 'ghost'
          ? 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent'
          : 'text-inherit hover:text-inherit bg-transparent hover:bg-slate-50') +
        ' ' +
        buttonClass()
      "
    >
      @if (icon()) {
      <ng-icon [name]="icon()" [size]="iconSize() || '16px'" [class]="iconClass() + ' shrink-0'" />
      }
      <ng-content></ng-content>
    </button>
  `,
  host: { class: 'inline-block' },
})
export class ScButton {
  readonly color = input<'primary' | 'secondary' | 'danger' | 'ghost' | 'icon-only'>('primary');
  readonly buttonClass = input<string>('');
  readonly icon = input<string | undefined>();
  readonly iconSize = input<string>('');
  readonly iconClass = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | undefined>();

  readonly clicked = output<void>();

  protected onClick(e: Event) {
    if (this.disabled?.()) return;
    (this.clicked as any)?.emit?.();
  }
}
