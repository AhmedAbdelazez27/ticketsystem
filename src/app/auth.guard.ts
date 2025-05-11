import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SystemService } from './shared/SystemService';

@Injectable()
export class AuthGuard  {
    public defered = new Deferred<boolean>();
    public lastURL: string;
    constructor(public router: Router, public service: SystemService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        this.defered = new Deferred<boolean>();
        this.lastURL = state.url;
        this.service.HasAccountData.then(() => {
            window.setTimeout(() => {
                if (this.service.App.getCookie("Bearer") && this.service.Account.UserID > 0) {                   
                    if (route.data.pageProp) {                        
                        if (this.service.Account[route.data.pageProp] || route.data.type) {
                            this.defered.resolve(true);
                        } else {
                            this.defered.resolve(false);
                        }
                    } else {
                        this.defered.resolve(true);
                    }
                }
                else {
                    this.defered.resolve(false);
                    this.service.redirectToLogin(this.lastURL);
                }
            }, 10);
        }, () => {
            this.defered.resolve(false);
            this.service.redirectToLogin(this.lastURL);
        });
        return this.defered.promise;
    }
}

class Deferred<T> {

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