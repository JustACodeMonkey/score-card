import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'sc-tag',
  imports: [CommonModule, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-2 px-3 py-1 
      bg-gray-100 border border-gray-300
      rounded-md text-sm text-slate-800"
    >
      <span class="leading-none">{{ label() }}</span>
      @if (icon()) {
      <button
        type="button"
        class="flex items-center justify-center w-5 h-5 text-slate-600 p-0 cursor-pointer rounded-full transition-colors
        outline-gray-300
        hover:text-slate-800 
        focus-visible:outline-1"
        (click)="onIconClick($event)"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() || 'Action for ' + label()"
      >
        <ng-icon [name]="icon()" size="16px" />
      </button>
      }
    </span>
  `,
  host: { class: 'inline-block' },
})
export class ScTag {
  readonly label = input<string>('');
  readonly icon = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>();
  readonly disabled = input<boolean>(false);

  readonly iconClick = output<void>();

  protected onIconClick(e: Event) {
    e.stopPropagation();
    (this.iconClick as any)?.emit?.();
  }
}
