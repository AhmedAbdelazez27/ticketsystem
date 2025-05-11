
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { Agent_SettingComponent } from './agent_setting';
import { Client_SettingComponent } from './client_setting';
import { App_SettingComponent } from './app_setting';
import { Tech_AutoassignComponent } from './tech_autoassign';

const routes: Routes = [
    { path: 'agent_setting', component: Agent_SettingComponent },
    { path: 'client_setting', component: Client_SettingComponent },
    { path: 'app_setting', component: App_SettingComponent },
    { path: 'tech_autoassign', component: Tech_AutoassignComponent },

];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
    declarations: [Agent_SettingComponent, Client_SettingComponent, App_SettingComponent, Tech_AutoassignComponent],

})

export class GeneralModule {

}








