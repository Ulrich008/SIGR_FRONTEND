import './polyfills.server.mjs';
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  Validators,
  ɵNgNoValidate
} from "./chunk-LMIJK5JT.mjs";
import {
  MainLayoutComponent,
  Swal
} from "./chunk-AP2TC6XY.mjs";
import {
  ActivatedRoute,
  CommonModule,
  Component,
  HttpClient,
  Injectable,
  NgForOf,
  NgIf,
  NgModule,
  Router,
  RouterModule,
  environment,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-MJB2LVY2.mjs";
import {
  __objRest
} from "./chunk-T2KOBY73.mjs";

// src/app/core/services/ministere.service.ts
var MinistereService = class _MinistereService {
  http;
  apiUrl = `${environment.apiUrl}/api/ministeres`;
  constructor(http) {
    this.http = http;
  }
  getAll() {
    return this.http.get(this.apiUrl);
  }
  getById(id) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  create(request) {
    return this.http.post(this.apiUrl, request);
  }
  update(id, request) {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }
  delete(id) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  static \u0275fac = function MinistereService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MinistereService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MinistereService, factory: _MinistereService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MinistereService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: HttpClient }], null);
})();

// src/app/modules/ministeres/pages/ministere-list/ministere-list.component.ts
function MinistereListComponent_div_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 15);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.error, " ");
  }
}
function MinistereListComponent_tr_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 16)(1, "td", 17);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td", 17);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "td", 17);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "td", 17);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "td", 18)(10, "button", 19);
    \u0275\u0275listener("click", function MinistereListComponent_tr_27_Template_button_click_10_listener() {
      const ministere_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.editMinistere(ministere_r3.id));
    });
    \u0275\u0275text(11, "Modifier");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 20);
    \u0275\u0275listener("click", function MinistereListComponent_tr_27_Template_button_click_12_listener() {
      const ministere_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.deleteMinistere(ministere_r3.id));
    });
    \u0275\u0275text(13, "Supprimer");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ministere_r3 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ministere_r3.code);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ministere_r3.nom);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ministere_r3.sigle || "\u2014");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ministere_r3.creePar || "Anonyme");
  }
}
function MinistereListComponent_tr_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 21);
    \u0275\u0275text(2, "Aucun minist\xE8re trouv\xE9.");
    \u0275\u0275elementEnd()();
  }
}
function MinistereListComponent_div_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275text(1, " Chargement des minist\xE8res... ");
    \u0275\u0275elementEnd();
  }
}
var MinistereListComponent = class _MinistereListComponent {
  ministereService;
  router;
  ministeres = [];
  loading = false;
  error = null;
  menuItems = [
    { icon: "fas fa-th", label: "Tableau de bord", path: "/dashboard" },
    { icon: "fas fa-building", label: "Structures", path: "/ministeres" },
    { icon: "fas fa-columns", label: "Sections" },
    { icon: "fas fa-chart-line", label: "Processus" },
    { icon: "fas fa-exclamation-triangle", label: "Risques" },
    { icon: "fas fa-table", label: "Matrice" },
    { icon: "fas fa-chart-simple", label: "Indicateurs" },
    { icon: "fas fa-book", label: "Biblioth\xE8que" },
    { icon: "fas fa-users", label: "Utilisateurs" }
  ];
  constructor(ministereService, router) {
    this.ministereService = ministereService;
    this.router = router;
  }
  ngOnInit() {
    this.loadMinisteres();
  }
  loadMinisteres() {
    this.loading = true;
    this.error = null;
    this.ministereService.getAll().subscribe({
      next: (ministeres) => {
        this.ministeres = ministeres;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || "Impossible de charger les minist\xE8res";
      }
    });
  }
  createMinistere() {
    this.router.navigate(["/ministeres/nouveau"]);
  }
  editMinistere(id) {
    this.router.navigate(["/ministeres", id, "edit"]);
  }
  deleteMinistere(id) {
    Swal.fire({
      title: "Supprimer ce minist\xE8re ?",
      text: "Cette action est irr\xE9versible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2",
        cancelButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2"
      },
      buttonsStyling: false
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      this.loading = true;
      this.error = null;
      this.ministereService.delete(id).subscribe({
        next: () => {
          this.loadMinisteres();
          Swal.fire({
            title: "Supprim\xE9",
            text: "Le minist\xE8re a bien \xE9t\xE9 supprim\xE9.",
            icon: "success",
            timer: 1800,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || "Impossible de supprimer le minist\xE8re";
        }
      });
    });
  }
  static \u0275fac = function MinistereListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MinistereListComponent)(\u0275\u0275directiveInject(MinistereService), \u0275\u0275directiveInject(Router));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MinistereListComponent, selectors: [["app-ministere-list"]], decls: 30, vars: 5, consts: [["activeMenu", "Structures", "searchPlaceholder", "Rechercher un minist\xE8re...", "organizationName", "Minist\xE8re de l'\xC9conomie et des Finances", "userInitials", "AD", 3, "menuItems"], [1, "p-6"], [1, "max-w-6xl", "mx-auto", "space-y-6"], [1, "flex", "flex-col", "md:flex-row", "md:items-center", "md:justify-between", "gap-4"], [1, "text-sm", "text-gray-500"], [1, "text-2xl", "font-semibold", "text-slate-900"], [1, "inline-flex", "items-center", "justify-center", "rounded-lg", "bg-emerald-700", "px-4", "py-2", "text-sm", "font-semibold", "text-white", "shadow-sm", "transition", "hover:bg-emerald-600", 3, "click"], ["class", "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700", 4, "ngIf"], [1, "overflow-hidden", "rounded-3xl", "bg-white", "shadow-sm"], [1, "min-w-full", "table-auto", "border-collapse", "text-sm"], [1, "bg-slate-100", "text-left", "text-xs", "uppercase", "tracking-wide", "text-slate-500"], [1, "px-4", "py-3"], ["class", "border-t border-slate-200 hover:bg-slate-50", 4, "ngFor", "ngForOf"], [4, "ngIf"], ["class", "rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm", 4, "ngIf"], [1, "rounded-lg", "border", "border-red-200", "bg-red-50", "p-4", "text-sm", "text-red-700"], [1, "border-t", "border-slate-200", "hover:bg-slate-50"], [1, "px-4", "py-4", "text-slate-700"], [1, "px-4", "py-4", "space-x-2"], [1, "rounded-lg", "bg-slate-100", "px-3", "py-2", "text-xs", "font-semibold", "text-slate-700", "transition", "hover:bg-slate-200", 3, "click"], [1, "rounded-lg", "bg-red-100", "px-3", "py-2", "text-xs", "font-semibold", "text-red-700", "transition", "hover:bg-red-200", 3, "click"], ["colspan", "5", 1, "px-4", "py-8", "text-center", "text-slate-500"], [1, "rounded-3xl", "bg-white", "p-6", "text-center", "text-sm", "text-slate-500", "shadow-sm"]], template: function MinistereListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "app-main-layout", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "div")(5, "p", 4);
      \u0275\u0275text(6, "Administration");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "h1", 5);
      \u0275\u0275text(8, "Minist\xE8res");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "button", 6);
      \u0275\u0275listener("click", function MinistereListComponent_Template_button_click_9_listener() {
        return ctx.createMinistere();
      });
      \u0275\u0275text(10, " Nouveau minist\xE8re ");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(11, MinistereListComponent_div_11_Template, 2, 1, "div", 7);
      \u0275\u0275elementStart(12, "div", 8)(13, "table", 9)(14, "thead", 10)(15, "tr")(16, "th", 11);
      \u0275\u0275text(17, "Code");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "th", 11);
      \u0275\u0275text(19, "Nom");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "th", 11);
      \u0275\u0275text(21, "Sigle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "th", 11);
      \u0275\u0275text(23, "Cr\xE9\xE9 par");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "th", 11);
      \u0275\u0275text(25, "Actions");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(26, "tbody");
      \u0275\u0275template(27, MinistereListComponent_tr_27_Template, 14, 4, "tr", 12)(28, MinistereListComponent_tr_28_Template, 3, 0, "tr", 13);
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(29, MinistereListComponent_div_29_Template, 2, 0, "div", 14);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275property("menuItems", ctx.menuItems);
      \u0275\u0275advance(11);
      \u0275\u0275property("ngIf", ctx.error);
      \u0275\u0275advance(16);
      \u0275\u0275property("ngForOf", ctx.ministeres);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.loading && ctx.ministeres.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.loading);
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, RouterModule, MainLayoutComponent], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MinistereListComponent, [{
    type: Component,
    args: [{ standalone: true, selector: "app-ministere-list", imports: [CommonModule, RouterModule, MainLayoutComponent], template: `<app-main-layout
  [menuItems]="menuItems"
  activeMenu="Structures"
  searchPlaceholder="Rechercher un minist\xE8re..."
  organizationName="Minist\xE8re de l'\xC9conomie et des Finances"
  userInitials="AD">

  <div class="p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-sm text-gray-500">Administration</p>
          <h1 class="text-2xl font-semibold text-slate-900">Minist\xE8res</h1>
        </div>
        <button
          (click)="createMinistere()"
          class="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          Nouveau minist\xE8re
        </button>
      </div>

      <div *ngIf="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="overflow-hidden rounded-3xl bg-white shadow-sm">
        <table class="min-w-full table-auto border-collapse text-sm">
          <thead class="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Code</th>
              <th class="px-4 py-3">Nom</th>
              <th class="px-4 py-3">Sigle</th>
              <th class="px-4 py-3">Cr\xE9\xE9 par</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ministere of ministeres" class="border-t border-slate-200 hover:bg-slate-50">
              <td class="px-4 py-4 text-slate-700">{{ ministere.code }}</td>
              <td class="px-4 py-4 text-slate-700">{{ ministere.nom }}</td>
              <td class="px-4 py-4 text-slate-700">{{ ministere.sigle || '\u2014' }}</td>
              <td class="px-4 py-4 text-slate-700">{{ ministere.creePar || 'Anonyme' }}</td>
              <td class="px-4 py-4 space-x-2">
                <button
                  (click)="editMinistere(ministere.id)"
                  class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >Modifier</button>
                <button
                  (click)="deleteMinistere(ministere.id)"
                  class="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                >Supprimer</button>
              </td>
            </tr>
            <tr *ngIf="!loading && ministeres.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">Aucun minist\xE8re trouv\xE9.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="loading" class="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Chargement des minist\xE8res...
      </div>
    </div>
  </div>

</app-main-layout>
` }]
  }], () => [{ type: MinistereService }, { type: Router }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MinistereListComponent, { className: "MinistereListComponent", filePath: "src/app/modules/ministeres/pages/ministere-list/ministere-list.component.ts", lineNumber: 16 });
})();

