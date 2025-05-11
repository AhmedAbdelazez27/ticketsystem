import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SystemService } from '../shared/SystemService';
import { GridFilter, Solution_Model, AlertType } from '../shared/common_model';
import { ModalDialog } from '../shared/modal.dialog';

declare var $: JQueryStatic;

@Component({
    selector: 'solution_find-list',
    templateUrl: './solution_find_list.html'
})

export class Solution_Find_ListComponent {
    isLoading = false; allItems_main: Array<Solution_Model> = []; allItems: Array<Solution_Model> = [];
    totalitems: number; gridFilter: Array<GridFilter> = [];
    @Output('onSelectSolution') public onSelectSolution: EventEmitter<any> = new EventEmitter();
    @ViewChild("modalSolution_List") modalSolution_List: ModalDialog;

    constructor(public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblAttachment", ColumnName: "HasAttachment", Type: "icon", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSolutionID", ColumnName: "DisplaySolutionID", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSubject", ColumnName: "Subject", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCategory", ColumnName: "CategoryName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblComments", ColumnName: "Comments", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCreatedUser", ColumnName: "CreatedUserName", Condition: "no", Type: "string", Value: "", Is_Visible: true });

    }
    ngOnInit() {
        this.bindData();
    }

    async bindData(isRefresh = false) {
        try {
            this.isLoading = true;
            let res = await this.service.Data.ExecuteAPI_Post<Array<Solution_Model>>("Solution/Get_Solution_List", { Is_Agent: true });
            if (res) {
                this.allItems_main = this.allItems = res;
                this.totalitems = res.length;
                this.bindToolTip();
            }
            this.isLoading = false;
        } catch (e) {
            this.isLoading = false;
        }
    }
    pageChanged(obj: any) { this.bindToolTip(); }

    bindToolTip() {
        let service = this.service;
        window.setTimeout(() => {
            $(".subtooltip").each(function () {
                var $this = $(this);
                let obj: any = $this.find('#ID').val();
                let strSplit = obj.split("|"); //ID|Subject|Category|Status                
                let site_url = service.Settings.API_URL + "/Home/Get_Tooltip?ModuleType=solution&lang=" + service.CL + "&ID=" + strSplit[0] + "&Subject=" + strSplit[1] + "&Category=" + strSplit[2];
                $(this)["webuiPopover"]({
                    container: $this,//'.subtooltip',
                    placement: service.Is_RTL() ? 'left' : 'right',
                    animation: 'fade',
                    type: 'async',
                    url: site_url,
                    async: { type: 'POST', before: function (that, xhr) { xhr.setRequestHeader("Authorization", 'Bearer ' + service.Data.BearerToken); } },
                    cache: true,
                    width: 500,
                    height: 'auto',
                    trigger: 'hover',
                    delay: {
                        show: 400,
                        hide: 100
                    },
                    closeable: false,
                    offsetTop: 0,
                });
            });
        }, 300);
    }
    open() {
        this.modalSolution_List.open();
    }

    SelectRow() {
        let selectedRow = this.allItems.filter((x) => x.selectedRow);
        if (selectedRow.length == 0) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
        }
        else if (selectedRow.length > 1) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
        }
        else {
            let solution = selectedRow[0]; solution.selectedRow = false;
            this.onSelectSolution.emit(solution.DisplaySolutionID);
            this.Close();
        }
    }
    EditRowDBClick(RowItem: any) {
        if (!RowItem.isTrusted && RowItem) {
            let solution = RowItem; solution.selectedRow = false;
            this.onSelectSolution.emit(solution.DisplaySolutionID);
            this.Close();
        }
    }
    Close() {
        this.modalSolution_List.close();
    }

}

