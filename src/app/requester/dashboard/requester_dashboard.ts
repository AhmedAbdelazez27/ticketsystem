import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SystemService } from '../../shared/SystemService';
import { Dashboard_Summary_Model, ModuleType } from '../../shared/common_model';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    templateUrl: './requester_dashboard.html'
})

export class Requester_DashboardComponent {
    isLoading = false; isLoading_chart = false; model: Dashboard_Summary_Model;
    sub: any; sub1: any;
    pieChartData: any;
    AnnouncementList: Array<any> = [];
    constructor(public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);
    }
    ngOnInit() {
        this.bindData();
        this.sub = this.service.Data.registerReceiver<any>('Get_Notification_Refresh').subscribe((res) => {
            this.bindNotification();
        });
        this.sub1 = this.service.Data.registerReceiver<any>('Get_Language_Refresh').subscribe((res) => {
            this.bindSummaryChart();
        });
    }
    ngOnDestroy() {
        if (this.sub) { this.sub.unsubscribe(); }
        if (this.sub1) { this.sub1.unsubscribe(); }
    }
    async bindData(isRefresh = false) {
        try {
            this.isLoading = true;

            let account = this.service.Account;
            this.model = await this.service.Data.ExecuteAPI_Post<Dashboard_Summary_Model>("Dashboard/Get_Dashboard_Summary", { Is_Agent: account.Is_Agent, Is_Client: account.Is_Client });
            if (this.model) {
                if (this.model.AllTickets > 0) {
                    this.model.AllTickets_percent = 100;
                    this.model.OpenTickets_percent = Math.round(this.model.OpenTickets * 100 / this.model.AllTickets);
                    this.model.ClosedTickets_percent = Math.round(this.model.ClosedTickets * 100 / this.model.AllTickets);
                    this.model.PendingTickets_percent = Math.round(this.model.PendingTickets * 100 / this.model.AllTickets);
                    this.model.UnAssignedTickets_percent = Math.round(this.model.UnAssignedTickets * 100 / this.model.AllTickets);
                    this.model.OverdueTickets_percent = Math.round(this.model.OverdueTickets * 100 / this.model.AllTickets);
                    this.model.DueTodayTickets_percent = Math.round(this.model.DueTodayTickets * 100 / this.model.AllTickets);

                    this.bindSummaryChart();
                }
                else {
                    this.model.AllTickets_percent = 0; this.model.OpenTickets_percent = 0; this.model.ClosedTickets_percent = 0;
                }
            }

            this.bindNotification();

            this.isLoading = false;
        } catch (e) {
            this.isLoading = false;
        }
    }


    @ViewChild("OverviewChart") OverviewChart: BaseChartDirective; OverviewChartData: any;
    OverviewChartLabels: string[] = []; OverviewChartOptions: any = {};
    chart_colors = [];

    bindSummaryChart() {
        if (this.model) {
            this.isLoading_chart = true;
            this.chart_colors.push({
                'backgroundColor': ['#1991EB', '#FF0017', '#fb9678', '#FFC105', '#e83e8c', '#e83e8c']
            });

            this.OverviewChartLabels = [
                this.service.Translator.instant("lblMyOpenTickets"), this.service.Translator.instant("lblMyClosedTickets"), this.service.Translator.instant("lblMyPendingTickets"),
                this.service.Translator.instant("lblMyUnAssignedTickets"), this.service.Translator.instant("lblMyOverdueTickets"), this.service.Translator.instant("lblMyDueTodayTickets")
            ];
            this.OverviewChartData = [{
                data: [this.model.OpenTickets, this.model.ClosedTickets, this.model.PendingTickets, this.model.UnAssignedTickets, this.model.OverdueTickets, this.model.DueTodayTickets]
            }];
            this.OverviewChartOptions = {
                scaleShowVerticalLines: true, responsive: true, maintainAspectRatio: false,
                legend: { position: this.service.Is_RTL() ? 'left' : "right", labels: { fontSize: 14 } },
                pieceLabel: { render: 'value', fontColor: '#fff', fontSize: 13 }
            }

            window.setTimeout(() => { this.isLoading_chart = false; }, 300);
        }
    }

    //Go To Tickets
    GoToTickets(fltype) {
        if (fltype == "all") {
            this.router.navigate(["/requester/ticket"]);
        }
        else {
            this.router.navigate(['/requester/ticket'], { queryParams: { type: fltype } });

        }
    }

    //Search
    Search(type, value) {
        if (value) {
            if (type == ModuleType.ticket) { this.router.navigate(["/requester/ticket"], { queryParams: { search: value } }) }
            else if (type == ModuleType.solution) { this.router.navigate(["/requester/solution"], { queryParams: { search: value } }) }
        }
    }

    //Bind Notification
    async bindNotification() {
        this.AnnouncementList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Admin/Get_AnnouncementList_Client", { Is_Agent: this.service.Account.Is_Agent, Is_Client: true });
    }
}

