
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { Ticket_ListComponent } from './ticket_list';
import { Ticket_NewComponent } from './ticket_new';
import { Ticket_DetailComponent } from './ticket_detail';
import { AuthGuard } from '../auth.guard';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';


const routes: Routes = [
    { path: '', component: Ticket_ListComponent, data: { pageProp: 'Show_Ticket_Menu' }, canActivate: [AuthGuard] },
    { path: 'add', component: Ticket_NewComponent, data: { pageProp: 'Is_Add_Ticket' }, canActivate: [AuthGuard] },
    { path: 'detail/:id', component: Ticket_DetailComponent, data: { pageProp: 'Is_Edit_Ticket' }, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule,

        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,

    ],
    declarations: [Ticket_ListComponent, Ticket_NewComponent, Ticket_DetailComponent],

})

export class TicketModule {

}








