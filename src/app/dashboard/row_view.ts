import { Component, ViewChild } from '@angular/core';
import { SystemService } from '../shared/SystemService';
import { ModalDialog } from '../shared/modal.dialog';
import { User_Technician_ListComponent } from '../admin_setting/user/user_technician_list';
import { Description_Model } from '../shared/common_model';

@Component({
    selector: 'row-view',
    templateUrl: './row_view.html'
})

export class Row_ViewComponent {
    isLoading = false; AttachmentList: Array<any> = [];
    @ViewChild("modalRow") modalRow: ModalDialog;
    model: any; HeaderText: string = "";
    ModuleType: string; //ticket|solution|problem|change
    @ViewChild(User_Technician_ListComponent) public UserSelect: User_Technician_ListComponent;

    constructor(public service: SystemService) {
        this.service.GoTo_ScrollTop(window);
    }
    ngOnInit() {
    }

    async open(item: any, module: string) {
        this.ModuleType = module;
        this.model = item;
        let ID;
        if (this.ModuleType == "ticket") {
            ID = item.DisplayTicketID;
            this.HeaderText = "lblViewTicket";
            this.AttachmentList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Ticket/Get_TicketAttachment_ByID", { TicketID: this.model.TicketID });
        }
        else if (this.ModuleType == "solution") {
            ID = item.DisplaySolutionID;
            this.HeaderText = "lblViewSolution";
            this.AttachmentList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Solution/Get_SolutionAttachment_ByID", { SolutionID: this.model.SolutionID });
        }

        let res = await this.service.Data.ExecuteAPI_Post<Description_Model>("Dashboard/Get_DescriptionByID", { ModuleType: module, ID: ID });
        this.model.Description = res.Description;
        this.model.SolutionDescription = res.SolutionDescription;
        this.modalRow.open();
    }
    extractData(res: Response) {
        return res.text() ? res.json() : "";
    }

    ViewUser(UserID) {
        this.UserSelect.ViewRow(null, UserID);
    }
    UserSelectDone(item: any) { }
}