// src/app/modules/ministeres/pages/ministere-form/ministere-form.component.ts
function MinistereFormComponent_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.error, " ");
  }
}
function MinistereFormComponent_p_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.getFieldError("code"));
  }
}
function MinistereFormComponent_p_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.getFieldError("nom"));
  }
}
function MinistereFormComponent_p_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.getFieldError("sigle"));
  }
}
function MinistereFormComponent_p_32_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.getFieldError("description"));
  }
}
function MinistereFormComponent_div_44_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 24);
    \u0275\u0275text(1, "Enregistrement en cours...");
    \u0275\u0275elementEnd();
  }
}
var MinistereFormComponent = class _MinistereFormComponent {
  fb;
  ministereService;
  router;
  route;
  form;
  loading = false;
  error = null;
  ministereId = null;
  creePar = null;
  menuItems = [
    { icon: "fas fa-th", label: "Tableau de bord", path: "/dashboard" },
    { icon: "fas fa-building", label: "Structures", path: "/ministeres" },
    { icon: "fas fa-columns", label: "Sections" },
    { icon: "fas fa-chart-line", label: "Processus" },
    { icon: "fas fa-exclamation-triangle", label: "Risques" },
    { icon: "fas fa-table", label: "Matrice" },
    { icon: "fas fa-chart-simple", label: "Indicateurs" },
    { icon: "fas fa-book", label: "Biblioth\xE8que" },
    { icon: "fas fa-users", label: "Utilisateurs" }
  ];
  constructor(fb, ministereService, router, route) {
    this.fb = fb;
    this.ministereService = ministereService;
    this.router = router;
    this.route = route;
    this.form = this.fb.group({
      code: ["", [Validators.required, Validators.maxLength(50)]],
      nom: ["", [Validators.required, Validators.maxLength(200)]],
      sigle: ["", [Validators.maxLength(20)]],
      description: ["", [Validators.maxLength(1e3)]]
    });
  }
  ngOnInit() {
    this.ministereId = this.route.snapshot.paramMap.get("id");
    if (this.ministereId) {
      this.loadMinistere(this.ministereId);
    }
  }
  loadMinistere(id) {
    this.loading = true;
    this.ministereService.getById(id).subscribe({
      next: (ministere) => {
        const _a = ministere, { creePar } = _a, formData = __objRest(_a, ["creePar"]);
        this.form.patchValue(formData);
        this.creePar = creePar ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || "Impossible de charger le minist\xE8re";
        this.loading = false;
      }
    });
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    const request = this.form.value;
    const action = this.ministereId ? this.ministereService.update(this.ministereId, request) : this.ministereService.create(request);
    action.subscribe({
      next: () => {
        this.loading = false;
        const message = this.ministereId ? "Minist\xE8re modifi\xE9 avec succ\xE8s" : "Minist\xE8re cr\xE9\xE9 avec succ\xE8s";
        Swal.fire({
          title: "Succ\xE8s",
          text: message,
          icon: "success",
          timer: 1800,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(["/ministeres"]);
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || "Impossible d\u2019enregistrer le minist\xE8re";
      }
    });
  }
  cancel() {
    this.router.navigate(["/ministeres"]);
  }
  getFieldError(fieldName) {
    const control = this.form.get(fieldName);
    if (control?.hasError("required")) {
      return "Ce champ est obligatoire";
    }
    if (control?.hasError("maxlength")) {
      const max = control.getError("maxlength").requiredLength;
      return `Maximum ${max} caract\xE8res`;
    }
    return "";
  }
  static \u0275fac = function MinistereFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MinistereFormComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(MinistereService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MinistereFormComponent, selectors: [["app-ministere-form"]], decls: 45, vars: 12, consts: [["activeMenu", "Structures", "searchPlaceholder", "Rechercher un minist\xE8re...", "organizationName", "Minist\xE8re de l'\xC9conomie et des Finances", "userInitials", "AD", 3, "menuItems"], [1, "p-6"], [1, "max-w-3xl", "mx-auto", "space-y-6"], [1, "flex", "flex-col", "gap-2"], [1, "text-sm", "text-gray-500"], [1, "text-2xl", "font-semibold", "text-slate-900"], [1, "text-sm", "text-slate-500"], ["class", "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700", 4, "ngIf"], [1, "space-y-5", "rounded-3xl", "bg-white", "p-6", "shadow-sm", 3, "ngSubmit", "formGroup"], [1, "grid", "gap-4", "md:grid-cols-2"], [1, "mb-2", "block", "text-sm", "font-semibold", "text-slate-700"], ["formControlName", "code", "type", "text", 1, "w-full", "rounded-xl", "border", "border-slate-200", "bg-slate-50", "px-4", "py-3", "text-sm"], ["class", "mt-1 text-xs text-red-600", 4, "ngIf"], ["formControlName", "nom", "type", "text", 1, "w-full", "rounded-xl", "border", "border-slate-200", "bg-slate-50", "px-4", "py-3", "text-sm"], ["formControlName", "sigle", "type", "text", 1, "w-full", "rounded-xl", "border", "border-slate-200", "bg-slate-50", "px-4", "py-3", "text-sm"], ["formControlName", "description", "rows", "4", 1, "w-full", "rounded-xl", "border", "border-slate-200", "bg-slate-50", "px-4", "py-3", "text-sm"], ["type", "text", "readonly", "", 1, "w-full", "rounded-xl", "border", "border-slate-200", "bg-slate-50", "px-4", "py-3", "text-sm", 3, "value"], [1, "mt-1", "text-xs", "text-slate-500"], [1, "flex", "flex-col", "gap-3", "md:flex-row", "md:items-center", "md:justify-end"], ["type", "button", 1, "rounded-xl", "border", "border-slate-200", "px-4", "py-3", "text-sm", "font-semibold", "text-slate-700", "hover:bg-slate-100", 3, "click"], ["type", "submit", 1, "rounded-xl", "bg-emerald-700", "px-5", "py-3", "text-sm", "font-semibold", "text-white", "transition", "hover:bg-emerald-600", "disabled:cursor-not-allowed", "disabled:opacity-60", 3, "disabled"], ["class", "rounded-3xl bg-white p-5 text-sm text-slate-500 shadow-sm", 4, "ngIf"], [1, "rounded-lg", "border", "border-red-200", "bg-red-50", "p-4", "text-sm", "text-red-700"], [1, "mt-1", "text-xs", "text-red-600"], [1, "rounded-3xl", "bg-white", "p-5", "text-sm", "text-slate-500", "shadow-sm"]], template: function MinistereFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "app-main-layout", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "p", 4);
      \u0275\u0275text(5, "Administration");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "h1", 5);
      \u0275\u0275text(7);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "p", 6);
      \u0275\u0275text(9, "Remplissez le formulaire pour enregistrer les informations du minist\xE8re.");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(10, MinistereFormComponent_div_10_Template, 2, 1, "div", 7);
      \u0275\u0275elementStart(11, "form", 8);
      \u0275\u0275listener("ngSubmit", function MinistereFormComponent_Template_form_ngSubmit_11_listener() {
        return ctx.submit();
      });
      \u0275\u0275elementStart(12, "div", 9)(13, "div")(14, "label", 10);
      \u0275\u0275text(15, "Code");
      \u0275\u0275elementEnd();
      \u0275\u0275element(16, "input", 11);
      \u0275\u0275template(17, MinistereFormComponent_p_17_Template, 2, 1, "p", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "div")(19, "label", 10);
      \u0275\u0275text(20, "Nom");
      \u0275\u0275elementEnd();
      \u0275\u0275element(21, "input", 13);
      \u0275\u0275template(22, MinistereFormComponent_p_22_Template, 2, 1, "p", 12);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(23, "div")(24, "label", 10);
      \u0275\u0275text(25, "Sigle");
      \u0275\u0275elementEnd();
      \u0275\u0275element(26, "input", 14);
      \u0275\u0275template(27, MinistereFormComponent_p_27_Template, 2, 1, "p", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "div")(29, "label", 10);
      \u0275\u0275text(30, "Description");
      \u0275\u0275elementEnd();
      \u0275\u0275element(31, "textarea", 15);
      \u0275\u0275template(32, MinistereFormComponent_p_32_Template, 2, 1, "p", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "div")(34, "label", 10);
      \u0275\u0275text(35, "Cr\xE9\xE9 par");
      \u0275\u0275elementEnd();
      \u0275\u0275element(36, "input", 16);
      \u0275\u0275elementStart(37, "p", 17);
      \u0275\u0275text(38, "Champ automatiquement rempli avec votre r\xF4le");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(39, "div", 18)(40, "button", 19);
      \u0275\u0275listener("click", function MinistereFormComponent_Template_button_click_40_listener() {
        return ctx.cancel();
      });
      \u0275\u0275text(41, " Annuler ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "button", 20);
      \u0275\u0275text(43);
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(44, MinistereFormComponent_div_44_Template, 2, 0, "div", 21);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      let tmp_4_0;
      let tmp_5_0;
      let tmp_6_0;
      let tmp_7_0;
      \u0275\u0275property("menuItems", ctx.menuItems);
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate1(" ", ctx.ministereId ? "Modifier un minist\xE8re" : "Cr\xE9er un minist\xE8re", " ");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", ctx.error);
      \u0275\u0275advance();
      \u0275\u0275property("formGroup", ctx.form);
      \u0275\u0275advance(6);
      \u0275\u0275property("ngIf", ((tmp_4_0 = ctx.form.get("code")) == null ? null : tmp_4_0.invalid) && ((tmp_4_0 = ctx.form.get("code")) == null ? null : tmp_4_0.touched));
      \u0275\u0275advance(5);
      \u0275\u0275property("ngIf", ((tmp_5_0 = ctx.form.get("nom")) == null ? null : tmp_5_0.invalid) && ((tmp_5_0 = ctx.form.get("nom")) == null ? null : tmp_5_0.touched));
      \u0275\u0275advance(5);
      \u0275\u0275property("ngIf", ((tmp_6_0 = ctx.form.get("sigle")) == null ? null : tmp_6_0.invalid) && ((tmp_6_0 = ctx.form.get("sigle")) == null ? null : tmp_6_0.touched));
      \u0275\u0275advance(5);
      \u0275\u0275property("ngIf", ((tmp_7_0 = ctx.form.get("description")) == null ? null : tmp_7_0.invalid) && ((tmp_7_0 = ctx.form.get("description")) == null ? null : tmp_7_0.touched));
      \u0275\u0275advance(4);
      \u0275\u0275property("value", ctx.creePar || "Votre r\xF4le sera automatiquement d\xE9fini");
      \u0275\u0275advance(6);
      \u0275\u0275property("disabled", ctx.loading);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.ministereId ? "Enregistrer" : "Cr\xE9er", " ");
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.loading);
    }
  }, dependencies: [CommonModule, NgIf, ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, RouterModule, MainLayoutComponent], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MinistereFormComponent, [{
    type: Component,
    args: [{ standalone: true, selector: "app-ministere-form", imports: [CommonModule, ReactiveFormsModule, RouterModule, MainLayoutComponent], template: `<app-main-layout
  [menuItems]="menuItems"
  activeMenu="Structures"
  searchPlaceholder="Rechercher un minist\xE8re..."
  organizationName="Minist\xE8re de l'\xC9conomie et des Finances"
  userInitials="AD">

  <div class="p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex flex-col gap-2">
        <p class="text-sm text-gray-500">Administration</p>
        <h1 class="text-2xl font-semibold text-slate-900">
          {{ ministereId ? 'Modifier un minist\xE8re' : 'Cr\xE9er un minist\xE8re' }}
        </h1>
        <p class="text-sm text-slate-500">Remplissez le formulaire pour enregistrer les informations du minist\xE8re.</p>
      </div>

      <div *ngIf="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">Code</label>
            <input formControlName="code" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/>
            <p *ngIf="form.get('code')?.invalid && form.get('code')?.touched" class="mt-1 text-xs text-red-600">{{ getFieldError('code') }}</p>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">Nom</label>
            <input formControlName="nom" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/>
            <p *ngIf="form.get('nom')?.invalid && form.get('nom')?.touched" class="mt-1 text-xs text-red-600">{{ getFieldError('nom') }}</p>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700">Sigle</label>
          <input formControlName="sigle" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/>
          <p *ngIf="form.get('sigle')?.invalid && form.get('sigle')?.touched" class="mt-1 text-xs text-red-600">{{ getFieldError('sigle') }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700">Description</label>
          <textarea formControlName="description" rows="4" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"></textarea>
          <p *ngIf="form.get('description')?.invalid && form.get('description')?.touched" class="mt-1 text-xs text-red-600">{{ getFieldError('description') }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700">Cr\xE9\xE9 par</label>
          <input [value]="creePar || 'Votre r\xF4le sera automatiquement d\xE9fini'" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" readonly/>
          <p class="mt-1 text-xs text-slate-500">Champ automatiquement rempli avec votre r\xF4le</p>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
          <button type="button" (click)="cancel()" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Annuler
          </button>
          <button type="submit" [disabled]="loading" class="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">
            {{ ministereId ? 'Enregistrer' : 'Cr\xE9er' }}
          </button>
        </div>
      </form>

      <div *ngIf="loading" class="rounded-3xl bg-white p-5 text-sm text-slate-500 shadow-sm">Enregistrement en cours...</div>
    </div>
  </div>

</app-main-layout>
` }]
  }], () => [{ type: FormBuilder }, { type: MinistereService }, { type: Router }, { type: ActivatedRoute }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MinistereFormComponent, { className: "MinistereFormComponent", filePath: "src/app/modules/ministeres/pages/ministere-form/ministere-form.component.ts", lineNumber: 17 });
})();

// src/app/modules/ministeres/ministeres-routing.module.ts
var routes = [
  { path: "", component: MinistereListComponent },
  { path: "nouveau", component: MinistereFormComponent },
  { path: ":id/edit", component: MinistereFormComponent }
];
var MinisteresRoutingModule = class _MinisteresRoutingModule {
  static \u0275fac = function MinisteresRoutingModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MinisteresRoutingModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _MinisteresRoutingModule });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [RouterModule.forChild(routes), RouterModule] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MinisteresRoutingModule, [{
    type: NgModule,
    args: [{
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
    }]
  }], null, null);
})();

// src/app/modules/ministeres/ministeres.module.ts
var MinisteresModule = class _MinisteresModule {
  static \u0275fac = function MinisteresModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MinisteresModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _MinisteresModule });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MinisteresRoutingModule,
    MinistereListComponent,
    MinistereFormComponent
  ] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MinisteresModule, [{
    type: NgModule,
    args: [{
      imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MinisteresRoutingModule,
        MinistereListComponent,
        MinistereFormComponent
      ]
    }]
  }], null, null);
})();
export {
  MinisteresModule
};
//# sourceMappingURL=chunk-ABWCSRMT.mjs.map
