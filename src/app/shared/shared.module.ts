import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ModalDialog } from './modal.dialog';
import { ColorPickerModule } from 'ngx-color-picker';

import { SystemService } from './SystemService'
import { TranslateService } from './Translate/translate.service'
import { TranslatePipe } from './Translate/translate.pipe';
import { TRANSLATION_PROVIDERS } from './Translate/translations';

import { FilterArrayPipe, FilterArrayObjectPipe, SumPipe, SafeHtmlPipe, fileTypePipe } from './array.pipe'; // convert object to array pipe
import { NumberOnly, FocusInvalidDirective } from './app.directive';

import { commongrid_Component } from './grid/commongrid';
import { ticket_commongrid_Component } from './grid/ticket_commongrid';

//common page
import { User_Technician_ListComponent } from '../admin_setting/user/user_technician_list';
import { Change_PasswordComponent } from '../admin_setting/user/change_password';
import { Announcement_ViewComponent } from '../dashboard/announcement_view';
import { Row_ViewComponent } from '../dashboard/row_view';
import { Solution_Find_ListComponent } from '../solution/solution_find_list';


//import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AlertComponent } from './alert';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

// import { TooltipModule } from 'ng2-tooltip-directive';
// import { TooltipOptions } from 'ng2-tooltip-directive';
// export const MyDefaultTooltipOptions: TooltipOptions = {
//     'show-delay': 300,
//     'placement': 'top',
//     'theme' : 'light'
// }


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,

        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule

        //ColorPickerModule, ChartsModule, Ng2FlatpickrModule, TypeaheadModule.forRoot(),
        //    TooltipModule.forRoot(MyDefaultTooltipOptions as TooltipOptions)
    ],
    declarations: [TranslatePipe, AlertComponent, ModalDialog, FilterArrayPipe, FilterArrayObjectPipe, SumPipe, SafeHtmlPipe, fileTypePipe, NumberOnly, FocusInvalidDirective, commongrid_Component, ticket_commongrid_Component,
        User_Technician_ListComponent, Change_PasswordComponent, Announcement_ViewComponent, Row_ViewComponent, Solution_Find_ListComponent
    ],
    exports: [FormsModule, ReactiveFormsModule, TranslatePipe, AlertComponent, ModalDialog, FilterArrayPipe, FilterArrayObjectPipe, SumPipe, SafeHtmlPipe, fileTypePipe,
        ColorPickerModule, //ChartsModule, Ng2FlatpickrModule, TypeaheadModule,//TooltipModule,
        NumberOnly, FocusInvalidDirective, commongrid_Component, ticket_commongrid_Component,
        User_Technician_ListComponent, Change_PasswordComponent, Announcement_ViewComponent, Row_ViewComponent, Solution_Find_ListComponent
    ],
})

export class SharedModule {
    static forRoot(): ModuleWithProviders<any> {
        return {
            ngModule: SharedModule,
            providers: [SystemService, TranslateService, TRANSLATION_PROVIDERS]
        };
    }
}