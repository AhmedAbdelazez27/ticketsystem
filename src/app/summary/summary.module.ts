
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { summaryComponent } from './summary'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { BaseChartDirective } from 'ng2-charts';


const routes: Routes = [
    { path: '', component: summaryComponent }

];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule,

        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,

        BaseChartDirective
    ],
    declarations: [summaryComponent],

})

export class SummaryModule {

}








