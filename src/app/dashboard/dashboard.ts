import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SystemService } from '../shared/SystemService';
import { Dashboard_Summary_Model } from '../shared/common_model';
import { BaseChartDirective } from 'ng2-charts';
import 'chart.piecelabel.js';

@Component({
    selector: 'app',
    templateUrl: './dashboard.html'
})

export class DashboardComponent {
    isLoading = false; isLoading_announcement = false;
    sub: any; sub1: any;
    model: Dashboard_Summary_Model;
    pieChartData: any;
    public AnnouncementList: Array<any> = [];
    constructor(public service: SystemService, public router: Router) {
        this.service.GoTo_ScrollTop(window);
        this.service.HasAccountData.then(() => {
            if (!this.service.Account.Is_Agent) {
                this.router.navigate(['/requester']);//redirect to requester dashboard page
            }
        });
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

            this.model = await this.service.Data.ExecuteAPI_Post<any>("Dashboard/Get_Dashboard_Summary", { Is_Agent: this.service.Account.Is_Agent, Is_Client: this.service.Account.Is_Client });
            this.isLoading = false;
            if (this.model.AllTickets > 0) {
                this.model.AllTickets_percent = 100;
                this.model.OpenTickets_percent = Math.round(this.model.OpenTickets * 100 / this.model.AllTickets);
                this.model.ClosedTickets_percent = Math.round(this.model.ClosedTickets * 100 / this.model.AllTickets);
                this.model.PendingTickets_percent = Math.round(this.model.PendingTickets * 100 / this.model.AllTickets);
                this.model.UnAssignedTickets_percent = Math.round(this.model.UnAssignedTickets * 100 / this.model.AllTickets);
                this.model.OverdueTickets_percent = Math.round(this.model.OverdueTickets * 100 / this.model.AllTickets);
                this.model.DueTodayTickets_percent = Math.round(this.model.DueTodayTickets * 100 / this.model.AllTickets);
                this.model.AssignedToMeTickets_percent = Math.round(this.model.AssignedToMeTickets * 100 / this.model.AllTickets);

                this.bindSummaryChart();
            }
            else {
                this.model.AllTickets_percent = 0; this.model.OpenTickets_percent = 0; this.model.ClosedTickets_percent = 0;
                this.model.PendingTickets_percent = 0; this.model.UnAssignedTickets_percent = 0; this.model.OverdueTickets_percent = 0;
                this.model.DueTodayTickets_percent = 0; this.model.AssignedToMeTickets_percent = 0;
            }

            this.bindNotification();

        } catch (e) { this.isLoading = false; }
    }

    isLoading_chart = false;

    @ViewChild("OverviewChart") OverviewChart: BaseChartDirective; OverviewChartData: any;
    OverviewChartLabels: string[] = []; OverviewChartOptions: any = {};
    chart_colors = [];

    bindSummaryChart() {
        if (this.model) {
            this.isLoading_chart = true;
            this.chart_colors.push({ 'backgroundColor': ['#1991EB', '#FF0017', '#fb9678', '#FFC105', '#e83e8c', '#e83e8c', '#745af2'] });

            this.OverviewChartLabels = [
                this.service.Translator.instant("lblOpenTickets"), this.service.Translator.instant("lblClosedTickets"), this.service.Translator.instant("lblPendingTickets"),
                this.service.Translator.instant("lblUnAssignedTickets"), this.service.Translator.instant("lblOverdueTickets"), this.service.Translator.instant("lblDueTodayTickets"),
                this.service.Translator.instant("lblAssignedToMeTickets")
            ];
            this.OverviewChartData = [{
                data: [this.model.OpenTickets, this.model.ClosedTickets, this.model.PendingTickets, this.model.UnAssignedTickets, this.model.OverdueTickets,
                this.model.DueTodayTickets, this.model.AssignedToMeTickets]
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
        if (fltype == "all") { this.router.navigate(["/ticket"]); }
        else { this.router.navigate(['/ticket'], { queryParams: { type: fltype } }); }
    }

    //Bind Notification
    async bindNotification() {
        this.AnnouncementList = await this.service.Data.ExecuteAPI_Post<any>("Admin/Get_AnnouncementList_Client", { Is_Agent: this.service.Account.Is_Agent, Is_Client: true });
    }

}
