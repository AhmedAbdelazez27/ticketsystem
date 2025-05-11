import { ChangeDetectorRef, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// translation token
export const TRANSLATIONS = new InjectionToken('translations');

export function createTranslateLoader(http: HttpClient) {
    let lang = localStorage.getItem('lang');
    return http.get(environment.Base_API_URL + "/api/Home/Get_Translate", { params: { lang: lang ? lang : 'EN' } }).toPromise();
}

// providers
export const TRANSLATION_PROVIDERS = [
    { provide: TRANSLATIONS, useFactory: (createTranslateLoader), deps: [HttpClient] },
];