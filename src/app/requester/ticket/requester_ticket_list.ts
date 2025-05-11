import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UntypedFormBuilder } from '@angular/forms';
import { SystemService } from '../../shared/SystemService';
import { GridFilter, KeyValueString, Ticket_Model } from '../../shared/common_model';
import { ticket_commongrid_Component } from '../../shared/grid/ticket_commongrid';
import { Row_ViewComponent } from '../../dashboard/row_view';
import { AlertType } from '../../shared/common_model';
declare var $: JQueryStatic;


@Component({
    templateUrl: './requester_ticket_list.html'
})

export class Requester_Ticket_ListComponent {
    isLoading = false; sub: any; allItems_main: Array<Ticket_Model> = []; allItems: Array<Ticket_Model> = []; txtSearch = ""; search = "";
    totalitems: number; gridFilter: Array<GridFilter> = []; selectedFilterType: string = ""; selectedFilterText: string = "All Tickets"; flType: string = "";
    FilterList: Array<KeyValueString> = [];
    @ViewChild(Row_ViewComponent) public Row_View: Row_ViewComponent;
    @ViewChild('commongrid') commongrid: ticket_commongrid_Component;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
        this.service.GoTo_ScrollTop(window);

        this.gridFilter.push(<GridFilter>{ DisplayText: "lblAttachment", ColumnName: "HasAttachment", Type: "icon", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblTicketID", ColumnName: "DisplayTicketID", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSubject", ColumnName: "Subject", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblRequestType", ColumnName: "RequestTypeName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblStatus", ColumnName: "StatusName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblRequester", ColumnName: "RequestedName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblAssignedTo", ColumnName: "AssignedName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblPriority", ColumnName: "PriorityName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCategory", ColumnName: "CategoryName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblSubCategory", ColumnName: "SubCategoryName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblItem", ColumnName: "ItemName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblUrgency", ColumnName: "UrgencyName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblImpact", ColumnName: "ImpactName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblDepartment", ColumnName: "DepartmentName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblLevel", ColumnName: "LevelName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblLocation", ColumnName: "LocationName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblTicketMode", ColumnName: "TicketModeName", Condition: "no", Type: "string", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCreatedDate", ColumnName: "CreatedDate", Condition: "no", Type: "datetime", Value: "", Is_Visible: true, Width: 11 });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblDueDate", ColumnName: "DueDate", Condition: "no", Type: "datetime", Value: "", Is_Visible: false });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblClosedDate", ColumnName: "ClosedDate", Condition: "no", Type: "datetime", Value: "", Is_Visible: false });

        //get-set last remembered columns
        this.service.App.get_cached_column('ticket_req_colums', this.gridFilter);

        this.flType = this.route.snapshot.queryParamMap.get("type");
        this.search = this.route.snapshot.queryParamMap.get("search");
        if (this.flType || this.search) {
            this.location.replaceState('/requester/ticket');
        }

        this.bindFilterList();
    }
    ngOnInit() {
        this.bindData();
        this.sub = this.service.Data.registerReceiver<any>('Get_Language_Refresh').subscribe((res) => {
            if (res.UserID == this.service.Account.UserID && this.router.url.toLowerCase() == '/requester/ticket') {
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

            let account = this.service.Account;
            let res = await this.service.Data.ExecuteAPI_Post<Array<Ticket_Model>>("Ticket/Get_Ticket_List", { Is_Agent: account.Is_Agent, Is_Client: account.Is_Client });
            if (res) {
                this.allItems_main = this.allItems = res;
                this.totalitems = res.length;

                //Filter change come from dashboard
                if (this.flType) {
                    this.selectedFilterType = this.flType;
                    this.selectedFilterText = this.FilterList.find(d => d.Value == this.flType).Key;
                    this.FilterChange(this.selectedFilterType);
                    this.flType = "";
                }
                else {
                    if (isRefresh) { this.FilterChange(this.selectedFilterType); }
                }
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
    bindFilterList() {
        this.FilterList.push({ Key: "lblMyAllTickets", Value: "" });
        this.FilterList.push({ Key: "lblMyOpenTickets", Value: "myopen" });
        this.FilterList.push({ Key: "lblMyCompletedTickets", Value: "myclosed" });
        this.FilterList.push({ Key: "lblMyPendingTickets", Value: "mypending" });
        this.FilterList.push({ Key: "lblMyOpenAndUnassigned", Value: "myunassign" });
        this.FilterList.push({ Key: "lblMyOverdueTickets", Value: "myoverdue" });
        this.FilterList.push({ Key: "lblMyTicketsDueToday", Value: "myduetoday" });
        this.FilterList.push({ Key: "lblMyUpdatedTickets", Value: "myupdated" });
    }

    bindToolTip() {
        let service = this.service;
        window.setTimeout(() => {
            $(".subtooltip").each(function () {
                var $this = $(this);
                let obj: any = $this.find('#ID').val();
                let strSplit = obj.split("|"); //ID|Subject|Category|Status
                let site_url = service.Settings.API_URL + "/Home/Get_Tooltip?ModuleType=ticket&lang=" + service.CL + "&ID=" + strSplit[0] + "&Subject=" + strSplit[1] + "&Category=" + strSplit[2] + "&Status=" + strSplit[3];
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
        this.service.App.set_localstorage('ticket_req_colums', lst);
    }

    AddRow() {
        this.router.navigate(['/requester/ticket/add']);
    }
    EditRow() {
        let selectedRow = this.allItems.filter((x) => x.selectedRow);
        if (selectedRow.length == 0) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
        }
        else if (selectedRow.length > 1) {
            this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
        }
        else {
            let ID = selectedRow[0]["DisplayTicketID"];
            this.EditTicket(ID);
        }
    }
    EditRowDBClick(RowItem: any) {
        if (!RowItem.isTrusted && RowItem) {
            this.EditTicket(RowItem.DisplayTicketID);
        }
    }
    EditTicket(DisplayTicketID) {
        $(".subtooltip")["webuiPopover"]('destroy');
        this.router.navigate(["/requester/ticket/detail", DisplayTicketID]);//redirect to ticket detail page
    }
    async DeleteRow() {
        try {
            let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.TicketID).join();
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            } else {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/Ticket_Delete", { TicketIDs: selectedRow });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketDeleted"));
                        this.refreshGrid(true);
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorTicketsUsedInAnotherTable"));
                    }
                    this.service.App.ShowLoader = false;
                }
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    ViewRow(RowItem: any) {
        if (RowItem) {
            this.Row_View.open(RowItem, "ticket");
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
                this.Row_View.open(selectedRow[0], "ticket");
            }
        }
    }

    //CloneTicket
    async CloneTicket() {
        try {
            let selectedRow = this.allItems.filter((x) => x.selectedRow);
            if (selectedRow.length == 0) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
            }
            else if (selectedRow.length > 1) {
                this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
            }
            else {
                let ID = selectedRow[0]["TicketID"];
                if (confirm(this.service.Translator.instant("msgCloneSelectedTicket"))) {
                    this.service.App.ShowLoader = true;
                    let res = await this.service.Data.ExecuteAPI_Post<any>("Ticket/Ticket_Clone", { TicketID: ID });
                    if (res) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketCloned"));
                        this.refreshGrid(true);
                        this.service.GoTo_ScrollTop(window);
                    }
                    this.service.App.ShowLoader = false;;
                }
            }
            this.ClearCheckbox();//clear checkbox

        } catch (e) {
            this.service.App.ShowLoader = false;;
        }
    }

    //Filter 
    FilterChange(value: string) {
        let filter_Items = []; let cDate = this.service.Date_Format(new Date(), 'yyyy-MM-dd');
        if (value == "") {
            filter_Items = this.allItems_main;
        }
        else if (value == "myopen") {
            filter_Items = this.allItems_main.filter(d => (d.StatusType == "Open" || d.StatusType == "OnHold") && d.RequestedUser == this.service.Account.UserID);
        }
        else if (value == "myclosed") {
            filter_Items = this.allItems_main.filter(d => d.StatusType == "Closed" && d.RequestedUser == this.service.Account.UserID);
        }
        else if (value == "mypending") {
            filter_Items = this.allItems_main.filter(d => (d.StatusType == "Open" || d.StatusType == "OnHold") && d.RequestedUser == this.service.Account.UserID && d.AssignedUser);
        }
        else if (value == "myunassign") {
            filter_Items = this.allItems_main.filter(d => (d.StatusType == "Open" || d.StatusType == "OnHold") && d.RequestedUser == this.service.Account.UserID && !d.AssignedUser);
        }
        else if (value == "myoverdue") {
            filter_Items = this.allItems_main.filter(d => (d.StatusType == "Open" || d.StatusType == "OnHold") && d.RequestedUser == this.service.Account.UserID && d.DueDate && this.service.Date_Format(d.DueDate, 'yyyy-MM-dd') < cDate);
        }
        else if (value == "myduetoday") {
            filter_Items = this.allItems_main.filter(d => (d.StatusType == "Open" || d.StatusType == "OnHold") && d.RequestedUser == this.service.Account.UserID && d.DueDate && this.service.Date_Format(d.DueDate, 'yyyy-MM-dd') == cDate);
        }
        else if (value == "myupdated") {
            filter_Items = this.allItems_main.filter(d => d.UpdatedUser == this.service.Account.UserID);
        }
        this.allItems = filter_Items;
        this.service.App.refreshGrid.emit();
    }

    //Print
    Print() {
        let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.TicketID).join();
        if (selectedRow.length == 0) {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgSelectSolutionsToPrint"));
        } else {
            let url = this.service.Settings.API_URL + "/Home/Print?ids=" + selectedRow + "&type=ticket&lang=" + this.service.CL;
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
                    if (ftype == 'excel') { filename = "Tickets.xlsx"; filetype = "application/octet-stream"; }
                    else if (ftype == 'pdf') { filename = "Tickets.pdf"; filetype = "application/pdf"; }
                    else if (ftype == 'csv') { filename = "Tickets.csv"; filetype = "application/octet-stream"; }

                    window["saveAs"](new Blob([window["base64js"].toByteArray(res.data)], { type: filetype }), filename);
                }
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgNoRecordsToExport"));
            }

            this.ClearCheckbox();//clear checkbox

            this.service.App.ShowLoader = false;
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


