import { Component, OnInit, Input, Output, ElementRef, ChangeDetectorRef, HostListener, EventEmitter, ViewChild } from '@angular/core';
import { Router, RouterModule, Routes, NavigationExtras } from '@angular/router'
import { GridFilter, Pager } from '../common_model';
import { SystemService } from '../SystemService';
import { FlatpickrOptions } from 'ng2-flatpickr';

@Component({
    selector: 'commongrid',
    templateUrl: './commongrid.html',
    host: {
        '(document:click)': 'onDocumentClick($event)',
    },
})

export class commongrid_Component {
    @Input() records: any;
    allItems: Array<any>[];
    fltrRecords: Array<any>[];//this is used for main filter
    pagedItems: Array<any>[];//pagesize wise items
    @Input() gridfilter: Array<GridFilter>;
    pager: Pager = new Pager();
    @Input() totalitems: number = 0; //pass when page wise data come
    @Input() pagesize: number = 10;
    @Input() SortField: string = "";
    @Input() SortDirection: string = "";
    SortType: string = "string";

    @Input() ShowFilter: boolean = false;
    @Input() ShowSorting: boolean = false;
    @Input() PagingType: string = "nextprevnumberadvanced";//nextprevnumber|nextprevnumberadvanced|nextprev
    @Input() ShowPagesize: boolean = false;
    @Input() ShowCheckbox: boolean = false;
    @Input() Edit: boolean = false;
    @Input() EditUrl: string = "/employee/employeedetail";
    @Input() SearchText: string = "";
    txtSearch: string = "";

    @Output() change: EventEmitter<any> = new EventEmitter<any>();
    @Output("EditRow") editRow: EventEmitter<any> = new EventEmitter<any>();
    @Output("ViewRow") viewRow: EventEmitter<any> = new EventEmitter<any>();
    @Output("ActionRow") ActionRow: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('condition') condition: ElementRef;
    @ViewChild('container') container: ElementRef;

    //Variables
    selectedRow: any; selectedAll: any; isShowfiltermenu: boolean = false; top: number; left: number;
    //Column Filter
    isDate: boolean; isString: boolean; isCheckbox: boolean; isNumber: boolean;
    ColumnIndex: number;
    isFilterSearch: boolean = false;
    RefreshTime = this.service.Date_Format(new Date(), "yyyyMMddHHmmss");
    @ViewChild('currentTarget') currentTarget;
    dtConfig: FlatpickrOptions = this.service.CommonDateConfig();
    constructor(public service: SystemService, public eRef: ElementRef, public changeDetector: ChangeDetectorRef, public router: Router) {
        this.service.App.searchFilter.subscribe((value: any) => {
            this.SearchFilter(value); //changeDetector.detectChanges();
        });
        this.service.App.refreshGrid.subscribe((value: any) => {
            this.RefreshGrid(); //changeDetector.detectChanges();
        });
        this.service.App.showhideColumnFilter.subscribe((value: any) => {
            this.ShowHideColumnFilter(value); //changeDetector.detectChanges();
        });

        this.service.App.clearAllCheckbox.subscribe(() => {
            this.ClearCheckboxSelect(); changeDetector.detectChanges();
        });
    }

    onDocumentClick(event: Event) {
        if (this.currentTarget && this.currentTarget.nativeElement != event.target) {
            this.isShowfiltermenu = false;
        }
    }

    ngOnInit() {
        if (this.service.Account.Is_Agent) { this.pagesize = this.service.Account.PageSize ? this.service.Account.PageSize : this.pagesize; }
        else { this.pagesize = this.service.Account.PageSize_Client ? this.service.Account.PageSize_Client : this.pagesize; }

        this.allItems = this.records;
        this.SortField = this.SortField;
        this.SortDirection = this.SortDirection ? this.SortDirection : 'asc';
        this.setPage(1);
    }
    ngOnDestroy() {
        this.changeDetector.detach(); // do this
    }

    ngAfterViewInit() { }

    Refresh() {
        this.records = this.allItems;
        this.fltrRecords = this.allItems;
        this.setPage(1);
    }

