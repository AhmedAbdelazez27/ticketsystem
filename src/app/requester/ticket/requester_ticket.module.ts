
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { Requester_Ticket_ListComponent } from './requester_ticket_list';
import { Requester_Ticket_NewComponent } from './requester_ticket_new';
import { Requester_Ticket_DetailComponent } from './requester_ticket_detail';
import { AuthGuard } from '../../auth.guard';



const routes: Routes = [
    { path: '', component: Requester_Ticket_ListComponent, data: { pageProp: 'Show_Ticket_Menu_Client' }, canActivate: [AuthGuard] },
    { path: 'add', component: Requester_Ticket_NewComponent, data: { pageProp: 'Is_Add_Ticket_Client' }, canActivate: [AuthGuard] },
    { path: 'detail/:id', component: Requester_Ticket_DetailComponent, data: { pageProp: 'Is_Edit_Ticket_Client' }, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
    declarations: [Requester_Ticket_ListComponent, Requester_Ticket_NewComponent, Requester_Ticket_DetailComponent],

})

export class Requester_TicketModule {

}








