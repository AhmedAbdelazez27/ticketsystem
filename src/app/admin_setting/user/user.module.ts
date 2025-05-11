
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { Admin_DashboardComponent } from '../admin_dashboard';
import { UserComponent } from './user';
import { RolesComponent } from './roles';


const routes: Routes = [
    { path: '', component: Admin_DashboardComponent },
    { path: 'user_agent', component: UserComponent },
    { path: 'user_client', component: UserComponent },
    { path: 'user_admin', component: UserComponent },
    { path: 'roles', component: RolesComponent },
];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
    declarations: [Admin_DashboardComponent, UserComponent, RolesComponent],

})

export class UserModule {

}








