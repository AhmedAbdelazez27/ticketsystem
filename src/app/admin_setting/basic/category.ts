import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { GridFilter } from '../../shared/common_model';
import { ModalDialog } from '../../shared/modal.dialog';
import { AlertType } from '../../shared/common_model';


@Component({
    templateUrl: './category.html'
})

export class CategoryComponent {
    isLoading = false; allItems: Array<Category_Model> = []; txtSearch = "";
    totalitems: number; gridFilter: Array<GridFilter> = [];
    Is_SaveAndAddNew: boolean = false;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCategoryName", ColumnName: "Name", Condition: "no", Type: "string", Value: "", Is_Visible: true });
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
            let res = await this.service.Data.ExecuteAPI_Post<Array<Category_Model>>("Admin/Get_Category_List");
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
    CategoryForm: UntypedFormGroup; isEdit = false;
    @ViewChild('f') form: NgForm;
    @ViewChild("modalAdd") modalAdd: ModalDialog;
    initForm() {
        this.CategoryForm = this.fb.group({
            CategoryID: [0],
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
            let ID = selectedRow[0]["CategoryID"];
            this.EditCategory(ID);
        }
    }
    EditRowDBClick(RowItem: any) {
        this.isEdit = true;
        if (!RowItem.isTrusted && RowItem) {
            this.EditCategory(RowItem.CategoryID);
        }
    }
    async EditCategory(CategoryID) {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Category_Model>("Admin/Get_Category_ByID", { CategoryID: CategoryID });
            if (res) {
                this.CategoryForm.patchValue(res);
            }
            this.modalAdd.open();
            this.Focus_Element();
        } catch (e) {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
        }
    }

    async SaveCategory() {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.CategoryForm.getRawValue();
            obj.CategoryID = obj.CategoryID == null ? 0 : obj.CategoryID;
            let index = this.allItems.findIndex(d => d.Name == obj.Name && d.CategoryID != obj.CategoryID);//check name exists or not        
            let default_index = this.allItems.findIndex(d => d.Is_Default && d.CategoryID != obj.CategoryID);//check any other is default.               
            if (index < 0 && (default_index < 0 || !obj.Is_Default)) {
                let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Category_Update", obj);
                this.service.App.ShowLoader = false;
                if (res > 0) {
                    if (!this.Is_SaveAndAddNew) { this.modalAdd.close(); }
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgCategorySaved"));
                    this.clearForm();
                    this.refreshGrid();
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
            }
            else {
                this.service.App.ShowLoader = false;
                if (index > -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgCategoryAlreadyExists"));
                }
                else if (default_index > -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgDefaultCategorySupportOnlyOne"));
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
            let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.CategoryID).join();
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            } else {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Category_Delete", { CategoryIDs: selectedRow });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgCategoryDeleted"));
                        this.refreshGrid();
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorCategoriesUsedInAnotherTable"));
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
        this.CategoryForm.controls["Is_Active"].setValue(true);
        this.CategoryForm.controls["Is_Client_Visible"].setValue(true);
        this.CategoryForm.controls["Is_Default"].setValue(false);
    }
    refreshGrid() {
        this.bindData(true);
    }

    @ViewChild('focus') inpfocus: ElementRef;
    Focus_Element() {
        window.setTimeout(() => { this.inpfocus.nativeElement.focus(); }, 50);
    }
}

interface Category_Model {
    CategoryID: number;
    Name: string;
    Description: string;
    Is_Active: boolean;
    Is_Default: boolean;
    Is_Client_Visible: boolean;
    CreatedDate: Date;
    selectedRow: boolean;
}