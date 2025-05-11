import { Component, ViewChild } from '@angular/core';
import { SystemService } from '../shared/SystemService';
import { GridFilter } from '../shared/common_model';
import { BaseChartDirective } from 'ng2-charts';
import { FlatpickrOptions } from 'ng2-flatpickr';

@Component({
    templateUrl: './summary.html'
})

export class summaryComponent {
    isLoading = false; fixBarColors = this.service.Get_FixBarColors();
    account = this.service.Account;
    constructor(public service: SystemService) {
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblName", ColumnName: "Name", Type: "string", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblOpen", ColumnName: "OpenTickets", Type: "number", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblCompleted", ColumnName: "ClosedTickets", Type: "number", Is_Visible: true });
        this.gridFilter.push(<GridFilter>{ DisplayText: "lblOverDue", ColumnName: "OverDueTickets", Type: "number", Is_Visible: true });

        var cdt = new Date(); cdt.setMonth(cdt.getMonth() - 1);
        this.fromDt_type = this.fromDt_OpT_type = this.service.Date_Format(cdt, 'yyyy-MM-dd');
        this.toDt_type = this.toDt_OpT_type = this.service.Date_Format(new Date(), 'yyyy-MM-dd');
    }
    ngOnInit() {
        this.bindTicketCount_ByType();//1. TicketCount_ByType        
        this.bindTicketSummary_ByType();//2. Ticket Summary        
        this.bindTicketReceived_ByDays();//3. Ticket Received Last Days        
        this.bindTicketClosed_ByDays();//4. Ticket Closed Last Days        
        this.bindOpenTicket_ByType();//5. Open Ticket By Type

        window.setTimeout(() => { this.SetDateOptions(); }, 10);//Date Configs
        this.account = this.service.Account;
    }
    SetDateOptions() {
        //1. TicketCount_ByType
        this.stDate_Req_By.flatpickr.setDate(this.fromDt_type);
        this.stDate_Req_By.flatpickr.set("onChange", (dtarr, dt, instance) => {
            this.fromDt_type = dt;
            this.bindTicketCount_ByType(true);
        });
        this.edDate_Req_By.flatpickr.setDate(this.toDt_type);
        this.edDate_Req_By.flatpickr.set("onChange", (dtarr, dt, instance) => {
            this.toDt_type = dt;
            this.bindTicketCount_ByType(true);
        });

        //5. Open Ticket By Type
        this.stDate_OpT.flatpickr.setDate(this.fromDt_OpT_type);
        this.stDate_OpT.flatpickr.set("onChange", (dtarr, dt, instance) => {
            this.fromDt_OpT_type = dt;
            this.bindOpenTicket_ByType();
        });
        this.edDate_OpT.flatpickr.setDate(this.toDt_OpT_type);
        this.edDate_OpT.flatpickr.set("onChange", (dtarr, dt, instance) => {
            this.toDt_OpT_type = dt;
            this.bindOpenTicket_ByType();
        });

    }


    //1. TicketCount_ByType
    dtStart_Req_By_Config: FlatpickrOptions = this.service.CommonDateConfig(); dtEnd_Req_By_Config: FlatpickrOptions = this.service.CommonDateConfig();
    @ViewChild('stDate_Req_By') stDate_Req_By; @ViewChild('edDate_Req_By') edDate_Req_By;
    lst_TicketCount_ByType_Model: Array<TicketCount_ByType_Model> = []; ddlRequestType: string = "Agent";
    gridFilter: Array<GridFilter> = []; fromDt_type: string; toDt_type: string;
    async bindTicketCount_ByType(isRefresh = false) {
        try {
            this.isLoading = true;
            this.lst_TicketCount_ByType_Model = await this.service.Data.ExecuteAPI_Post<Array<TicketCount_ByType_Model>>(
                "Summary/Get_TicketCount_ByType", {
                Is_Agent: this.account.Is_Agent, Is_Client: this.account.Is_Client, Type: this.ddlRequestType, FromDate: this.fromDt_type, ToDate: this.toDt_type
            });

            if (isRefresh) { this.service.App.refreshGrid.emit(); }

            this.isLoading = false;
        } catch (e) { this.isLoading = false; }
    }
    ddlRequestType_Change() {
        this.bindTicketCount_ByType(true);
    }


    //2. Ticket Summary
    isLoading_summary = false;
    lst_TicketSummary_ByType_Model: Array<TicketCount_ByType_Model> = []; ddlTicketSummary: string = "thisweek";
    ddlChartSummary: string = "column2d";

    chartType: any = "ColumnChart"; isStacked = false; is3D = false;

    @ViewChild("columnChart") columnChart: BaseChartDirective;
    ColumnChartLabels: string[] = []; columnChartOptions: any = {}; columnChartLegend: boolean = true;


