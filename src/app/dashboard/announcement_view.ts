import { Component, ViewChild } from '@angular/core';
import { SystemService } from '../shared/SystemService';
import { ModalDialog } from '../shared/modal.dialog';

@Component({
    selector: 'announcement-view',
    templateUrl: './announcement_view.html'
})

export class Announcement_ViewComponent {
    isLoading = false;
    @ViewChild("modalAnnounce") modalAnnounce: ModalDialog;
    public Announcement: any;

    constructor(public service: SystemService) {
    }
    ngOnInit() {
    }

    public open(item: any) {
        this.Announcement = item;
        this.modalAnnounce.open();
    }

}
