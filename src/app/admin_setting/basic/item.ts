import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { GridFilter, KeyValue } from '../../shared/common_model';
import { ModalDialog } from '../../shared/modal.dialog';
import { AlertType } from '../../shared/common_model';


@Component({
    templateUrl: './item.html'
})

export class ItemComponent {
    isLoading = false; allItems: Array<Item_Model> = []; txtSearch = "";
    totalitems: number; gridFilter: Array<GridFilter> = [];
    Is_SaveAndAddNew: boolean = false;
    SubCategoryList: Array<KeyValue> = [];
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblItemName", ColumnName: "Name", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCategorySubCategory", ColumnName: "SubCategoryName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblDescription", ColumnName: "Description", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsActive", ColumnName: "Is_Active", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsClientVisible", ColumnName: "Is_Client_Visible", Condition: "no", Type: "bool", Value: "", Is_Visible: true });

        this.initForm();
    }
    ngOnInit() {
        this.bindData();
    }
    async bindData(isRefresh = false) {
        try {
            this.isLoading = true;
            let res = await this.service.Data.ExecuteAPI_Post<Array<Item_Model>>("Admin/Get_Item_List");
            if (res) {
                this.allItems = res;
                this.totalitems = res.length;

                if (isRefresh) { this.service.App.refreshGrid.emit(); }
            }
            this.isLoading = false;

            this.SubCategoryList = await this.service.Data.ExecuteAPI_Post<Array<KeyValue>>("Admin/Get_SubCategory_List_KeyValue");
            this.SubCategoryList.splice(0, 0, <KeyValue>{ Key: this.service.Translator.instant("lblSelect"), Value: 0 });

        } catch (e) {
            this.isLoading = false;
        }
    }
    pageChanged(obj: any) { }

    //Add/Edit 
    ItemForm: UntypedFormGroup; isEdit = false;
    @ViewChild('f') form: NgForm;
    @ViewChild("modalAdd") modalAdd: ModalDialog;
    initForm() {
        this.ItemForm = this.fb.group({
            ItemID: [0],
            SubCategoryID: [0, Validators.compose([Validators.required, Validators.min(1)])],
            Name: ["", Validators.required],
            Description: [""],
            Is_Active: [true],
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
            let ID = selectedRow[0]["ItemID"];
            this.EditItem(ID);
        }
    }
    EditRowDBClick(RowItem: any) {
        this.isEdit = true;
        if (!RowItem.isTrusted && RowItem) {
            this.EditItem(RowItem.ItemID);
        }
    }
    async EditItem(ItemID) {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Item_Model>("Admin/Get_Item_ByID", { ItemID: ItemID });
            if (res) {
                this.ItemForm.patchValue(res);
            }
            this.modalAdd.open();
            this.Focus_Element();

        } catch (e) {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
        }
    }

    async SaveItem() {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.ItemForm.getRawValue();
            obj.ItemID = obj.ItemID == null ? 0 : obj.ItemID;

            let index = this.allItems.findIndex(d => d.Name == obj.Name && d.ItemID != obj.ItemID && d.SubCategoryID == obj.SubCategoryID);//check name exists or not                
            if (index < 0) {
                let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Item_Update", obj);
                if (res > 0) {
                    if (!this.Is_SaveAndAddNew) { this.modalAdd.close(); }
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgItemSaved"));
                    this.clearForm();
                    this.refreshGrid();
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
            }
            else {
                if (index > -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgItemAlreadyExists"));
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
            let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.ItemID).join();
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            } else {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Item_Delete", { ItemIDs: selectedRow });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgItemDeleted"));
                        this.refreshGrid();
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorItemsUsedInAnotherTable"));
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
        this.ItemForm.controls["SubCategoryID"].setValue(0);
        this.ItemForm.controls["Is_Active"].setValue(true);
        this.ItemForm.controls["Is_Client_Visible"].setValue(true);
    }
    refreshGrid() {
        this.bindData(true);
    }

    @ViewChild('focus') inpfocus: ElementRef;
    Focus_Element() {
        window.setTimeout(() => { this.inpfocus.nativeElement.focus(); }, 50);
    }
}

interface Item_Model {
    ItemID: number;
    CategoryID: number;
    SubCategoryID: number;
    Name: string;
    SubCategoryName: string;
    Description: string;
    Is_Active: boolean;
    Is_Default: boolean;
    Is_Client_Visible: boolean;
    CreatedDate: Date;
    selectedRow: boolean;
}