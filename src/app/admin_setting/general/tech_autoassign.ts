import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { AlertType, UserManagement_Model } from '../../shared/common_model';
import { User_Technician_ListComponent } from '../user/user_technician_list';


@Component({
    templateUrl: './tech_autoassign.html'
})

export class Tech_AutoassignComponent {
    isLoading = false; lstUsers = []; AgentList = [];
    @ViewChild(User_Technician_ListComponent) public UserSelect: User_Technician_ListComponent;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.initForm();
    }
    ngOnInit() {
        this.bindData();
    }

    //Add/Edit 
    TechAutoAssignForm: UntypedFormGroup;
    @ViewChild('f') form: NgForm;
    initForm() {
        this.TechAutoAssignForm = this.fb.group({
            TechAutoAssignID: [0],
            Is_Enable: [true],
            AutoAssign_Type: [""],
            Exclude_Users: [""]
        });
    }
    async bindData() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Tech_Autoassign_Model>("Admin/Get_TechAutoAssign");
            if (res) {
                this.TechAutoAssignForm.patchValue(res);
            }

            let data = await this.service.Data.ExecuteAPI_Post<Array<UserManagement_Model>>("Admin/Get_UserSelection_List", { Is_Agent: true });
            if (data) {
                this.AgentList = data.filter(d => d.Is_Agent);

                if (res && res.Exclude_Users) {
                    res.Exclude_Users.split(",").map(d => {
                        let user = this.AgentList.find(x => x.UserID == d);
                        if (user) { this.lstUsers.push(user); }
                    });
                }
            }

        } catch (e) { }
    }

    //Bind User & Technician Grid   
    OpenUserList() {
        this.UserSelect.open(true, this.AgentList, true);
    }
    UserSelectDone(item: any) {
        if (item && item.user) {
            let userList: Array<UserManagement_Model> = [];
            if (item.user.length > 0) { userList = item.user; } else { userList.push(item.user); }
            userList.map(d => {
                let user = this.lstUsers.find(x => x.UserID == d.UserID);
                if (!user) { this.lstUsers.push(d); }
            })
        }
    }
    Remove(item) {
        this.lstUsers = this.lstUsers.filter(x => x.UserID != item.UserID);
    }

    async Save() {
        try {
            this.service.App.ShowLoader = true;
            let obj = this.TechAutoAssignForm.getRawValue();
            obj.Exclude_Users = this.lstUsers.map(d => d.UserID).join();
            let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Update_TechAutoAssign", obj);
            if (res > 0) {
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgSettingSaved"));
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
            }
            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

}

interface Tech_Autoassign_Model {
    TechAutoAssignID: number;
    Is_Enable: boolean;
    AutoAssign_Type: string;
    Exclude_Users: string;
}