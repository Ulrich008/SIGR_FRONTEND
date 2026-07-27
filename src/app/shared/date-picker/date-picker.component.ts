import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';

/**
 * Champ date basé sur Flatpickr, branché en ControlValueAccessor pour se
 * substituer telle quelle à un <input type="date" formControlName="...">
 * dans tous les formulaires : la valeur exposée au FormControl reste une
 * chaîne ISO "AAAA-MM-JJ" (dateFormat), inchangée pour le reste du code —
 * seul l'affichage (altFormat) est en jj/mm/aaaa.
 */
@Component({
  standalone: true,
  selector: 'app-date-picker',
  template: `
    <input
      #dateInput
      type="text"
      [attr.placeholder]="placeholder"
      autocomplete="off"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('dateInput', { static: true }) dateInputRef!: ElementRef<HTMLInputElement>;

  @Input() placeholder = 'jj/mm/aaaa';
  @Input() minDate?: string;
  @Input() maxDate?: string;

  private fp?: FlatpickrInstance;
  private pendingValue: string | null = null;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.fp = flatpickr(this.dateInputRef.nativeElement, {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      locale: French,
      allowInput: true,
      minDate: this.minDate,
      maxDate: this.maxDate,
      onChange: (_dates, dateStr) => {
        this.onChange(dateStr || null);
      },
      onClose: () => {
        this.onTouched();
      }
    }) as FlatpickrInstance;

    if (this.pendingValue !== null) {
      this.fp.setDate(this.pendingValue, false);
    }
  }

  writeValue(value: string | null): void {
    if (this.fp) {
      this.fp.setDate(value || '', false);
    } else {
      this.pendingValue = value;
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    const input = this.fp?.altInput ?? this.dateInputRef.nativeElement;
    input.disabled = isDisabled;
  }

  ngOnDestroy(): void {
    this.fp?.destroy();
  }
}
