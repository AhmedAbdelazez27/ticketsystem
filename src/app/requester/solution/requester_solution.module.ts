
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { Requester_Solution_ListComponent } from './requester_solution_list';
import { AuthGuard } from '../../auth.guard';



const routes: Routes = [
    { path: '', component: Requester_Solution_ListComponent, data: { pageProp: 'Show_Solution_Menu_Client' }, canActivate: [AuthGuard]  },
];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
    declarations: [Requester_Solution_ListComponent],

})

export class Requester_SolutionModule {

}








