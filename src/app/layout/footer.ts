import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SystemService } from '../shared/SystemService';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.html'
})
export class FooterComponent {
    userID: number = 0;
    constructor(public router: Router, public route: ActivatedRoute, public service: SystemService) {
    }
    ngOnInit() {
        this.service.HasAccountData.then((data) => {
            this.userID = this.service.Account.UserID;
        }, () => { });
    }

    Go_To_Portal() {
        if (this.service.Account.Is_Show_ClientPortal_Link) {
            this.service.Account.Is_Agent = false;
            this.service.Account.Is_Show_ClientPortal_Link = false;
            this.router.navigate(["/requester"]);
            this.service.App.RefreshData.emit();
        }
        else {
            this.service.Account.Is_Agent = true;
            this.service.Account.Is_Show_ClientPortal_Link = true;
            this.router.navigate(["/"]);
            this.service.App.RefreshData.emit();
        }
    }

}