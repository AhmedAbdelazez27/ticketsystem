import { Injectable, Inject, ChangeDetectorRef } from '@angular/core';
import { TRANSLATIONS } from './translations'; // import our opaque token

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class TranslateService {
    public _currentLang: string = 'EN';
    public _test: any = {};
    public defered = new Deferred<boolean>();
    public changeDetector: ChangeDetectorRef;
    public get currentLang() {
        return this._currentLang;
    }

    // inject our translations
    constructor(@Inject(TRANSLATIONS) public _translations: Promise<any>, public http: HttpClient) {
        _translations.then((d) => {
            this._test = d;
            this.defered.resolve(true);
        });
    }

    public init(): Promise<any> {
        return this.defered.promise;
    }

    public use(lang: string) {
        this._currentLang = lang; //set current language
    }
    public set_data(res) {
        this._test = res;
    }

    public translate(key: string): string {
        let translation = key;
        if (this._test[key]) {
            return this._test[key];
        }
        return translation;
    }

    public instant(key: string) {
        return this.translate(key);
    }

}

export class Deferred<T> {
    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}