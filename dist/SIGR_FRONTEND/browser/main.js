import {
  AuthService,
  Component,
  HTTP_INTERCEPTORS,
  Injectable,
  Router,
  RouterOutlet,
  __spreadValues,
  bootstrapApplication,
  catchError,
  provideBrowserGlobalErrorListeners,
  provideClientHydration,
  provideHttpClient,
  provideRouter,
  setClassMetadata,
  signal,
  throwError,
  withEventReplay,
  withFetch,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵinject
} from "./chunk-PYVSYTHE.js";

// src/app/app.routes.ts
var routes = [
  __spreadValues({
    path: "auth",
    loadChildren: () => import("./chunk-MSDF3RLY.js").then((m) => m.AuthModule)
  }, false ? { \u0275entryName: "src/app/modules/auth/auth.module.ts" } : {}),
  __spreadValues({
    path: "dashboard",
    loadComponent: () => import("./chunk-T5HCIWB4.js").then((c) => c.DashboardComponent)
  }, false ? { \u0275entryName: "src/app/modules/dashboard/dashboard.component.ts" } : {}),
  __spreadValues({
    path: "ministeres",
    loadChildren: () => import("./chunk-HHQ4PZSX.js").then((m) => m.MinisteresModule)
  }, false ? { \u0275entryName: "src/app/modules/ministeres/ministeres.module.ts" } : {}),
  {
    path: "ministere",
    redirectTo: "/ministeres",
    pathMatch: "full"
  },
  {
    path: "minist\xE8re",
    redirectTo: "/ministeres",
    pathMatch: "full"
  },
  { path: "", redirectTo: "/auth/login", pathMatch: "full" },
  { path: "**", redirectTo: "/auth/login" }
];

// src/app/core/interceptors/auth.interceptor.ts
var AuthInterceptor = class _AuthInterceptor {
  authService;
  constructor(authService) {
    this.authService = authService;
  }
  intercept(request, next) {
    if (!request.url.includes("/auth/login")) {
      const token = this.authService.getToken();
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }
    return next.handle(request);
  }
  static \u0275fac = function AuthInterceptor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthInterceptor)(\u0275\u0275inject(AuthService));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthInterceptor, factory: _AuthInterceptor.\u0275fac });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthInterceptor, [{
    type: Injectable
  }], () => [{ type: AuthService }], null);
})();

// src/app/core/interceptors/error.interceptor.ts
var ErrorInterceptor = class _ErrorInterceptor {
  authService;
  router;
  constructor(authService, router) {
    this.authService = authService;
    this.router = router;
  }
  intercept(request, next) {
    return next.handle(request).pipe(catchError((error) => {
      if (error.status === 401) {
        this.authService.logout();
        this.router.navigate(["/auth/login"]);
      }
      return throwError(() => error);
    }));
  }
  static \u0275fac = function ErrorInterceptor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ErrorInterceptor)(\u0275\u0275inject(AuthService), \u0275\u0275inject(Router));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ErrorInterceptor, factory: _ErrorInterceptor.\u0275fac });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ErrorInterceptor, [{
    type: Injectable
  }], () => [{ type: AuthService }, { type: Router }], null);
})();

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
};

// src/app/app.ts
var App = class _App {
  title = signal("SIGR_FRONTEND", ...ngDevMode ? [{ debugName: "title" }] : (
    /* istanbul ignore next */
    []
  ));
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], decls: 1, vars: 0, template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet");
    }
  }, dependencies: [RouterOutlet], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(App, [{
    type: Component,
    args: [{ selector: "app-root", standalone: true, imports: [RouterOutlet], template: "<router-outlet></router-outlet>\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 11 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
