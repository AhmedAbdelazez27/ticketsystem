import { Component } from '@angular/core';
import { SystemService } from '../shared/SystemService';
@Component({
    templateUrl: './admin_dashboard.html'
})

export class Admin_DashboardComponent {
    isLoading = false;
    constructor(public service: SystemService) {

    }

    ngOnInit() {
    }
}