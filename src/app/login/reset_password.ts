import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SystemService } from '../shared/SystemService';

import { PasswordValidation } from '../shared/array.pipe';
import { AlertType } from '../shared/common_model';


@Component({
    templateUrl: './reset_password.html'
})

export class Reset_PasswordComponent {
    isLoading = false; returnUrl: string;
    ResetPasswordForm: UntypedFormGroup;
    public key: string;
    public UserName: string; public Email: string;

    constructor(public fb: UntypedFormBuilder, public route: ActivatedRoute, public router: Router, public service: SystemService, public location: Location) {

        this.route.params.subscribe((params: Params) => {
            this.key = params['key'];
            this.service.ClearToken();
        });
        if (!this.key) {
            this.service.logOut();
        }
        this.initForm();
    }
    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    }
    async initForm() {
        this.ResetPasswordForm = this.fb.group({
            password: ["", Validators.required],
            confirmPassword: ["", Validators.required]
        }, {
            validator: PasswordValidation.MatchPassword // your validation method
        });

        try {
            //For Check Mail Reset Password And descypt Key
            if (this.key) {
                this.isLoading = true;
                let res = await this.service.Data.ExecuteAPI_Post<any>("Home/Decrypt_ForgotPassword", { Key: this.key });
                this.isLoading = false;
                if (res && res.isSuccess) {
                    let str = res.data.split("||");
                    this.UserName = str[0];
                    this.Email = str[1];
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                    this.router.navigate(["/login"]);
                }
            }

        } catch (e) {
            this.isLoading = false;
        }
    }

    async ResetPassword() {
        try {
            if (this.UserName) {
                this.isLoading = true;

                let res = await this.service.Data.ExecuteAPI_Post<number>("Home/ResetPassword", { UserName: this.UserName, Email: this.Email, Password: this.ResetPasswordForm.value.password });
                if (res && res > 0) {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgPasswordReseted"));
                    this.router.navigate(["/login"]);
                }
                else if (res == -1) {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgUsernameInCorrectContactAdministrator"));
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }

                this.isLoading = false;
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgUsernameNotExistsInSystem"));
            }

        } catch (e) {
            this.isLoading = false;
        }
    }

}
