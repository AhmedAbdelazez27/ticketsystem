import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard'

import { DashboardComponent } from './dashboard/dashboard';
import { Requester_DashboardComponent } from './requester/dashboard/requester_dashboard';
import { LoginComponent } from './login/login.component';
import { Reset_PasswordComponent } from './login/reset_password';
import { PageNotFoundComponent } from './not-found.component';

import { Requester_ProfileComponent } from './requester/profile/requester_profile';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'reset_password/:key', component: Reset_PasswordComponent },
    { path: '', component: DashboardComponent, canActivate: [AuthGuard] },

    { path: 'ticket', loadChildren: () => import('./ticket/ticket.module').then(m => m.TicketModule), data: { pageProp: 'Show_Ticket_Menu' }, canActivate: [AuthGuard] },
    { path: 'solution', loadChildren: () => import('./solution/solution.module').then(m => m.SolutionModule), data: { pageProp: 'Show_Solution_Menu' }, canActivate: [AuthGuard] },
    { path: 'summary', loadChildren: () => import('./summary/summary.module').then(m => m.SummaryModule), data: { pageProp: 'Show_Summary_Menu' }, canActivate: [AuthGuard] },

    //requester
    { path: 'requester', component: Requester_DashboardComponent, canActivate: [AuthGuard] },
    { path: 'requester/profile', component: Requester_ProfileComponent, data: { pageProp: 'Is_Profile_Visible_Client' }, canActivate: [AuthGuard] },
    { path: 'requester/ticket', loadChildren: () => import('./requester/ticket/requester_ticket.module').then(m => m.Requester_TicketModule), data: { pageProp: 'Show_Ticket_Menu_Client' }, canActivate: [AuthGuard] },
    { path: 'requester/solution', loadChildren: () => import('./requester/solution/requester_solution.module').then(m => m.Requester_SolutionModule), data: { pageProp: 'Show_Solution_Menu_Client' }, canActivate: [AuthGuard] },

    //Admin
    { path: 'admin/basic', loadChildren: () => import('./admin_setting/basic/basic.module').then(m => m.BasicModule), data: { pageProp: 'Show_Admin_Menu' }, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: () => import('./admin_setting/user/user.module').then(m => m.UserModule), data: { pageProp: 'Show_Admin_Menu' }, canActivate: [AuthGuard] },
    { path: 'admin/general', loadChildren: () => import('./admin_setting/general/general.module').then(m => m.GeneralModule), data: { pageProp: 'Show_Admin_Menu' }, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: () => import('./admin_setting/branding/branding.module').then(m => m.BrandingModule), data: { pageProp: 'Show_Admin_Menu' }, canActivate: [AuthGuard] },
    { path: 'admin/mail', loadChildren: () => import('./admin_setting/mailsetting/mailsetting.module').then(m => m.MailSettingModule), data: { pageProp: 'Show_Admin_Menu' }, canActivate: [AuthGuard] },
        
    { path: '**', component: PageNotFoundComponent }
];


