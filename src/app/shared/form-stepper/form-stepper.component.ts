import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface FormStepDef {
  label: string;
  description?: string;
}

@Component({
  standalone: true,
  selector: 'app-form-stepper',
  imports: [CommonModule],
  template: `
    <nav class="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5">
      <ol class="flex items-start">
        <li *ngFor="let step of steps; let i = index; let last = last" class="flex-1 flex items-start">
          <div class="flex flex-col items-center gap-1.5 min-w-0" [class.cursor-pointer]="i <= maxReachedStep"
               (click)="i <= maxReachedStep && stepClick.emit(i)">
            <div
              class="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors"
              [ngClass]="{
                'bg-emerald-600 text-white': i < currentStep,
                'bg-slate-900 text-white ring-4 ring-slate-200': i === currentStep,
                'bg-slate-100 text-slate-400': i > currentStep
              }">
              <svg *ngIf="i < currentStep" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <span *ngIf="i >= currentStep">{{ i + 1 }}</span>
            </div>
            <span class="text-[11px] md:text-xs font-medium text-center whitespace-nowrap"
                  [ngClass]="i === currentStep ? 'text-slate-900' : 'text-slate-400'">
              {{ step.label }}
            </span>
          </div>
          <div *ngIf="!last" class="flex-1 h-0.5 mt-4 md:mt-4.5 mx-2 rounded-full transition-colors"
               [ngClass]="i < currentStep ? 'bg-emerald-600' : 'bg-slate-100'"></div>
        </li>
      </ol>
    </nav>
  `,
  styles: [':host { display: block; }']
})
export class FormStepperComponent {
  @Input() steps: FormStepDef[] = [];
  @Input() currentStep = 0;
  @Input() maxReachedStep = 0;
  @Output() stepClick = new EventEmitter<number>();
}
