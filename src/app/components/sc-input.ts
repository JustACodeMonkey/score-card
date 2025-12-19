import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sc-input',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex flex-col gap-1 text-sm text-slate-700">
      @if (label()) { <span class="line-clamp-1">{{ label() }}</span> }
      <input
        [attr.name]="name()"
        [type]="type()"
        [inputMode]="inputMode()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        class="w-full border border-gray-300 
        hover:border-gray-600 
        focus-visible:border-gray-600
        focus-visible:outline-1
        focus-visible:outline-gray-600
        rounded px-3 py-2 transition-colors"
        [attr.aria-label]="ariaLabel() || placeholder() || name()"
      />
    </label>
  `,
  host: { class: 'block' },
})
export class ScInput {
  readonly value = model<string | number>('');

  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'number' | 'password' | 'email'>('text');
  readonly inputMode = input<'text' | 'numeric' | 'decimal' | 'email' | 'url'>('text');
  readonly disabled = input<boolean>(false);
  readonly name = input<string | undefined>();
  readonly ariaLabel = input<string | undefined>();

  readonly label = input<string | undefined>('');

  protected onInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.value.set?.(v);
  }
}
