import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SystemService } from '../shared/SystemService';
import { KeyValueString, ApiResponse } from '../shared/common_model';
import { AlertType } from '../shared/common_model';

@Component({
    templateUrl: './login.component.html'
})

export class LoginComponent {
    isLoading = false; returnUrl: string; key: string;
    LoginForm: UntypedFormGroup; ForgotPwdForm: UntypedFormGroup;
    LanguageList: Array<KeyValueString> = []; SelectedLang: KeyValueString;
    response: any = {};
    sessionExpirationSeconds: number = 60 * 60;
    IsLoginForm: boolean = true;
    IsForgotPwdForm: boolean = false;

    constructor(public fb: UntypedFormBuilder, public route: ActivatedRoute, public router: Router, public service: SystemService, public location: Location) {
        this.bindLanguages();
        this.service.HasAccountData.then(() => {
            if (this.service.Account.UserID > 0) {
                this.router.navigate(['']);//redirect to dashboard page
            }
        });
        this.initLoginForm();
    }
    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    }
    ngAfterViewInit() {
        if (this.service.Settings.Expiration_Time) { this.sessionExpirationSeconds = this.service.Settings.Expiration_Time * 60; }
    }
    initLoginForm() {
        this.LoginForm = this.fb.group({
            username: ["", Validators.required],
            password: ["", Validators.required],
            language: ["", Validators.required]
        });

        this.ForgotPwdForm = this.fb.group({
            username: ['', Validators.required],
        });

        this.GetDefaultLanguage();
    }
    async bindLanguages() {
        this.LanguageList = await this.service.Get_Languages();
        let lang_storage = localStorage.getItem("lang");
        if (lang_storage) {
            this.SelectedLang = this.LanguageList.find(d => d.Value == lang_storage);
        }
    }
    async GetDefaultLanguage() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<string>("Home/Get_DefaultLang");
            if (res) {
                let lang = res.data;
                let lang_storage = localStorage.getItem("lang");
                
                if (lang_storage) {
                    lang = lang_storage;

                    this.SelectedLang = this.LanguageList.find(d => d.Value == lang);
                    this.service.CL = this.SelectedLang.Value;
                    this.service.Translator.use(this.SelectedLang.Value);
                    localStorage.setItem("lang", this.SelectedLang.Value);
                    this.LoginForm.controls["language"].setValue(this.SelectedLang.Value);
                }
                else {
                    let item = this.LanguageList.find(d => d.Value == lang);
                    this.ChangeLang(item);
                }
            }
        } catch (e) { }
    }

    CheckLogin(type: string) {
        this.service.App.ShowLoader = false;
        if (type == 'login') { this.IsLoginForm = true; this.IsForgotPwdForm = false; }
        else if (type == 'forgotpwd') { this.IsLoginForm = false; this.IsForgotPwdForm = true; }
    }
    async Login() {
        try {
            this.isLoading = true;

            let obj = this.LoginForm.getRawValue();
            let res = await this.service.Data.ExecuteAPI_Post<any>("Login/Login", obj);
            if (res.isSuccess) {                
                let expiration_date = new Date();
                expiration_date.setSeconds(expiration_date.getSeconds() + this.sessionExpirationSeconds);
                this.service.App.setCookie("Bearer", res.data, expiration_date);
                this.service.Data.SetHttpOptions();

                await this.service.loadAccountDetail();
                this.service.Data.ExecuteAPI_Post<any>("Admin/Set_Current_Languages", { lang: this.SelectedLang.Value }).then((res) => { });

                if (this.service.Account.Is_Agent) {
                    if (this.service.Account.Is_Ticket_StartPage) { this.router.navigate(['/ticket']); }
                    else {
                        if (this.returnUrl && this.returnUrl != '' && this.returnUrl != '/') {
                            this.router.navigate([this.returnUrl]);
                        }
                        else { this.router.navigate(['']); }
                    }
                }
                else {
                    if (this.service.Account.Is_Ticket_StartPage) { this.router.navigate(['/requester/ticket']); }
                    else {
                        //redirect to requester dashboard page
                        if (this.returnUrl && this.returnUrl != '' && this.returnUrl != '/') {
                            this.router.navigate([this.returnUrl]);
                        }
                        else { this.router.navigate(['/requester']); }
                    }
                }
            }
            else {
                this.service.showMessage(AlertType.Error, res.msg);
            }
            this.isLoading = false;
        } catch (e) {
            this.isLoading = false;
        }
    }

    async ForgotPassword() {
        try {
            this.isLoading = true;
            let res = await this.service.Data.ExecuteAPI_Post<number>("Home/ForgotPassword", { UserName: this.ForgotPwdForm.value.username, site_url: this.service.Settings.Site_URL });
            if (res != null && res > 0) {
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgResetPasswordSendEmailLink"));
                this.ForgotPwdForm.controls["username"].setValue("");
                this.CheckLogin("login");
            }
            else if (res == -1) {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgUsernameInCorrect"));
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
            }

            this.isLoading = false;
        } catch (e) {
            this.isLoading = false;
        }
    }

    async ChangeLang(item: any) {
        if (this.service.CL != item.Value) {
            let res = await this.service.Data.ExecuteAPI_Get<any>("Home/Get_Translate", { lang: item.Value });
            this.service.Translator.set_data(res);
            //dummy set for reflect new changes            
            this.service.CL = 'dummy';
            //setTimeout(() => { this.service.CL = item.Value; });
        }

        this.SelectedLang = item;
        this.service.CL = this.SelectedLang.Value;
        this.service.Translator.use(this.SelectedLang.Value);
        localStorage.setItem("lang", this.SelectedLang.Value);
        this.LoginForm.controls["language"].setValue(this.SelectedLang.Value);

        setTimeout(() => { this.service.Set_RTL(); })
    }
}