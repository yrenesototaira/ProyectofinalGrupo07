
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// Fix: Import locale providers and register Spanish locale data.
import { provideZonelessChangeDetection, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AppComponent } from './src/app.component';
import { APP_ROUTES } from './src/app.routes';

// Fix: Register Spanish locale to format dates and currencies correctly.
registerLocaleData(localeEs, 'es');

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withHashLocation()),
    provideHttpClient(),
    // Fix: Provide LOCALE_ID and DEFAULT_CURRENCY_CODE for Spanish language and Peruvian currency.
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN' },
  ],
}).catch((err) => console.error(err));