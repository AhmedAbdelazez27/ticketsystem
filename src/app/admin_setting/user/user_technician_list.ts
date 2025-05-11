import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { GridFilter, UserManagement_Model, AlertType } from '../../shared/common_model';
import { ModalDialog } from '../../shared/modal.dialog';

@Component({
    selector: 'user-technician',
    templateUrl: './user_technician_list.html'
})

export class User_Technician_ListComponent {
    isLoading = false; allItems: Array<UserManagement_Model> = []; txtSearch = "";
    gridFilter: Array<GridFilter> = [];
    isTechnician: boolean = false; selectedUser: any; userObj: User_Tech_model;
    @Output('onSave') public onSave: EventEmitter<any> = new EventEmitter();
    @ViewChild("modalUser_Technician") modalUser_Technician: ModalDialog;
    @ViewChild("modalViewUser") modalViewUser: ModalDialog;
    isMultiSelect_Row = false;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router
    ) {

        this.service.GoTo_ScrollTop(window);
        this.gridFilter.push(<GridFilter>{ DisplayText: "", ColumnName: "ProfilePicture", Type: "image", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblDisplayName", ColumnName: "DisplayName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblUserName", ColumnName: "UserName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblEmail", ColumnName: "Email", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblRoleName", ColumnName: "RoleName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblPhoneNo", ColumnName: "PhoneNo", Condition: "no", Type: "string", Value: "", Is_Visible: true });
    }
    ngOnInit() { }
    open(isTechnician: boolean, items, isMultiSelect_Row = false) {
        this.isMultiSelect_Row = isMultiSelect_Row;
        this.allItems = []; this.selectedUser = null; //this.allItems = items;
        this.isTechnician = isTechnician;

        this.allItems = items;

        this.service.App.refreshGrid.emit();
        this.modalUser_Technician.open();
    }

    pageChanged(obj: any) { }

    SelectRow() {
        let selectedRow = this.allItems.filter((x) => x.selectedRow);
        if (selectedRow.length == 0) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
        }
        else if (selectedRow.length > 1 && !this.isMultiSelect_Row) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
        }
        else {
            this.selectedUser = selectedRow[0];
            if (this.isMultiSelect_Row) { this.selectedUser = selectedRow; }
            this.userObj = { user: this.selectedUser, isTechnician: this.isTechnician };
            this.onSave.emit(this.userObj);
            this.Close();
        }
    }
    async ViewRow(user: any, UserID: number = 0) {
        if (UserID > 0) {
            let res = await this.service.Data.ExecuteAPI_Post<UserManagement_Model>("Admin/Get_UserManagement_ByID", { UserID: UserID });
            if (res) {
                this.selectedUser = res;
                this.modalViewUser.open();
            }
        } else {
            if (user) {
                this.selectedUser = user;
                this.modalViewUser.open();
            } else {
                let selectedRow = this.allItems.filter((x) => x.selectedRow);
                if (selectedRow.length == 0) {
                    this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
                }
                else if (selectedRow.length > 1) {
                    this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
                }
                else {
                    this.selectedUser = selectedRow[0];
                    this.modalViewUser.open();
                }
            }
        }
    }

    EditRowDBClick(RowItem: any) {
        if (!RowItem.isTrusted && RowItem) {
            this.selectedUser = RowItem;
            this.userObj = { user: this.selectedUser, isTechnician: this.isTechnician };
            this.onSave.emit(this.userObj);
            this.Close();
        }
    }
    Close() {
        this.modalUser_Technician.close();
    }

}

interface User_Tech_model {
    user: UserManagement_Model;
    isTechnician: boolean;
}
