import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { SystemService } from '../../shared/SystemService';
import { GridFilter, Solution_Model } from '../../shared/common_model';
import { ticket_commongrid_Component } from '../../shared/grid/ticket_commongrid';
import { Row_ViewComponent } from '../../dashboard/row_view';
import { AlertType } from '../../shared/common_model';
declare var $: JQueryStatic;

@Component({
    templateUrl: './requester_solution_list.html'
})

export class Requester_Solution_ListComponent {
    isLoading = false; sub: any; allItems_main: Array<Solution_Model> = []; allItems: Array<Solution_Model> = []; txtSearch = ""; search = "";
    totalitems: number; gridFilter: Array<GridFilter> = [];
    AgentList: Array<any> = []; selectedAgent: any;
    @ViewChild(Row_ViewComponent) public Row_View: Row_ViewComponent;
    @ViewChild('commongrid') commongrid: ticket_commongrid_Component;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {

        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblAttachment", ColumnName: "HasAttachment", Type: "icon", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSolutionID", ColumnName: "DisplaySolutionID", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSubject", ColumnName: "Subject", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCategory", ColumnName: "CategoryName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSubCategory", ColumnName: "SubCategoryName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblItem", ColumnName: "ItemName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblComments", ColumnName: "Comments", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblKeywords", ColumnName: "MetaKeywords", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCreatedUser", ColumnName: "CreatedUserName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsClientVisible", ColumnName: "Is_Client_Visible", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsActive", ColumnName: "Is_Active", Condition: "no", Type: "bool", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCreatedDate", ColumnName: "CreatedDate", Condition: "no", Type: "datetime", Value: "", Is_Visible: true, Width: 11 });

        //get-set last remembered columns
        this.service.App.get_cached_column('solution_req_colums', this.gridFilter);

        this.search = this.route.snapshot.queryParamMap.get("search");
        if (this.search) {
            this.location.replaceState('/requester/solution');
        }
    }
    ngOnInit() {
        this.bindData();
        this.sub = this.service.Data.registerReceiver<any>('Get_Language_Refresh').subscribe((res) => {
            if (res.UserID == this.service.Account.UserID && this.router.url.toLowerCase() == '/requester/solution') {
                $(".subtooltip")["webuiPopover"]('destroy');
                this.bindToolTip();
            }
        });
    }
    ngAfterViewInit() { }
    ngOnDestroy() { if (this.sub) { this.sub.unsubscribe(); } }

    async bindData(isRefresh = false) {
        try {
            this.isLoading = true;

            let res = await this.service.Data.ExecuteAPI_Post<Array<Solution_Model>>("Solution/Get_Solution_List", { Is_Agent: false });
            if (res) {
                this.allItems_main = this.allItems = res;
                this.totalitems = res.length;

                if (isRefresh) { this.service.App.refreshGrid.emit(); }

                //text search from dashboard
                if (this.search) {
                    this.txtSearch = this.search;
                    window.setTimeout(() => { this.service.App.searchFilter.emit(this.txtSearch); }, 10);
                    this.search = "";
                }
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
                    container: $this,
                    placement: service.Is_RTL() ? 'left' : 'right',
                    animation: 'fade',
                    type: 'async',
                    url: site_url,
                    async: { type: 'POST', before: function (that, xhr) { xhr.setRequestHeader("Authorization", 'Bearer ' + service.Data.BearerToken); } },
                    cache: true,
                    width: 600,
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

    refreshGrid(isRefresh) {
        this.bindData(isRefresh);
    }

    change_columnchooser(filter: GridFilter, value, index) {
        filter.Is_Visible != value;
        let lst = this.gridFilter.map((d, index) => { return { col: d.ColumnName, show: d.Is_Visible, ind: index } });
        this.service.App.set_localstorage('solution_req_colums', lst);
    }

    ViewRow(RowItem: any) {
        if (RowItem) {
            this.Row_View.open(RowItem, "solution");
        }
        else {
            let selectedRow = this.allItems.filter((x) => x.selectedRow);
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            }
            else if (selectedRow.length > 1) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
            }
            else {
                this.Row_View.open(selectedRow[0], "solution");
            }
        }
    }

    //CloneSolution
    async CloneSolution() {
        try {
            let selectedRow = this.allItems.filter((x) => x.selectedRow);
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            }
            else if (selectedRow.length > 1) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
            }
            else {
                let ID = selectedRow[0]["SolutionID"];
                if (confirm(this.service.Translator.instant("msgCloneSelectedSolution"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<any>("Solution/Solution_Clone", { SolutionID: ID });
                    if (res) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgSolutionCloned"));
                        this.refreshGrid(true);
                        this.service.GoTo_ScrollTop(window);
                    }
                    this.service.App.ShowLoader = false;;
                }
            }

        } catch (e) {
            this.service.App.ShowLoader = false;;
        }
    }

    //Print
    Print() {
        let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.SolutionID).join();
        if (selectedRow.length == 0) {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgSelectSolutionsToPrint"));
        } else {
            let url = this.service.Settings.API_URL + "/Home/Print?ids=" + selectedRow + "&type=solution&lang=" + this.service.CL;
            window.open(url, "Print Preview");
        }
        this.ClearCheckbox();//clear checkbox
    }

    //Export
    async Export(ftype: string) {
        try {
            let items = this.commongrid.records;
            if (items.length > 0) {
                this.service.App.ShowLoader = true;
                let columns = this.gridFilter.filter(d => d.Is_Visible && d.ColumnName != 'HasAttachment').map((val) => {
                    val.DisplayText = this.service.Translator.instant(val.DisplayText);
                    return val;
                });
                let obj = { model: items, Columns: columns, Type: ftype };

                let res = await this.service.Data.ExecuteAPI_Post<any>("Admin/Export_Data", obj);
                if (res) {
                    let filename = ""; let filetype = "";
                    if (ftype == 'excel') { filename = "Solutions.xlsx"; filetype = "application/octet-stream"; }
                    else if (ftype == 'pdf') { filename = "Solutions.pdf"; filetype = "application/pdf"; }
                    else if (ftype == 'csv') { filename = "Solutions.csv"; filetype = "application/octet-stream"; }

                    window["saveAs"](new Blob([window["base64js"].toByteArray(res.data)], { type: filetype }), filename);
                }
                this.service.App.ShowLoader = false;
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgNoRecordsToExport"));
            }

            this.ClearCheckbox();//clear checkbox

        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    //ShowHideColumnFilter
    Is_ShowColumnFilter = true;
    ShowHideColumnFilter() {
        this.Is_ShowColumnFilter = !this.Is_ShowColumnFilter;
        this.service.App.showhideColumnFilter.emit(this.Is_ShowColumnFilter);
    }

    //Clear Checkbox
    ClearCheckbox() {
        this.service.App.clearAllCheckbox.emit();
    }
}


