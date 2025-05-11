
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { Solution_ListComponent } from './solution_list';
import { Solution_NewComponent } from './solution_new';
import { Solution_DetailComponent } from './solution_detail';
import { AuthGuard } from '../auth.guard';



const routes: Routes = [
    { path: '', component: Solution_ListComponent, data: { pageProp: 'Show_Solution_Menu' }, canActivate: [AuthGuard] },
    { path: 'add', component: Solution_NewComponent, data: { pageProp: 'Is_Add_Solution' }, canActivate: [AuthGuard] },
    { path: 'detail/:id', component: Solution_DetailComponent, data: { pageProp: 'Is_Edit_Solution' }, canActivate: [AuthGuard]  },
];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
    declarations: [Solution_ListComponent, Solution_NewComponent, Solution_DetailComponent],

})

export class SolutionModule {

}








