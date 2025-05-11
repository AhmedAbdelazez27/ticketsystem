import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { LocationStrategy, PathLocationStrategy } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "./shared/shared.module";

//Layout
import { SidenavComponent } from "./layout/sidenav";
import { HeaderComponent } from "./layout/header";
import { FooterComponent } from "./layout/footer";

//services
import { SystemService } from "./shared/SystemService";

//Routes
import { routes } from "./app.route";

//Component
import { AuthGuard } from "./auth.guard";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./dashboard/dashboard";
import { Requester_DashboardComponent } from "./requester/dashboard/requester_dashboard";

import { Requester_ProfileComponent } from "./requester/profile/requester_profile";

import { LoginComponent } from "./login/login.component";
import { Reset_PasswordComponent } from "./login/reset_password";
import { PageNotFoundComponent } from "./not-found.component";

import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MAT_DATE_FORMATS, MatNativeDateModule } from "@angular/material/core";
import { BaseChartDirective } from "ng2-charts";

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthDayA11yLabel: "MMM DD",
  },
};

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    DashboardComponent,
    Requester_DashboardComponent,
    Reset_PasswordComponent,
    PageNotFoundComponent,
    Requester_ProfileComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule.forRoot(),

    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    BaseChartDirective,
  ],

  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },

    AuthGuard,
    SystemService, // without # url comes which is support html5 browser
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
