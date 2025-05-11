import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { SystemService } from '../../shared/SystemService';
import { KeyValue, AlertType } from '../../shared/common_model';

@Component({
    templateUrl: './requester_profile.html'
})

export class Requester_ProfileComponent {
    isLoading = false;
    RoleList: Array<KeyValue> = []; Is_Agent: boolean = false;
    UserManagementForm: UntypedFormGroup;
    @ViewChild('f') form: NgForm;
    imageUrl: string = "/assets/images/profile.png";
    allowedExtensions: Array<string> = ["png", "jpg", "jpeg", "gif", "bmp"];
    @ViewChild('displayName') inpfocus: ElementRef;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
        this.service.GoTo_ScrollTop(window);
        this.initForm();
    }
    ngOnInit() { }
    ngAfterViewInit() { this.inpfocus.nativeElement.focus(); }
    initForm() {
        this.UserManagementForm = this.fb.group({
            UserID: [0],
            DisplayName: ["", Validators.required],
            UserName: [{ value: "", disabled: true }],
            Email: ["", Validators.compose([Validators.required, Validators.email])],
            PhoneNo: [""],
            City: [""],
            State: [""],
            Country: [""],
            Pincode: [""],
            JobTitle: [""],
            Address: [""],
            Organization: [""],
            Description: [""],
            ProfilePicture: [""]
        });
        this.service.App.ShowLoader = true;
        this.service.HasAccountData.then(() => {
            this.EditUserManagement(this.service.Account.UserID);
        });
    }
    async EditUserManagement(UserID) {
        try {
            this.service.App.ShowLoader = true;
            let res = await this.service.Data.ExecuteAPI_Post<UserManagement_Model>("Admin/Get_UserManagement_ByID", { UserID: UserID });
            if (res) {
                this.UserManagementForm.patchValue(res);
                if (res.ProfilePicture) {
                    let cdt = this.service.Date_Format(new Date(), 'yyyyMMddHHmmss');
                    this.imageUrl = this.service.Settings.Base_API_URL + "/Documents/Profile/" + res.ProfilePicture + "?" + cdt;
                }
                else { this.imageUrl = "/assets/images/profile.png"; }
            }

            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    async SaveUserManagement() {
        try {
            this.service.App.ShowLoader = true;
            let obj = this.UserManagementForm.getRawValue();
            obj.UserID = obj.UserID == null ? 0 : obj.UserID;
            obj.ProfilePicture = this.imageUrl ? this.imageUrl : obj.ProfilePicture;
            obj.ProfilePictureName = this.ProfilePictureName;

            let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/Requester_UserManagement_Update", obj);
            if (res > 0) {
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgProfileUpdated"));
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
            }
            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    //profile picture
    ProfilePictureName: string = "";
    fileChange(event: any) {
        let file = event.target.files[0];
        if (file) {
            let extension = file.name.replace(/^.*\./, '');
            if (this.allowedExtensions.indexOf(extension.toLowerCase()) > -1) {
                var myReader: FileReader = new FileReader();
                myReader.onloadend = (e) => {
                    this.imageUrl = <string>myReader.result;
                    this.ProfilePictureName = file.name;
                }
                myReader.readAsDataURL(file);
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgSelectValidImage"));
            }
        }
    }
}

interface UserManagement_Model {
    UserID: number;
    RoleID: number;
    RoleName: string;
    DisplayName: string;
    UserName: string;
    Password: string;
    Email: string;
    PhoneNo: string;
    CellPhoneNo: string;
    City: string;
    State: string;
    Country: string;
    Pincode: string;
    JobTitle: string;
    Address: string;
    TimeZoneID: number;
    Organization: string;
    Is_SendMail_Password: boolean;
    Description: string;
    ProfilePicture: string;
    ProfilePictureName: string;
    Is_Active: boolean;
    CreatedDate: Date;
    selectedRow: boolean;
}