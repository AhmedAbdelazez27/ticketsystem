import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { AlertType } from '../../shared/common_model';

@Component({
    templateUrl: './agent_setting.html'
})

export class Agent_SettingComponent {
    isLoading = false;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.initForm();
    }
    ngOnInit() {
        this.bindData();
    }

    //Add/Edit 
    AgentSettingForm: UntypedFormGroup;
    @ViewChild('f') form: NgForm;
    initForm() {
        this.AgentSettingForm = this.fb.group({
            AgentSettingID: [0],
            Is_Profile_Visible: [true],
            Is_CommonSetting_Visible: [true],
            Is_Help_Visible: [true],
            Is_Solution_Visible: [true],
            Is_ColumnChooser_Visible: [true],
            PageSize: [10],

            Is_Print: [true],
            Is_Export: [true],
            Is_Ticket_Search: [true],
            Is_Solution_Search: [true],
            Is_Column_Filter_Ticket: [true],
            Is_Column_Filter_Solution: [true],
            Is_Clone_Ticket: [true],
            Is_Clone_Solution: [true],
        });
    }
    async bindData() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<AgentSetting_Model>("Admin/Get_AgentSetting");
            if (res) {
                this.AgentSettingForm.patchValue(res);
            }
        } catch (e) { }
    }

    async SaveAgentSetting() {
        try {
            this.service.App.ShowLoader = true;
            let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/AgentSetting_Update", this.AgentSettingForm.getRawValue());
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

interface AgentSetting_Model {
    AgentSettingID: number;
    Is_Profile_Visible: boolean;
    Is_CommonSetting_Visible: boolean;
    Is_Help_Visible: boolean;
    Is_Solution_Visible: boolean;
    Is_ColumnChooser_Visible: boolean;
    PageSize: number;

    Is_Print: boolean;
    Is_Export: boolean;
    Is_Ticket_Search: boolean;
    Is_Solution_Search: boolean;
    Is_Column_Filter_Ticket: boolean;
    Is_Column_Filter_Solution: boolean;
    Is_Clone_Ticket: boolean;
    Is_Clone_Solution: boolean;
}