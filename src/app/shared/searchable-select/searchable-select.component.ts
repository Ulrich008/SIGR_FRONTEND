import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

/**
 * Remplace un <select> classique par un champ de recherche : au-delà d'un
 * certain volume de données (risques, processus, agents...), un menu
 * déroulant natif devient inutilisable. Tape pour filtrer, clique pour
 * choisir — la valeur du FormControl reste le "value" de l'option (code
 * métier), comme un select normal.
 */
@Component({
  standalone: true,
  selector: 'app-searchable-select',
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        #inputRef
        type="text"
        [attr.placeholder]="placeholder"
        autocomplete="off"
        [disabled]="disabled"
        [value]="searchText"
        (input)="onInput($event)"
        (focus)="onFocus()"
        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      />
      <div *ngIf="showDropdown && filteredOptions.length > 0"
        class="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
        <div *ngFor="let opt of filteredOptions"
          (mousedown)="select(opt)"
          class="px-4 py-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-sm text-slate-700">
          {{ opt.label }}
        </div>
      </div>
      <div *ngIf="showDropdown && filteredOptions.length === 0"
        class="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg px-4 py-3 text-sm text-slate-400">
        Aucun résultat
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true
    }
  ]
})
export class SearchableSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() options: SearchableSelectOption[] = [];
  @Input() placeholder = 'Rechercher...';

  /**
   * Désactivation "externe" (ex: [disabled]="!form.get('parent')?.value"
   * pour une cascade de champs), cumulable avec la désactivation pilotée
   * par Angular Reactive Forms via setDisabledState().
   */
  @Input()
  set disabled(value: boolean | null | undefined) {
    this.externalDisabled = !!value;
  }
  get disabled(): boolean {
    return this.externalDisabled || this.cvaDisabled;
  }

  searchText = '';
  showDropdown = false;
  filteredOptions: SearchableSelectOption[] = [];
  private externalDisabled = false;
  private cvaDisabled = false;

  private value: string | null = null;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.syncSearchTextWithValue();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.showDropdown = false;
      this.syncSearchTextWithValue();
    }
  }

  onInput(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.filterOptions();
    this.showDropdown = true;
    if (!this.searchText) {
      this.value = null;
      this.onChange(null);
    }
  }

  onFocus(): void {
    this.filterOptions();
    this.showDropdown = true;
  }

  private filterOptions(): void {
    const terme = this.searchText.trim().toLowerCase();
    this.filteredOptions = !terme
      ? this.options
      : this.options.filter(o => o.label.toLowerCase().includes(terme));
  }

  select(opt: SearchableSelectOption): void {
    this.value = opt.value;
    this.searchText = opt.label;
    this.showDropdown = false;
    this.onChange(this.value);
    this.onTouched();
  }

  private syncSearchTextWithValue(): void {
    const selected = this.options.find(o => o.value === this.value);
    this.searchText = selected ? selected.label : (this.value ?? '');
  }

  writeValue(value: string | null): void {
    this.value = value;
    this.syncSearchTextWithValue();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }
}