    //Sorting    
    changeSorting(columnName: string, Type: string, isFilter: boolean = false) {
        let isNumber = false; let is_Date = false;
        if (Type == "date" || Type == "datetime") { is_Date = true; }
        if (Type == "number" || Type == "int" || columnName.indexOf("_Unix") > -1) { isNumber = true; }
        this.SortType = Type;
        this.SortField = columnName;
        if (!isFilter) {
            this.SortDirection = this.SortDirection.toLowerCase() === 'asc' ? 'desc' : 'asc';
        }
        var isNumeric: boolean = (columnName && columnName.indexOf("Amount") != -1) || isNumber;

        var sortFunc = function (field, rev, primer) {
            // Return the required a,b function
            return function (a, b) {
                // Reset a, b to the field
                a = primer(pathValue(a, field)), b = primer(pathValue(b, field));
                // Do actual sorting, reverse as needed
                return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (rev ? -1 : 1);
            }
        };

        // Have to handle deep paths
        var pathValue = function (obj, path) {
            for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
                obj = obj[path[i]];
            };
            return obj;
        };

        var primer = isNumeric ?
            function (a) {
                var retValue = parseFloat(String(a).replace(/[^0-9.-]+/g, ''));
                return isNaN(retValue) ? 0.0 : retValue;
            } :
            function (a) { return String(a).toUpperCase(); };

        if (!is_Date) {
            this.records.sort(sortFunc(columnName, this.SortDirection === 'desc', primer));
        }
        else {
            this.records.sort((a: any, b: any) => {
                let rev = this.SortDirection === 'desc';
                let aCol = a[columnName]; let bCol = b[columnName];

                return ((aCol && aCol) < (bCol && bCol) ? -1 : ((aCol && aCol) > (bCol && bCol) ? 1 : 0)) * (rev ? -1 : 1);
            });
        }

