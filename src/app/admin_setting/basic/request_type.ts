import { Component, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { GridFilter } from '../../shared/common_model';
import { ModalDialog } from '../../shared/modal.dialog';
import { AlertType } from '../../shared/common_model';


@Component({
    templateUrl: './request_type.html'
})

export class Request_TypeComponent {
    isLoading = false; allItems: Array<RequestType_Model> = []; txtSearch = "";
    totalitems: number; gridFilter: Array<GridFilter> = [];
    Is_SaveAndAddNew: boolean = false;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblRequestTypeName", ColumnName: "Name", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblDescription", ColumnName: "Description", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsActive", ColumnName: "Is_Active", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsDefault", ColumnName: "Is_Default", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsClientVisible", ColumnName: "Is_Client_Visible", Condition: "no", Type: "bool", Value: "", Is_Visible: true });

        this.initForm();
    }
    ngOnInit() {
        this.bindData();
    }
    async bindData(isRefresh = false) {
        try {
            this.isLoading = true;
            let res = await this.service.Data.ExecuteAPI_Post<Array<RequestType_Model>>("Admin/Get_RequestType_List");
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
    RequestTypeForm: UntypedFormGroup; isEdit = false;
    @ViewChild('f') form: NgForm;
    @ViewChild("modalAdd") modalAdd: ModalDialog;
    initForm() {
        this.RequestTypeForm = this.fb.group({
            RequestTypeID: [0],
            Name: ["", Validators.required],
            Description: [""],
            Is_Active: [true],
            Is_Default: [false],
            Is_Client_Visible: [true]
        });
    }
    AddRow() {
        this.isEdit = false;
        this.clearForm();
        this.modalAdd.open();
        this.Focus_Element();
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
            let ID = selectedRow[0]["RequestTypeID"];
            this.EditRequestType(ID);
        }
    }
    EditRowDBClick(RowItem: any) {
        this.isEdit = true;
        if (!RowItem.isTrusted && RowItem) {
            this.EditRequestType(RowItem.RequestTypeID);
        }
    }
    async EditRequestType(RequestTypeID) {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<RequestType_Model>("Admin/Get_RequestType_ByID", { RequestTypeID: RequestTypeID });
            if (res) {
                this.RequestTypeForm.patchValue(res);
            }
            this.modalAdd.open();
            this.Focus_Element();
        } catch (e) {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
        }
    }


    async SaveRequestType() {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.RequestTypeForm.getRawValue();
            obj.RequestTypeID = obj.RequestTypeID == null ? 0 : obj.RequestTypeID;

            let index = this.allItems.findIndex(d => d.Name == obj.Name && d.RequestTypeID != obj.RequestTypeID);//check name exists or not        
            let default_index = this.allItems.findIndex(d => d.Is_Default && d.RequestTypeID != obj.RequestTypeID);//check any other is default.               
            if (index < 0 && (default_index < 0 || !obj.Is_Default)) {
                let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/RequestType_Update", obj);
                if (res > 0) {
                    if (!this.Is_SaveAndAddNew) { this.modalAdd.close(); }
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgRequestTypeSaved"));
                    this.clearForm();
                    this.refreshGrid();
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
            }
            else {
                if (index > -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgRequestTypeAlreadyExists"));
                }
                else if (default_index > -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgDefaultRequestTypeSupportOnlyOne"));
                }
            }
            this.Is_SaveAndAddNew = false;
            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    async DeleteRow() {
        try {
            let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.RequestTypeID).join();
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            } else {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/RequestType_Delete", { RequestTypeIDs: selectedRow });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgRequestTypeDeleted"));
                        this.refreshGrid();
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorRequestTypesUsedInAnotherTable"));
                    }
                    this.service.App.ShowLoader = false;
                }
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    clearForm() {
        this.Is_SaveAndAddNew = false;
        this.form.resetForm();
        this.RequestTypeForm.controls["Is_Active"].setValue(true);
        this.RequestTypeForm.controls["Is_Client_Visible"].setValue(true);
        this.RequestTypeForm.controls["Is_Default"].setValue(false);
    }
    refreshGrid() {
        this.bindData(true);
    }

    @ViewChild('focus') inpfocus: ElementRef;
    Focus_Element() {
        window.setTimeout(() => { this.inpfocus.nativeElement.focus(); }, 50);
    }
}

interface RequestType_Model {
    RequestTypeID: number;
    Name: string;
    Description: string;
    Is_Active: boolean;
    Is_Default: boolean;
    Is_Client_Visible: boolean;
    CreatedDate: Date;
    selectedRow: boolean;
}