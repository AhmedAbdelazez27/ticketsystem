import { Component} from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { SystemService } from './shared/SystemService'

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
})


export class AppComponent {
    public sessionInterval: number;
    public sessionExpirationSeconds: number = 60 * 60;//In Minuits        
    constructor(public router: Router, public service: SystemService) {
        this.service.Set_RTL();
        router.events.subscribe((event: RouterEvent) => {
            this.navigationInterceptor(event)
        });
    }

    ngOnInit() {
        if (this.service.Settings.Expiration_Time) { this.sessionExpirationSeconds = this.service.Settings.Expiration_Time * 60; }

        //Code for Ideal mode
        if (this.service.App.getCookie("Bearer")) {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    window.clearInterval(this.sessionInterval);
                }
                else {
                    this.setSession();
                    this.sessionInterval = window.setInterval(this.setSession.bind(this), 1000 * this.sessionExpirationSeconds);
                }
            });
            this.setSession();
            this.sessionInterval = window.setInterval(this.setSession.bind(this), 1000 * this.sessionExpirationSeconds);
        }
    }
    ngAfterViewInit() { }

    public setSession() {
        var cookie = this.service.App.getCookie("Bearer")
        if (cookie) {
            let date = new Date();
            date.setSeconds(date.getSeconds() + this.sessionExpirationSeconds + 10);
            this.service.App.setCookie("Bearer", cookie, date);
        }
        else {
            this.service.logOut();
        }
    }

    navigationInterceptor(event: RouterEvent): void {
        if (event instanceof NavigationStart) {
            //this.service.App.AppLoader = true;
        }
        if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            this.service.App.AppLoader = false;
        }
    }
}