        this.setPage(this.pager.currentPage);
    };

    //Column Filter    
    oldColumnName: string = "";
    ColumnFilter(ColumnType: string, ColumnValue: string, index: number, event: Event) {

        let elemRect = (<Element>event.currentTarget).getBoundingClientRect();
        let cRect = this.container.nativeElement.getBoundingClientRect();
        window.setTimeout(() => {
            let condRect = this.condition.nativeElement.getBoundingClientRect();
            this.top = elemRect.top - (cRect.top + elemRect.height + 7);
            this.left = elemRect.left - (cRect.left + (condRect.width / 2 - elemRect.width / 2));


            if (ColumnType && (ColumnType == "date" || ColumnType == "datetime")) { this.isDate = true; this.isString = false; this.isCheckbox = false; this.isNumber = false; }
            else if (ColumnType && ColumnType == "bool") { this.isCheckbox = true; this.isDate = false; this.isString = false; this.isNumber = false; }
            else if (ColumnType && ColumnType == "number") { this.isCheckbox = false; this.isDate = false; this.isString = false; this.isNumber = true; }
            else { this.isString = true; this.isCheckbox = false; this.isDate = false; this.isNumber = false; }

            this.gridfilter[index].Value = ColumnValue;
            this.ColumnIndex = index;

            for (let i = 0; i < this.gridfilter.length; i++) {
                if (this.gridfilter[i].ColumnName == this.gridfilter[this.ColumnIndex].ColumnName) {
                    let cnd = this.gridfilter[i].Condition == "no" ? "" : this.gridfilter[i].Condition;
                    if ((document.getElementsByClassName("filter_list_ul")[0]).querySelector("li[class=selected]")) {
                        (document.getElementsByClassName("filter_list_ul")[0]).querySelector("li[class=selected]").classList.remove("selected");
                    }

                    let attr = (document.getElementsByClassName("filter_list_ul")[0]).querySelector("li[value='" + cnd + "']");
                    if (attr) {
                        attr.className = "selected";
                        this.changeDetector.detectChanges();
                    }
                }
            }
            if (this.oldColumnName == this.gridfilter[index].ColumnName) {
                this.isShowfiltermenu = !this.isShowfiltermenu;//show filter menu
            }
            else {
                this.isShowfiltermenu = true;//show filter menu
            }
            //old columnname update for show/hide filter menu
            this.oldColumnName = this.gridfilter[index].ColumnName;

        }, 60);
    }

    FilterConditionClick(event: any, condition: string) {
        this.gridfilter[this.ColumnIndex].Condition = condition;
        if (condition == "") { this.gridfilter[this.ColumnIndex].Value = ""; }

        this.isShowfiltermenu = false;

        this.Filter();
    }
    FilterOnTextboxEnter(ColumnType: string, ColumnValue: string, index: number, event: any) {
        this.gridfilter[index].Value = ColumnValue;
        this.ColumnIndex = index;
        if (ColumnValue == null || ColumnValue == "") {
            this.gridfilter[this.ColumnIndex].Condition = "";
        }
        else if (ColumnType == "string") { this.gridfilter[this.ColumnIndex].Condition = "contain"; }
        else if (ColumnType == "number" || ColumnType == "int") { this.gridfilter[this.ColumnIndex].Condition = "equal"; }

        this.Filter();
    }

    Filter() {
        let filterArr: Array<any> = this.allItems;
        this.gridfilter.forEach((d) => {
            if ((d.Value != undefined && d.Value != "") || (d.Condition == "isnull" || d.Condition == "isnotnull") || d.Type == "bool") {
                if (d.Type == "string") {
                    if (d.Condition == 'equal') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && item[d.ColumnName].toString().toLowerCase() == d.Value.toLowerCase();
                        });
                    }
                    else if (d.Condition == 'notequal') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && item[d.ColumnName].toString().toLowerCase() != d.Value.toLowerCase();
                        });
                    }
                    else if (d.Condition == 'contain') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && item[d.ColumnName].toString().toLowerCase().indexOf(d.Value.toLowerCase()) > -1;
                        });
                    }
                    else if (d.Condition == 'doesnotcontain') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && item[d.ColumnName].toString().toLowerCase().indexOf(d.Value.toLowerCase()) <= -1;
                        });
                    }
                    else if (d.Condition == 'startwith') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && item[d.ColumnName].toString().toLowerCase().indexOf(d.Value.toLowerCase()) === 0;
                        });
                    }
                    else if (d.Condition == 'endwith') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && item[d.ColumnName].toString().toLowerCase().substr(d.Value.length * -1) === d.Value.toLowerCase();
                        });
                    }
                }
                else if (d.Type == "date" || d.Type == "datetime") {
                    let val = d.Value;
                    if (d.Condition == 'equal') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && this.service.Date_Format(item[d.ColumnName], 'yyyy-MM-dd') == val;
                        });
                    }
                    else if (d.Condition == 'notequal') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && this.service.Date_Format(item[d.ColumnName], 'yyyy-MM-dd') != val;
                        });
                    }
                    else if (d.Condition == 'after') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && this.service.Date_Format(item[d.ColumnName], 'yyyy-MM-dd') > val;
                        });
                    }
                    else if (d.Condition == 'before') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && this.service.Date_Format(item[d.ColumnName], 'yyyy-MM-dd') < val;
                        });
                    }
                }
                else if (d.Type == "bool") {
                    if (d.Condition == 'equal') {
                        d.Value = d.Value == undefined || d.Value == "" ? false : d.Value;
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] == d.Value;
                        });
                    }
                    else if (d.Condition == 'notequal') {
                        d.Value = d.Value == undefined || d.Value == "" ? false : d.Value;
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] != d.Value;
                        });
                    }
                }
                else if (d.Type == "number" || d.Type == "int") {
                    if (d.Condition == 'equal') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && parseFloat(item[d.ColumnName]) == parseFloat(d.Value);
                        });
                    }
                    else if (d.Condition == 'notequal') {
                        filterArr = filterArr.filter((item) => {
                            return item[d.ColumnName] && parseFloat(item[d.ColumnName]) != parseFloat(d.Value);
                        });
                    }
                    else if (d.Condition == 'greaterthan') {
                        filterArr = filterArr.filter((item) => {
                            return parseFloat(item[d.ColumnName]) > parseFloat(d.Value);
                        });
                    }
                    else if (d.Condition == 'lessthan') {
                        filterArr = filterArr.filter((item) => {
                            return parseFloat(item[d.ColumnName]) < parseFloat(d.Value);
                        });
                    }
                    else if (d.Condition == 'greaterthanequal') {
                        filterArr = filterArr.filter((item) => {
                            return parseFloat(item[d.ColumnName]) >= parseFloat(d.Value);
                        });
                    }
                    else if (d.Condition == 'lessthanequal') {
                        filterArr = filterArr.filter((item) => {
                            return parseFloat(item[d.ColumnName]) <= parseFloat(d.Value);
                        });
                    }
                }

                //isnull and isnotnull fro all type
                if (d.Condition == 'isnull') {
                    d.Value = "";
                    filterArr = filterArr.filter((item) => {
                        return item[d.ColumnName] == null || item[d.ColumnName].toString() == "";
                    });
                }
                else if (d.Condition == 'isnotnull') {
                    d.Value = "";
                    filterArr = filterArr.filter((item) => {
                        return item[d.ColumnName] && item[d.ColumnName].toString() != "";
                    });
                }
            }
        });

        //Main textbox search if values
        if (this.SearchText && filterArr && filterArr.length > 0) {
            let final = [];
            let keys = this.gridfilter.filter(d => d.Is_Visible == true).map(d => { return d.ColumnName });
            for (var j = 0; j < filterArr.length; j++) {
                for (var i = 0; i < keys.length; i++) {
                    if (filterArr[j][keys[i]] && filterArr[j][keys[i]].toString().toLowerCase().indexOf(this.SearchText.toLowerCase()) > -1) {
                        final.push(filterArr[j]);
                        break;
                    }
                }
            }
            filterArr = final;
        }

        this.records = filterArr;
        this.fltrRecords = filterArr;
        let sorttype = this.SortDirection.toLowerCase() === 'asc' ? 'desc' : 'asc';
        this.changeSorting(this.SortField, sorttype, true);//sorting after filter
        this.setPage(1);
    }

    DateChange(instance, filter) {
        filter.Value = instance.target.value;
    }

    RowDbClick(item: any) {
        if (this.Edit && this.service.Account.Is_EditRow_On_DoubleClick) {
            this.editRow.emit(item);
        }
    }
    RowClick(item: any, event: any, index: number) {
        if (this.ShowCheckbox && event.target.type != "checkbox" && event.target.type != "button" && event.target.type != "") {  //add empty condition for not select row when click on subject             
            item.selectedRow = !item.selectedRow;
            this.checkIfAllSelected(event, index, true);//for check all checkbox
        }
        this.isShowfiltermenu = false;
    }

    ViewRow(item: any) {
        this.viewRow.emit(item);
    }
    closeFilterMenu() {
        if (this.isShowfiltermenu) { this.isShowfiltermenu = false; }
    }

    ActionClick(item, action) {
        this.ActionRow.emit({ item: item, action: action });
    }

    //Checkbox
    selectAll() {
        this.pagedItems.map((d: any) => d.selectedRow = this.selectedAll);
    }
    checkIfAllSelected(event: any, index: number, isRowclick: boolean = false) {
        this.selectedAll = this.pagedItems.every((item: any) => {
            return item.selectedRow == true;
        })
    }
    ClearCheckboxSelect() {
        if (this.pagedItems) {
            this.selectedAll = false;
            this.selectAll();
        }
    }

    //pager service
    public maxSize: number = 5;
    getPager(totalItems: number, currentPage: number = 1, pageSize: number = 10) {
        // calculate total pages
        let startPage: number, endPage: number;
        let totalPages = this.calculateTotalPages(totalItems, pageSize);

        let isMaxSized = typeof this.maxSize !== 'undefined' && this.maxSize < totalPages;
        // recompute if maxSize
        if (isMaxSized) {
            // Current page is displayed in the middle of the visible ones
            startPage = Math.max(currentPage - Math.floor(this.maxSize / 2), 1);
            endPage = startPage + this.maxSize - 1;

            // Adjust if limit is exceeded
            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = endPage - this.maxSize + 1;
            }
        }
        else {
            startPage = 1;
            endPage = totalPages;
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control        
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
    public calculateTotalPages(totalItems: number, pageSize: number): number {
        let totalPages = pageSize < 1 ? 1 : Math.ceil(totalItems / pageSize);
        return Math.max(totalPages || 0, 1);
    }

    noPrevious(): boolean {
        return this.pager.currentPage === 1;
    }
    noNext(): boolean {
        return this.pager.currentPage === this.pager.totalPages;
    }
    PageSizeChange(pagesize: string) {
        this.pagesize = this.pager.pageSize = Number(pagesize);
        this.setPage(1);
    }
    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this.ClearCheckboxSelect();//new

        this.pager.currentPage = page;
        this.totalitems = this.records.length;

        this.pager = this.getPager(this.totalitems, page, this.pagesize);
        this.pagedItems = this.records.slice(this.pager.startIndex, this.pager.endIndex + 1);

        this.change.emit(this.pager);
    }
    setPager(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this.pager = this.getPager(this.totalitems, page, this.pagesize);
    }


    //Common Filter
    SearchFilter(input: any) {
        this.Filter();
    }
    //refresh grid
    RefreshGrid() {
        window.setTimeout(() => {
            this.SortField = ""; this.SortDirection = ""; this.SearchText = "";
            this.RefreshTime = this.service.Date_Format(new Date(), "yyyyMMddHHmmss");
            this.setPage(1);
            this.gridfilter.map((d) => { d.Value = ""; d.Condition = ""; });
            this.selectedAll = false;
        }, 300);
    }
    ShowHideColumnFilter(Is_ShowColumnFilter: boolean) {
        this.ShowFilter = Is_ShowColumnFilter;
    }

    trackByMethod(index: number, el: any): number {        
        return index;
    }
}