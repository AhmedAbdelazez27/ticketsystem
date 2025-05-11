
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { Outgoing_ServerComponent } from './outgoing_server';

const routes: Routes = [
    { path: 'outgoing_server', component: Outgoing_ServerComponent }, 
];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
    declarations: [Outgoing_ServerComponent],

})

export class MailSettingModule {

}








