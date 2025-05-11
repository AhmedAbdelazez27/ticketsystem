import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { GridFilter } from '../../shared/common_model';
import { ModalDialog } from '../../shared/modal.dialog';
import { AlertType } from '../../shared/common_model';


@Component({
    templateUrl: './roles.html'
})

export class RolesComponent {
    isLoading = false; allItems: Array<Roles_Model> = []; txtSearch = "";
    totalitems: number; gridFilter: Array<GridFilter> = [];
    Is_Edit_Form: boolean = false;
    @ViewChild("modalAdd") modalAdd: ModalDialog;
    Default_Role_PermissionList: Array<RolePermission_Model> = []; Role_PermissionList: Array<RolePermission_Model> = [];
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblRoleName", ColumnName: "Name", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblDescription", ColumnName: "Description", Condition: "no", Type: "string", Value: "", Is_Visible: true, Width: 35 });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsAgent", ColumnName: "Is_Agent", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsClient", ColumnName: "Is_Client", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsActive", ColumnName: "Is_Active", Condition: "no", Type: "bool", Value: "", Is_Visible: true });

        this.initForm();
    }
    ngOnInit() {
        this.bindData();
    }
    async bindData(isRefresh = false) {
        try {
            this.isLoading = true;
            let res = await this.service.Data.ExecuteAPI_Post<Array<Roles_Model>>("Admin/Get_Roles_List");
            if (res) {
                this.allItems = res;
                this.totalitems = res.length;

                if (isRefresh) { this.service.App.refreshGrid.emit(); }
            }
            this.isLoading = false;
        } catch (e) {
            this.isLoading = false;
        }
    }
    pageChanged(obj: any) { }

    //Add/Edit 
    RolesForm: UntypedFormGroup; isEdit = false;
    @ViewChild('f') form: NgForm;
    initForm() {
        this.RolesForm = this.fb.group({
            RoleID: [0],
            Name: ["", Validators.required],
            Description: [""],
            Is_Agent: [false],
            Is_Client: [false],
            Is_Active: [true]
        });
    }
    async AddRow() {
        this.isEdit = false;
        this.clearForm();
        if (this.Default_Role_PermissionList.length > 0) {
            this.Role_PermissionList = this.Default_Role_PermissionList;
        } else {
            let res = await this.service.Data.ExecuteAPI_Post<Main_Roles_Model>("Admin/Get_Roles_ByID", { RoleID: 0 });
            if (res) {
                this.Default_Role_PermissionList = this.Role_PermissionList = res.RolePermission_Model;
            }
        }
        this.Is_Edit_Form = true;
    }
    EditRow() {
        this.isEdit = true;
        let selectedRow = this.allItems.filter((x) => x.selectedRow);
        if (selectedRow.length == 0) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
        }
        else if (selectedRow.length > 1) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
        }
        else {
            let ID = selectedRow[0]["RoleID"];
            this.EditRoles(ID);
        }
    }
    EditRowDBClick(RowItem: any) {
        this.isEdit = true;
        if (!RowItem.isTrusted && RowItem) {
            this.EditRoles(RowItem.RoleID);
        }
    }
    async EditRoles(RoleID) {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Main_Roles_Model>("Admin/Get_Roles_ByID", { RoleID: RoleID });
            if (res) {
                this.RolesForm.patchValue(res.Roles_Model);
                this.Role_PermissionList = res.RolePermission_Model;
            }
            this.Is_Edit_Form = true;
        } catch (e) {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
        }
    }

    async SaveRoles() {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.RolesForm.getRawValue();
            obj.RoleID = obj.RoleID == null ? 0 : obj.RoleID;

            let index = this.allItems.findIndex(d => d.Name == obj.Name && d.RoleID != obj.RoleID);//check name exists or not                
            if (index < 0) {
                let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Roles_Update", { model: obj, Permission_List: this.Role_PermissionList });
                if (res > 0) {
                    this.Is_Edit_Form = false;
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgRoleSaved"));
                    this.clearForm();
                    this.refreshGrid();
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
            }
            else {
                if (index > -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgRoleAlreadyExists"));
                }
            }
            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    async DeleteRow() {
        try {
            let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.RoleID).join();
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            } else {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Roles_Delete", { RoleIDs: selectedRow });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgRoleDeleted"));
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorRolesUsedInAnotherTable"));
                    }
                    this.refreshGrid();
                    this.service.App.ShowLoader = false;
                }
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    FullAccess(item: RolePermission_Model) {
        item.Is_View = item.Is_Add = item.Is_Edit = item.Is_Delete = item.Is_Full;
    }
    SubAccess(item: RolePermission_Model) {
        if (item.Is_View && item.Is_Add && item.Is_Edit && item.Is_Delete) {
            item.Is_Full = true;
        }
        else { item.Is_Full = false; }
    }

    clearForm() {
        this.form.resetForm();
        this.RolesForm.controls["Is_Active"].setValue(true);
        this.RolesForm.controls["Is_Agent"].setValue(false);
        this.RolesForm.controls["Is_Client"].setValue(false);
    }
    refreshGrid() {
        this.bindData(true);
    }
    BackToList() { this.Is_Edit_Form = false; this.service.GoTo_ScrollTop(window); }

}


interface Main_Roles_Model {
    Roles_Model: Roles_Model;
    RolePermission_Model: Array<RolePermission_Model>;
}
interface Roles_Model {
    RoleID: number;
    Name: string;
    Description: string;
    Is_Agent: boolean;
    Is_Client: boolean;
    Is_Active: boolean;
    CreatedDate: Date;
    selectedRow: boolean;
}
interface RolePermission_Model {
    RolePermissionID: number;
    RoleID: number;
    MenuID: number;
    MenuName: string;
    Description: string;
    Is_Full: boolean;
    Is_View: boolean;
    Is_Add: boolean;
    Is_Edit: boolean;
    Is_Delete: boolean;
    Is_Active: boolean;
    selectedRow: boolean;
}
