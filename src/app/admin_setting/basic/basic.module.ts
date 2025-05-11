
import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { Request_TypeComponent } from './request_type';
import { CategoryComponent } from './category';
import { SubCategoryComponent } from './subcategory';
import { ItemComponent } from './item';
import { StatusComponent } from './status';
import { DepartmentComponent } from './department';
import { ImpactComponent } from './impact';
import { LevelComponent } from './level';

import { PriorityComponent } from './priority';
import { LocationComponent } from './location';
import { UrgencyComponent } from './urgency';
import { NotificationComponent } from './notification';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';



const routes: Routes = [
    { path: 'request_type', component: Request_TypeComponent },
    { path: 'category', component: CategoryComponent },
    { path: 'subcategory', component: SubCategoryComponent },
    { path: 'item', component: ItemComponent },
    { path: 'status', component: StatusComponent },
    { path: 'department', component: DepartmentComponent },
    { path: 'impact', component: ImpactComponent },
    { path: 'level', component: LevelComponent },
    { path: 'priority', component: PriorityComponent },
    { path: 'location', component: LocationComponent },
    { path: 'urgency', component: UrgencyComponent },
    { path: 'notification', component: NotificationComponent },

];
@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule

    ],
    declarations: [Request_TypeComponent, CategoryComponent, SubCategoryComponent, ItemComponent, StatusComponent, DepartmentComponent, ImpactComponent, LevelComponent, PriorityComponent,
        LocationComponent, UrgencyComponent, NotificationComponent],

})

export class BasicModule {

}