    ColumnChartData: any;
    async bindTicketSummary_ByType() {
        try {
            this.isLoading_summary = true;
            this.lst_TicketSummary_ByType_Model = await this.service.Data.ExecuteAPI_Post<Array<TicketCount_ByType_Model>>(
                "Summary/Get_TicketSummary_ByType", {
                Is_Agent: this.account.Is_Agent, Is_Client: this.account.Is_Client, Type: this.ddlTicketSummary
            });
            this.DrawChart(this.ddlChartSummary);
            this.isLoading_summary = false;

        } catch (e) { this.isLoading_summary = false; }
    }
    ddlTicketSummary_Change() {
        this.bindTicketSummary_ByType();
    }
    ddlChartSummary_Change() {
        this.DrawChart(this.ddlChartSummary);
    }

    DrawChart(ddltype) {
        this.isStacked = false;
        if (ddltype == 'column2d') { this.chartType = "bar"; }
        else if (ddltype == 'stackedcolumn2d') { this.chartType = "bar"; this.isStacked = true; }
        else if (ddltype == 'bar2d') { this.chartType = "horizontalBar"; }
        else if (ddltype == 'stackedbar2d') { this.chartType = "horizontalBar"; this.isStacked = true; }
        else if (ddltype == 'line') { this.chartType = "line"; }
        else if (ddltype == 'radar') { this.chartType = "radar"; }

        this.ColumnChartLabels = this.lst_TicketSummary_ByType_Model.map(d => d.Name);
        if (this.chartType == "radar") {
            this.columnChartOptions = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                tooltips: { mode: 'index', intersect: true },
            }
        }
        else {
            this.columnChartOptions = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                scales: {
                    xAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked }],
                    yAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked }]
                },
                tooltips: { mode: 'index', intersect: true },
            };
        }
        this.ColumnChartData = [
            { data: this.lst_TicketSummary_ByType_Model.map(d => d.ReceivedTickets), fill: false, label: this.service.Translator.instant("lblReceived") },
            { data: this.lst_TicketSummary_ByType_Model.map(d => d.ClosedTickets), fill: false, label: this.service.Translator.instant("lblClosed") },
            { data: this.lst_TicketSummary_ByType_Model.map(d => d.OverDueTickets), fill: false, label: this.service.Translator.instant("lblOverDue") }
        ];

        //For Refresh Chart
        if (this.columnChart && this.columnChart.chart) {
            this.columnChart.ngOnDestroy();
            //this.columnChart.chartType = this.chartType;
            this.columnChart.labels = this.ColumnChartLabels;
            this.columnChart.options = this.columnChartOptions;
            //this.columnChart.chart = this.columnChart.getChartBuilder(this.columnChart.ctx);
        }
    }

    //3 Ticket Received Last Days
    TicketReceivedChartData: any; TicketClosedChartData: any;
    isLoading_Received = false; ddlReceived_Days: number = 10; lst_TicketReceived_ByDays_Model: Array<TicketReceived_ByDays_Model> = [];
    isStacked_Received = false; chartType_Received: any = "ColumnChart"; ddlChartType_Received: string = "column2d";

    @ViewChild("columnChart_Received") columnChart_Received: BaseChartDirective;
    ColumnChartLabels_Received: string[] = []; columnChartOptions_Received: any = {}; columnChartLegend_Received: boolean = true;

    async bindTicketReceived_ByDays() {
        try {
            this.isLoading_Received = true;
            this.lst_TicketReceived_ByDays_Model = await this.service.Data.ExecuteAPI_Post<Array<TicketReceived_ByDays_Model>>(
                "Summary/Get_TicketReceived_ByDays", {
                Is_Agent: this.account.Is_Agent, Is_Client: this.account.Is_Client, Type: "open", Days: this.ddlReceived_Days
            });
            this.DrawChartReceived_ByDays(this.ddlChartType_Received);
            this.isLoading_Received = false;

        } catch (e) { this.isLoading_Received = false; }
    }
    ddlReceived_Days_Change() {
        this.bindTicketReceived_ByDays();
    }
    ddlChartReceived_Days_Change() {
        this.DrawChartReceived_ByDays(this.ddlChartType_Received);
    }
    DrawChartReceived_ByDays(ddltype) {
        this.isStacked_Received = false;
        if (ddltype == 'column2d') { this.chartType_Received = "bar"; }
        else if (ddltype == 'stackedcolumn2d') { this.chartType_Received = "bar"; this.isStacked_Received = true; }
        else if (ddltype == 'bar2d') { this.chartType_Received = "horizontalBar"; }
        else if (ddltype == 'stackedbar2d') { this.chartType_Received = "horizontalBar"; this.isStacked_Received = true; }
        else if (ddltype == 'line') { this.chartType_Received = "line"; }
        else if (ddltype == 'radar') { this.chartType_Received = "radar"; }

        this.ColumnChartLabels_Received = this.lst_TicketReceived_ByDays_Model.map(d => d.DayNo.toString());
        this.TicketReceivedChartData = [
            { data: this.lst_TicketReceived_ByDays_Model.map(d => d.ViolatedTickets), fill: false, label: this.service.Translator.instant("lblViolated") },
            { data: this.lst_TicketReceived_ByDays_Model.map(d => d.NonViolatedTickets), fill: false, label: this.service.Translator.instant("lblNonViolated") }
        ];
        if (this.chartType_Received == "radar") {
            this.columnChartOptions_Received = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                tooltips: { mode: 'index', intersect: true },
            }
        }
        else {
            this.columnChartOptions_Received = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                scales: {
                    xAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked_Received }],
                    yAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked_Received }]
                },
                tooltips: { mode: 'index', intersect: true },
            };
        }
        //For Refresh Chart
        if (this.columnChart_Received && this.columnChart_Received.chart) {
            this.columnChart_Received.ngOnDestroy();
            //this.columnChart_Received.chartType = this.chartType_Received;
            this.columnChart_Received.labels = this.ColumnChartLabels_Received;
            this.columnChart_Received.options = this.columnChartOptions_Received;
            //this.columnChart_Received.chart = this.columnChart_Received.getChartBuilder(this.columnChart_Received.ctx);
        }
    }


    //4. Ticket Closed Last Days
    isLoading_Closed = false; ddlClosed_Days: number = 10; lst_TicketClosed_ByDays_Model: Array<TicketReceived_ByDays_Model> = [];
    isStacked_Closed = false; chartType_Closed: any = "ColumnChart"; ddlChartType_Closed: string = "column2d";

    @ViewChild("columnChart_Closed") columnChart_Closed: BaseChartDirective;
    ColumnChartLabels_Closed: string[] = []; columnChartOptions_Closed: any = {}; columnChartLegend_Closed: boolean = true;

    async bindTicketClosed_ByDays() {
        try {
            this.isLoading_Closed = true;
            this.lst_TicketClosed_ByDays_Model = await this.service.Data.ExecuteAPI_Post<Array<TicketReceived_ByDays_Model>>(
                "Summary/Get_TicketClosed_ByDays", {
                Is_Agent: this.account.Is_Agent, Is_Client: this.account.Is_Client, Type: "closed", Days: this.ddlClosed_Days
            });
            this.DrawChartClosed_ByDays(this.ddlChartType_Closed);
            this.isLoading_Closed = false;

        } catch (e) { this.isLoading_Closed = false; }
    }
    ddlClosed_Days_Change() {
        this.bindTicketClosed_ByDays();
    }
    ddlChartClosed_Days_Change() {
        this.DrawChartClosed_ByDays(this.ddlChartType_Closed);
    }
    DrawChartClosed_ByDays(ddltype) {
        this.isStacked_Closed = false;
        if (ddltype == 'column2d') { this.chartType_Closed = "bar"; }
        else if (ddltype == 'stackedcolumn2d') { this.chartType_Closed = "bar"; this.isStacked_Closed = true; }
        else if (ddltype == 'bar2d') { this.chartType_Closed = "horizontalBar"; }
        else if (ddltype == 'stackedbar2d') { this.chartType_Closed = "horizontalBar"; this.isStacked_Closed = true; }
        else if (ddltype == 'line') { this.chartType_Closed = "line"; }
        else if (ddltype == 'radar') { this.chartType_Closed = "radar"; }

        this.ColumnChartLabels_Closed = this.lst_TicketClosed_ByDays_Model.map(d => d.DayNo.toString());
        this.TicketClosedChartData = [
            { data: this.lst_TicketClosed_ByDays_Model.map(d => d.ViolatedTickets), fill: false, label: this.service.Translator.instant("lblViolated") },
            { data: this.lst_TicketClosed_ByDays_Model.map(d => d.NonViolatedTickets), fill: false, label: this.service.Translator.instant("lblNonViolated") }
        ];
        if (this.chartType_Closed == "radar") {
            this.columnChartOptions_Closed = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                tooltips: { mode: 'index', intersect: true },
            }
        }
        else {
            this.columnChartOptions_Closed = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                scales: {
                    xAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked_Closed }],
                    yAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked_Closed }]
                },
                tooltips: { mode: 'index', intersect: true },
            };
        }
        //For Refresh Chart
        if (this.columnChart_Closed && this.columnChart_Closed.chart) {
            this.columnChart_Closed.ngOnDestroy();
            //this.columnChart_Closed.chartType = this.chartType_Closed;
            this.columnChart_Closed.labels = this.ColumnChartLabels_Closed;
            this.columnChart_Closed.options = this.columnChartOptions_Closed;
            //this.columnChart_Closed.chart = this.columnChart_Closed.getChartBuilder(this.columnChart_Closed.ctx);
        }
    }


    //5. Open Ticket By Type
    dtStart_OpT_Config: FlatpickrOptions = this.service.CommonDateConfig(); dtEnd_OpT_Config: FlatpickrOptions = this.service.CommonDateConfig();
    @ViewChild('stDate_OpT') stDate_OpT; @ViewChild('edDate_OpT') edDate_OpT;
    isLoading_OpTicket = false; lst_OpenTicket_ByType_Model: Array<OpenTicket_ByType_Model> = []; ddlOpenTicketType: string = "Status";
    fromDt_OpT_type: string; toDt_OpT_type: string; chartType_OpenTicket: any; ddlChartOpenTicket: string = "pie";
    OpenTicketChartData: any; isStacked_OpenTicket = false;

    @ViewChild("OpenTicketChart") OpenTicketChart: BaseChartDirective;
    OpenTicketChartLabels: string[] = []; OpenTicketChartOptions: any = {}; OpenTicketChartLegend: boolean = true;

    async bindOpenTicket_ByType() {
        try {
            this.isLoading_OpTicket = true;
            this.lst_OpenTicket_ByType_Model = await this.service.Data.ExecuteAPI_Post<Array<OpenTicket_ByType_Model>>(
                "Summary/Get_OpenTicket_ByType", {
                Is_Agent: this.account.Is_Agent, Is_Client: this.account.Is_Client, Type: this.ddlOpenTicketType, FromDate: this.fromDt_OpT_type, ToDate: this.toDt_OpT_type
            });
            if (this.lst_OpenTicket_ByType_Model.length > 1) {
                this.DrawChartOpenTicket_ByType(this.ddlChartOpenTicket);
            }
            this.isLoading_OpTicket = false;
        } catch (e) { this.isLoading_OpTicket = false; }
    }
    ddlOpenTicketType_Change() {
        this.bindOpenTicket_ByType();
    }
    ddlChartOpenTicket_Change() {
        this.DrawChartOpenTicket_ByType(this.ddlChartOpenTicket);
    }
    DrawChartOpenTicket_ByType(ddltype) {
        if (ddltype == 'pie') { this.chartType_OpenTicket = "pie"; }
        if (ddltype == 'pie3d') { this.chartType_OpenTicket = "pie"; }
        else if (ddltype == 'donut') { this.chartType_OpenTicket = "doughnut"; }
        else if (ddltype == 'column2d') { this.chartType_OpenTicket = "bar"; }
        else if (ddltype == 'bar2d') { this.chartType_OpenTicket = "horizontalBar"; }
        else if (ddltype == 'line') { this.chartType_OpenTicket = "line"; }
        else if (ddltype == 'radar') { this.chartType_OpenTicket = "radar"; }

        this.OpenTicketChartLabels = this.lst_OpenTicket_ByType_Model.map(d => d.Name);
        this.OpenTicketChartData = [{ data: this.lst_OpenTicket_ByType_Model.map(d => d.Count), fill: false, label: this.service.Translator.instant("lblCount") }];

        if (this.chartType_OpenTicket == "radar" || this.chartType_OpenTicket == "pie" || this.chartType_OpenTicket == "doughnut") {
            this.OpenTicketChartOptions = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: this.service.Is_RTL() ? 'left' : "right", labels: { fontSize: 14 } },
                pieceLabel: { render: 'value', fontColor: '#fff', fontSize: 13 }
            }
        }
        else {
            this.OpenTicketChartData[0]['barThickness'] = 20;
            this.OpenTicketChartOptions = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: "bottom", labels: { fontSize: 14 } },
                scales: {
                    xAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked_OpenTicket }],
                    yAxes: [{ ticks: { beginAtZero: true }, stacked: this.isStacked_OpenTicket }]
                },
                pieceLabel: { render: 'value', fontColor: '#fff', fontSize: 13 }
            };
        }
        //For Refresh Chart
        if (this.OpenTicketChart && this.OpenTicketChart.chart) {
            this.OpenTicketChart.ngOnDestroy();
            //this.OpenTicketChart.chartType = this.chartType_OpenTicket;
            this.OpenTicketChart.labels = this.OpenTicketChartLabels;
            this.OpenTicketChart.options = this.OpenTicketChartOptions;
            //this.OpenTicketChart.chart = this.OpenTicketChart.getChartBuilder(this.OpenTicketChart.ctx);
        }
    }
}

interface TicketCount_ByType_Model {
    Name: string;
    OpenTickets: number;
    ReceivedTickets: number;
    ClosedTickets: number;
    OverDueTickets: number;
}
interface OpenTicket_ByType_Model {
    Name: string;
    Count: number;
}
interface TicketReceived_ByDays_Model {
    DayNo: number;
    ViolatedTickets: number;
    NonViolatedTickets: number;
}