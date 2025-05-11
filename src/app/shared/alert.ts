import { Component, OnInit, Input } from '@angular/core';

import { Alert, AlertType } from './common_model';
import { SystemService } from './SystemService';

@Component({
    selector: 'alert',
    template: `<ng-container *ngFor="let alert of alerts">
                <div *ngIf="alert.message" class="notification alert-dismissible animated" [class.bounceInRight]="!visibleOut" [class.bounceOutRight]="visibleOut" 
                      [ngClass]="alert.cssClass" (click)="removeAlert(alert)">
                    <i *ngIf="alert.type == 0" class="fa fa-check-circle icon"></i>
                    <i *ngIf="alert.type == 1" class="fa fa-times-circle icon"></i>
                    <i *ngIf="alert.type == 2" class="fa fa-info-circle icon"></i>
                    <i *ngIf="alert.type == 3" class="fa fa-exclamation-circle icon"></i>
                    <div class="">
                        {{alert.message}}
                    </div>
                    <a class="close" data-dismiss="alert">×</a>
                </div>
               </ng-container>
              `
})

export class AlertComponent {
    @Input() id: string; visibleOut: boolean = false;
    alerts: Alert[] = []; msgClass: string = "";
    constructor(public service: SystemService) { }
    timeout: any;

    ngOnInit() {
        this.service.getAlert(this.id).subscribe((alert: Alert) => {
            window.clearTimeout(this.timeout);
            if (!alert.message) {
                // clear alerts when an empty alert is received
                this.alerts = [];
                return;
            }
            // add alert to array            
            this.alerts = [];//for only display one message
            this.visibleOut = false;
            this.alerts.push(alert);
            this.timeout = window.setTimeout(() => { this.removeAlert(alert); }, 5000);
        });
    }

    removeAlert(alert: Alert) {
        this.visibleOut = true;
        setTimeout(() => {
            this.alerts = this.alerts.filter(x => x !== alert);
        }, 250);
    }
}