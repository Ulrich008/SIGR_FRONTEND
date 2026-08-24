import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Pagination partagée : remplace les blocs de pagination "faits main"
 * dupliqués (et légèrement divergents) dans chaque page de liste, et
 * ajoute une capacité qu'aucun n'avait — choisir le nombre d'éléments
 * par page — comme demandé.
 *
 * L'état (page courante, nombre par page) reste possédé par le composant
 * parent : celui-ci ne fait que l'afficher et émettre les changements,
 * via un binding bidirectionnel `[(currentPage)]` / `[(itemsPerPage)]`.
 */
@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="totalItems > 0"
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 p-4"
      [ngClass]="sticky ? 'sticky bottom-0 z-10 bg-white shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.15)]' : ''"
    >
      <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span>
          Affichage de <b class="text-slate-700">{{ rangeStart }}</b> à
          <b class="text-slate-700">{{ rangeEnd }}</b> sur
          <b class="text-slate-700">{{ totalItems }}</b> {{ itemLabel }}
        </span>
        <label *ngIf="itemsPerPageOptions.length" class="flex items-center gap-1.5">
          <span>Afficher</span>
          <select
            [ngModel]="itemsPerPage"
            (ngModelChange)="changeItemsPerPage($event)"
            class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm focus:border-emerald-400 focus:outline-none"
          >
            <option *ngFor="let n of itemsPerPageOptions" [value]="n">{{ n }}</option>
          </select>
          <span>par page</span>
        </label>
      </div>

      <div class="flex items-center gap-1.5" *ngIf="totalPages > 1">
        <button
          type="button"
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1"
          class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>

        <ng-container *ngFor="let p of pageNumbers">
          <span *ngIf="p === null" class="px-1.5 text-sm text-slate-400 select-none">…</span>
          <button
            *ngIf="p !== null"
            type="button"
            (click)="goToPage(p)"
            [class.bg-emerald-600]="p === currentPage"
            [class.text-white]="p === currentPage"
            [class.bg-slate-100]="p !== currentPage"
            [class.text-slate-700]="p !== currentPage"
            class="min-w-[2.25rem] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
          >{{ p }}</button>
        </ng-container>

        <button
          type="button"
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage === totalPages"
          class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() itemsPerPageOptions: number[] = [10, 20, 50, 100];
  @Input() itemLabel = 'éléments';
  /** Colle la barre de pagination en bas de la zone de défilement (utile pour les listes en grille de cartes, qui peuvent être longues). */
  @Input() sticky = false;

  @Output() currentPageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  /** Fenêtre de pages avec ellipse (null) — toujours 1ère/dernière page + voisines de la page courante. */
  get pageNumbers(): (number | null)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;

    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        pages.push(i);
      }
    }

    const result: (number | null)[] = [];
    let previous = 0;
    for (const page of pages) {
      if (page - previous > 1) {
        result.push(null);
      }
      result.push(page);
      previous = page;
    }
    return result;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPageChange.emit(page);
  }

  changeItemsPerPage(value: number): void {
    const size = Number(value);
    if (size === this.itemsPerPage) return;
    this.itemsPerPageChange.emit(size);
    this.currentPageChange.emit(1);
  }
}
