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
} from "./chunk-TSQ4URFU.js";
import {
  AuthService,
  ChangeDetectorRef,
  CommonModule,
  Component,
  NgIf,
  NgModule,
  Router,
  RouterModule,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate1
} from "./chunk-X4W6N5WF.js";

// src/app/modules/auth/pages/login/login.component.ts
function LoginComponent_p_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 35);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.getErrorMessage("matricule"), " ");
  }
}
function LoginComponent_p_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 35);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.getErrorMessage("password"), " ");
  }
}
function LoginComponent_div_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.error, " ");
  }
}
function LoginComponent_span_37_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 38);
    \u0275\u0275element(2, "circle", 39)(3, "path", 40);
    \u0275\u0275elementEnd();
    \u0275\u0275text(4, " Connexion en cours... ");
    \u0275\u0275elementEnd();
  }
}
function LoginComponent_span_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Se connecter");
    \u0275\u0275elementEnd();
  }
}
var LoginComponent = class _LoginComponent {
  fb;
  authService;
  router;
  cdr;
  loginForm;
  loading = false;
  error = null;
  constructor(fb, authService, router, cdr) {
    this.fb = fb;
    this.authService = authService;
    this.router = router;
    this.cdr = cdr;
    this.loginForm = this.fb.group({
      matricule: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      this.cdr.markForCheck();
      const request = this.loginForm.value;
      this.authService.login(request).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          this.loading = false;
          console.error("Erreur de login:", error);
          if (error.message) {
            this.error = error.message;
          } else if (error.error && typeof error.error === "string") {
            this.error = error.error;
          } else if (error.error && error.error.message) {
            this.error = error.error.message;
          } else {
            this.error = "Une erreur inconnue est survenue";
          }
          console.log("Message d'erreur affich\xE9:", this.error);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }
  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
  getErrorMessage(fieldName) {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError("required")) {
      return `${fieldName === "matricule" ? "Le matricule" : "Le mot de passe"} est obligatoire`;
    }
    return "";
  }
  static \u0275fac = function LoginComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LoginComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ChangeDetectorRef));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LoginComponent, selectors: [["app-login"]], decls: 46, vars: 15, consts: [[1, "min-h-screen", "w-full", "flex", "flex-col", "md:flex-row"], [1, "relative", "md:w-1/2", "min-h-[20vh]", "md:min-h-screen", "flex", "flex-col", "items-center", "justify-center", "overflow-hidden", 2, "background-image", "url('/assets/images/statut.jpg')", "background-size", "cover", "background-position", "center"], [1, "absolute", "inset-0", "bg-black/20"], [1, "absolute", "bottom-0", "left-0", "right-0", "h-16", 2, "background", "linear-gradient(to top, rgba(0,0,0,0.3), transparent)"], [1, "relative", "z-10", "flex", "flex-col", "items-center", "justify-center", "text-center", "px-4"], [1, "text-white/80", "text-[8px]", "md:text-[10px]", "tracking-[2px]", "uppercase", "font-semibold"], [1, "relative", "md:w-1/2", "flex", "flex-col", "justify-center", "py-6", "md:py-8", "bg-white", "min-h-[80vh]", "md:min-h-screen"], [1, "px-4", "md:px-8", "lg:px-12"], [1, "flex", "flex-col", "items-center", "gap-2", "mb-4"], ["src", "/assets/images/mef.png", "alt", "Logo du Minist\xE8re de l'\xC9conomie et des Finances", 1, "w-40", "h-40", "md:w-52", "md:h-52", "lg:w-60", "lg:h-60", "object-contain"], [1, "text-center"], [1, "text-3xl", "md:text-4xl", "font-semibold", 2, "font-family", "'Georgia', serif", "color", "#003d20"], [1, "text-[10px]", "md:text-xs", "text-gray-500", "tracking-wide"], [1, "max-w-sm", "mx-auto", "w-full"], [1, "space-y-3", 3, "ngSubmit", "formGroup"], ["for", "matricule", 1, "block", "text-xs", "font-semibold", "mb-1", "tracking-wide", 2, "color", "#003d20"], ["type", "text", "id", "matricule", "formControlName", "matricule", "placeholder", "Entrez votre matricule", 1, "w-full", "px-3.5", "py-2", "text-sm", "rounded-lg", "border", "border-gray-300", "bg-white", "focus:outline-none", "focus:border-green-600", "focus:ring-2", "focus:ring-green-100", "transition-colors", "placeholder-gray-400"], ["class", "text-red-500 text-xs mt-1", 4, "ngIf"], ["for", "password", 1, "block", "text-xs", "font-semibold", "mb-1", "tracking-wide", 2, "color", "#003d20"], ["type", "password", "id", "password", "formControlName", "password", "placeholder", "Entrez votre mot de passe", 1, "w-full", "px-3.5", "py-2", "text-sm", "rounded-lg", "border", "border-gray-300", "bg-white", "focus:outline-none", "focus:border-green-600", "focus:ring-2", "focus:ring-green-100", "transition-colors", "placeholder-gray-400"], [1, "flex", "justify-between", "items-center", "text-xs"], [1, "flex", "items-center", "gap-1.5", "cursor-pointer"], ["type", "checkbox", 1, "rounded", "border-gray-300", "text-green-600", "focus:ring-green-500"], [1, "text-gray-600"], ["href", "#", 1, "text-green-700", "hover:text-green-800", "hover:underline"], ["class", "bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm", 4, "ngIf"], ["type", "submit", 1, "w-full", "py-2", "rounded-lg", "text-white", "text-sm", "font-semibold", "tracking-wide", "transition-all", "duration-200", "hover:opacity-90", "active:scale-[0.99]", "disabled:opacity-50", "disabled:cursor-not-allowed", 2, "background-color", "#008751", 3, "disabled"], ["class", "flex items-center justify-center gap-2", 4, "ngIf"], [4, "ngIf"], [1, "mt-auto", "px-4", "md:px-8", "lg:px-12", "pt-4"], [1, "flex", "h-0.5", "rounded-full", "overflow-hidden", "mb-2"], [1, "flex-1", 2, "background-color", "#008751"], [1, "flex-1", 2, "background-color", "#fcd116"], [1, "flex-1", 2, "background-color", "#e8112d"], [1, "text-center", "text-gray-400", "text-[8px]", "md:text-[10px]", 2, "letter-spacing", "0.5px"], [1, "text-red-500", "text-xs", "mt-1"], [1, "bg-red-50", "border", "border-red-200", "text-red-600", "px-3", "py-2", "rounded-lg", "text-sm"], [1, "flex", "items-center", "justify-center", "gap-2"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "h-4", "w-4", "text-white"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", 1, "opacity-75"]], template: function LoginComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275element(2, "div", 2)(3, "div", 3);
      \u0275\u0275elementStart(4, "div", 4)(5, "p", 5);
      \u0275\u0275text(6, "R\xC9PUBLIQUE DU B\xC9NIN");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(7, "div", 6)(8, "div", 7)(9, "div", 8);
      \u0275\u0275element(10, "img", 9);
      \u0275\u0275elementStart(11, "div", 10)(12, "h1", 11);
      \u0275\u0275text(13, "SIGR");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "p", 12);
      \u0275\u0275text(15, "Syst\xE8me d'Information de Gestion des Risques");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "div", 13)(17, "form", 14);
      \u0275\u0275listener("ngSubmit", function LoginComponent_Template_form_ngSubmit_17_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(18, "div")(19, "label", 15);
      \u0275\u0275text(20, " Matricule ");
      \u0275\u0275elementEnd();
      \u0275\u0275element(21, "input", 16);
      \u0275\u0275template(22, LoginComponent_p_22_Template, 2, 1, "p", 17);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "div")(24, "label", 18);
      \u0275\u0275text(25, " Mot de passe ");
      \u0275\u0275elementEnd();
      \u0275\u0275element(26, "input", 19);
      \u0275\u0275template(27, LoginComponent_p_27_Template, 2, 1, "p", 17);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "div", 20)(29, "label", 21);
      \u0275\u0275element(30, "input", 22);
      \u0275\u0275elementStart(31, "span", 23);
      \u0275\u0275text(32, "Se souvenir de moi");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "a", 24);
      \u0275\u0275text(34, "Mot de passe oubli\xE9 ?");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(35, LoginComponent_div_35_Template, 2, 1, "div", 25);
      \u0275\u0275elementStart(36, "button", 26);
      \u0275\u0275template(37, LoginComponent_span_37_Template, 5, 0, "span", 27)(38, LoginComponent_span_38_Template, 2, 0, "span", 28);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(39, "div", 29)(40, "div", 30);
      \u0275\u0275element(41, "div", 31)(42, "div", 32)(43, "div", 33);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "p", 34);
      \u0275\u0275text(45, " \xA9 R\xE9publique du B\xE9nin \xB7 Minist\xE8re des Finances ");
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      let tmp_1_0;
      let tmp_2_0;
      let tmp_3_0;
      let tmp_4_0;
      let tmp_5_0;
      let tmp_6_0;
      \u0275\u0275advance(17);
      \u0275\u0275property("formGroup", ctx.loginForm);
      \u0275\u0275advance(4);
      \u0275\u0275classProp("border-red-400", ((tmp_1_0 = ctx.loginForm.get("matricule")) == null ? null : tmp_1_0.invalid) && ((tmp_1_0 = ctx.loginForm.get("matricule")) == null ? null : tmp_1_0.touched))("bg-red-50", ((tmp_2_0 = ctx.loginForm.get("matricule")) == null ? null : tmp_2_0.invalid) && ((tmp_2_0 = ctx.loginForm.get("matricule")) == null ? null : tmp_2_0.touched));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ((tmp_3_0 = ctx.loginForm.get("matricule")) == null ? null : tmp_3_0.invalid) && ((tmp_3_0 = ctx.loginForm.get("matricule")) == null ? null : tmp_3_0.touched));
      \u0275\u0275advance(4);
      \u0275\u0275classProp("border-red-400", ((tmp_4_0 = ctx.loginForm.get("password")) == null ? null : tmp_4_0.invalid) && ((tmp_4_0 = ctx.loginForm.get("password")) == null ? null : tmp_4_0.touched))("bg-red-50", ((tmp_5_0 = ctx.loginForm.get("password")) == null ? null : tmp_5_0.invalid) && ((tmp_5_0 = ctx.loginForm.get("password")) == null ? null : tmp_5_0.touched));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ((tmp_6_0 = ctx.loginForm.get("password")) == null ? null : tmp_6_0.invalid) && ((tmp_6_0 = ctx.loginForm.get("password")) == null ? null : tmp_6_0.touched));
      \u0275\u0275advance(8);
      \u0275\u0275property("ngIf", ctx.error);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", ctx.loading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.loading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.loading);
    }
  }, dependencies: [CommonModule, NgIf, ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LoginComponent, [{
    type: Component,
    args: [{ standalone: true, selector: "app-login", imports: [CommonModule, ReactiveFormsModule], template: `<div class="min-h-screen w-full flex flex-col md:flex-row">
  
  <!-- Panneau gauche : image de fond (50% de largeur) -->
  <div class="relative md:w-1/2 min-h-[20vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden"
       style="background-image: url('/assets/images/statut.jpg'); background-size: cover; background-position: center;">
    
    <!-- Overlay l\xE9ger pour am\xE9liorer la lisibilit\xE9 du texte sans trop assombrir -->
    <div class="absolute inset-0 bg-black/20"></div>

    <!-- D\xE9grad\xE9 bas l\xE9ger -->
    <div class="absolute bottom-0 left-0 right-0 h-16"
         style="background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);">
    </div>

    <!-- Texte au centre - minimal -->
    <div class="relative z-10 flex flex-col items-center justify-center text-center px-4">
      <p class="text-white/80 text-[8px] md:text-[10px] tracking-[2px] uppercase font-semibold">R\xC9PUBLIQUE DU B\xC9NIN</p>
    </div>
  </div>

  <!-- Panneau droit : formulaire (50% de largeur) -->
  <div class="relative md:w-1/2 flex flex-col justify-center py-6 md:py-8 bg-white min-h-[80vh] md:min-h-screen">
    
    <!-- Contenu principal centr\xE9 verticalement -->
    <div class="px-4 md:px-8 lg:px-12">
      <!-- Logo + titre -->
      <div class="flex flex-col items-center gap-2 mb-4">
        <!-- Logo tr\xE8s grand -->
        <img src="/assets/images/mef.png" 
             alt="Logo du Minist\xE8re de l'\xC9conomie et des Finances" 
             class="w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 object-contain">
        
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-semibold" style="font-family: 'Georgia', serif; color: #003d20;">SIGR</h1>
          <p class="text-[10px] md:text-xs text-gray-500 tracking-wide">Syst\xE8me d'Information de Gestion des Risques</p>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="max-w-sm mx-auto w-full">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-3">

          <!-- Matricule -->
          <div>
            <label for="matricule"
                   class="block text-xs font-semibold mb-1 tracking-wide"
                   style="color: #003d20;">
              Matricule
            </label>
            <input
              type="text"
              id="matricule"
              formControlName="matricule"
              placeholder="Entrez votre matricule"
              class="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white
                     focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100
                     transition-colors placeholder-gray-400"
              [class.border-red-400]="loginForm.get('matricule')?.invalid && loginForm.get('matricule')?.touched"
              [class.bg-red-50]="loginForm.get('matricule')?.invalid && loginForm.get('matricule')?.touched"
            >
            <p class="text-red-500 text-xs mt-1"
               *ngIf="loginForm.get('matricule')?.invalid && loginForm.get('matricule')?.touched">
              {{ getErrorMessage('matricule') }}
            </p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password"
                   class="block text-xs font-semibold mb-1 tracking-wide"
                   style="color: #003d20;">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Entrez votre mot de passe"
              class="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white
                     focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100
                     transition-colors placeholder-gray-400"
              [class.border-red-400]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              [class.bg-red-50]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
            <p class="text-red-500 text-xs mt-1"
               *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              {{ getErrorMessage('password') }}
            </p>
          </div>

          <!-- Liens suppl\xE9mentaires -->
          <div class="flex justify-between items-center text-xs">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
              <span class="text-gray-600">Se souvenir de moi</span>
            </label>
            <a href="#" class="text-green-700 hover:text-green-800 hover:underline">Mot de passe oubli\xE9 ?</a>
          </div>

          <!-- Erreur g\xE9n\xE9rale -->
          <div class="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm"
               *ngIf="error">
            {{ error }}
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            class="w-full py-2 rounded-lg text-white text-sm font-semibold tracking-wide
                   transition-all duration-200 hover:opacity-90 active:scale-[0.99]
                   disabled:opacity-50 disabled:cursor-not-allowed"
            style="background-color: #008751;"
            [disabled]="loading"
          >
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                   fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Connexion en cours...
            </span>
            <span *ngIf="!loading">Se connecter</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Bande drapeau -->
    <div class="mt-auto px-4 md:px-8 lg:px-12 pt-4">
      <div class="flex h-0.5 rounded-full overflow-hidden mb-2">
        <div class="flex-1" style="background-color: #008751;"></div>
        <div class="flex-1" style="background-color: #fcd116;"></div>
        <div class="flex-1" style="background-color: #e8112d;"></div>
      </div>
      <p class="text-center text-gray-400 text-[8px] md:text-[10px]" style="letter-spacing: 0.5px;">
        \xA9 R\xE9publique du B\xE9nin \xB7 Minist\xE8re des Finances
      </p>
    </div>
  </div>
</div>` }]
  }], () => [{ type: FormBuilder }, { type: AuthService }, { type: Router }, { type: ChangeDetectorRef }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LoginComponent, { className: "LoginComponent", filePath: "src/app/modules/auth/pages/login/login.component.ts", lineNumber: 14 });
})();

// src/app/modules/auth/auth-routing.module.ts
var routes = [
  { path: "login", component: LoginComponent }
];
var AuthRoutingModule = class _AuthRoutingModule {
  static \u0275fac = function AuthRoutingModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthRoutingModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AuthRoutingModule });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [RouterModule.forChild(routes), RouterModule] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthRoutingModule, [{
    type: NgModule,
    args: [{
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
    }]
  }], null, null);
})();

// src/app/modules/auth/auth.module.ts
var AuthModule = class _AuthModule {
  static \u0275fac = function AuthModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AuthModule });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
    RouterModule,
    AuthRoutingModule,
    LoginComponent
  ] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthModule, [{
    type: NgModule,
    args: [{
      imports: [
        RouterModule,
        AuthRoutingModule,
        LoginComponent
      ]
    }]
  }], null, null);
})();
export {
  AuthModule
};
//# sourceMappingURL=chunk-TTGRVMLR.js.map
