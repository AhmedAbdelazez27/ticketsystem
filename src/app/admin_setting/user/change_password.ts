import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { Location } from '@angular/common';
import { UntypedFormBuilder, NgForm, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SystemService } from '../../shared/SystemService';

import { PasswordValidation } from '../../shared/array.pipe';
import { ModalDialog } from '../../shared/modal.dialog';
import { AlertType } from '../../shared/common_model';

@Component({
    selector: 'change-password',
    templateUrl: './change_password.html'
})

export class Change_PasswordComponent {
    isLoading = false; returnUrl: string;
    ChangePasswordForm: UntypedFormGroup;
    public UserName: string;
    @Output('onSave') public onSave: EventEmitter<any> = new EventEmitter();
    @ViewChild('f') form: NgForm;
    @ViewChild("modalChangePwd") modalChangePwd: ModalDialog;

    constructor(public fb: UntypedFormBuilder, public route: ActivatedRoute, public router: Router, public service: SystemService,
        public location: Location) {

        this.service.HasAccountData.then((data) => {
            this.UserName = this.service.Account.UserName;;
        });
        this.initForm();
    }
    ngOnInit() {
    }
    initForm() {
        this.ChangePasswordForm = this.fb.group({
            password: ["", Validators.required],
            confirmPassword: ["", Validators.required]
        }, {
            validator: PasswordValidation.MatchPassword // your validation method
        });
    }

    async ChangePassword() {
        try {
            if (!this.service.Account.Is_DemoVersion) {//This condition only for demo version
                this.isLoading = true;
                let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/ChangePassword", { Password: this.ChangePasswordForm.value.password });
                if (res && res > 0) {
                    this.modalChangePwd.close();
                    this.onSave.emit();
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgPasswordChanged"));
                    window.setTimeout(() => { this.service.logOut(); }, 1000);
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
                this.isLoading = false;
            }
            else {
                this.service.showMessage(AlertType.Error, "This features is not enable for demo version.");
            }
        } catch (e) {
            this.isLoading = false;
        }
    }

    public open() {
        this.modalChangePwd.open();
        this.initForm();
    }

}
