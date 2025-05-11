import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SystemService } from '../shared/SystemService';
import { KeyValueString } from '../shared/common_model'

@Component({
    selector: 'app-header',
    templateUrl: './header.html'
})
export class HeaderComponent {
    parseFloat = parseFloat; sub: any;
    LanguageList: Array<KeyValueString> = []; selectedLang = "EN"; selectedLang_Key = "English";
    AnnouncementList: Array<any> = [];
    logoUrl = "/assets/images/old_logo.png"; ProfilePicture = "/assets/images/profile.png";
    constructor(public router: Router, public route: ActivatedRoute, public service: SystemService) {
        this.service.HasAccountData.then(() => {
            this.bindData();
        });
        this.get_language_list();
    }
    ngOnInit() {
        this.service.Data.registerReceiver<any>('Get_Page_Permission_Refresh').subscribe(async (res) => {
            if (res.UserID != this.service.Account.UserID) {
                window.location.reload();
            }
            else {
                await this.service.loadAccountDetail();
                if (this.service.Account.ProfilePicture) {
                    let cdt = this.service.Date_Format(new Date(), 'yyyyMMddHHmmss');
                    this.ProfilePicture = this.service.Settings.Base_API_URL + "/Documents/Profile/" + this.service.Account.ProfilePicture + "?" + cdt;
                }
            }
        });
        this.service.Data.registerReceiver<any>('Get_Notification_Refresh').subscribe((res) => {
            this.bindData();
        });
        this.service.Data.registerReceiver<any>('Get_Language_Refresh').subscribe((res) => {
            if (res.UserID == this.service.Account.UserID) {
                this.changeLanguage(res.keyval, false);
            }
        });

        //for check requester or agent        
        if (window.location.href.indexOf("/requester") > -1) {
            this.service.Account.Is_Agent = false;
            this.service.Account.Is_Show_ClientPortal_Link = false;
        }

        this.sub = this.service.App.RefreshData.subscribe(this.bindData.bind(this));

    }
    ngOnDestroy() {
        if (this.sub) { this.sub.unsubscribe(); }
    }
    async bindData() {
        let cdt = this.service.Date_Format(new Date(), 'yyyyMMddHHmmss');
        if (this.service.Account.CompanyLogo) { this.logoUrl = this.service.Settings.Base_API_URL + "/Documents/Attachments/" + this.service.Account.CompanyLogo + "?" + cdt; }
        if (this.service.Account.ProfilePicture) { this.ProfilePicture = this.service.Settings.Base_API_URL + "/Documents/Profile/" + this.service.Account.ProfilePicture + "?" + cdt; }

        this.AnnouncementList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Admin/Get_AnnouncementList_Client", { Is_Agent: this.service.Account.Is_Agent, Is_Client: true });
    }
    async get_language_list() {
        this.LanguageList = await this.service.Get_Languages();
        if (localStorage.getItem("lang")) { this.selectedLang = localStorage.getItem("lang"); }
        this.changeLanguage({ Key: this.selectedLang, Value: this.selectedLang }, false);
    }
    ChangePwdDone() { }

    async changeLanguage(item: KeyValueString, IsApiRefresh = true) {
        if (item.Value == item.Key) { item = this.LanguageList.find(d => d.Value == item.Value); }

        this.selectedLang = item.Value;
        this.selectedLang_Key = item.Key;
        localStorage.setItem("lang", item.Value);
        this.service.CL = item.Value;
        this.service.Translator.use(item.Value);
        setTimeout(() => { this.service.Set_RTL(); })


        if (IsApiRefresh) {
            //IsApiRefresh if this is pass true in signalR 'Get_Language_Refresh' then it could be infinite loop, so be carefull when play with this
            let res = await this.service.Data.ExecuteAPI_Post<any>("Admin/Set_Current_Languages", { lang: item.Value });
            this.service.Translator.set_data(res);
            //dummy set for reflect new changes            
            this.service.CL = 'dummy';
            setTimeout(() => { this.service.CL = item.Value; });
        }
    }
}