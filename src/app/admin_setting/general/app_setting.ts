import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { KeyValueString, AlertType } from '../../shared/common_model';

@Component({
    templateUrl: './app_setting.html'
})

export class App_SettingComponent {
    isLoading = false;
    public LanguageList: Array<KeyValueString> = [];
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.service.Get_Languages().then((res) => { this.LanguageList = res; });
        this.initForm();
    }
    ngOnInit() {
        this.bindData();
    }

    //Add/Edit 
    ApplicationSettingForm: UntypedFormGroup;
    @ViewChild('f') form: NgForm;
    initForm() {
        this.ApplicationSettingForm = this.fb.group({
            ApplicationSettingID: [0],
            Is_EasyAddOn_Visible: [false],
            DefaultLanguage: [""],
            DefaultPassword: [""],
            Is_Chat_Visible: [false],
            Is_LockUser: [false],
            Is_Admin_Search: [false],
            Is_Pickup: [false],
            Is_AssignTo_Dropdown: [false],
            Is_Close_Ticket: [false],
            Is_Ticket_StartPage: [false],
            Is_EditRow_On_DoubleClick: [true]
        });
    }
    async bindData() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<ApplicationSetting_Model>("Admin/Get_ApplicationSetting");
            if (res) {
                this.ApplicationSettingForm.patchValue(res);
            }
        } catch (e) { }
    }

    async SaveApplicationSetting() {
        try {
            this.service.App.ShowLoader = true;
            let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/ApplicationSetting_Update", this.ApplicationSettingForm.getRawValue());
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

interface ApplicationSetting_Model {
    ApplicationSettingID: number;
    Is_EasyAddOn_Visible: boolean;
    DefaultLanguage: string;
    DefaultPassword: string;
    Is_Chat_Visible: boolean;
    Is_LockUser: boolean;
    CompanyTitle: string;
    CompanyLogo: string;
    Is_Admin_Search: boolean;

    Is_Pickup: boolean;
    Is_AssignTo_Dropdown: boolean;
    Is_Close_Ticket: boolean;
    Is_Ticket_StartPage: boolean;
    Is_EditRow_On_DoubleClick: boolean;
}