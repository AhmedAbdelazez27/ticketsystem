import { Component, OnInit } from '@angular/core';
import { SystemService } from '../shared/SystemService';
import { slideInOut } from '../shared/app.directive';


@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.html',
    animations: [slideInOut]
})
export class SidenavComponent implements OnInit {
    public pageData: any = {};
    constructor(public service: SystemService) { }
    ngOnInit() { }


}