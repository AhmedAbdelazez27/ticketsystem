import { Injectable, EventEmitter } from '@angular/core';
import { Account_Model, Menu_Model, Settings_Model, KeyValueString, GridFilter } from './common_model';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Start Alert Service
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { filter, timeout } from 'rxjs/operators';
import { Alert, AlertType } from './common_model';
// End Alert Service

import { FlatpickrOptions } from 'ng2-flatpickr';
import { DatePipe } from '@angular/common';
import { TranslateService } from './Translate/translate.service';


declare var $: JQueryStatic;

import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@aspnet/signalr';
import { environment } from '../../environments/environment';


@Injectable()
export class SystemService {
    public App: AppHelper;
    public CL: string = "";
    public Data: DataHelper;
    public Account: Account_Model;
    public menu_Model: Menu_Model = <Menu_Model>{};

    public Settings: Settings_Model;

    public Storage_Key: typeof Storage_Key = Storage_Key;
    public StatusType: typeof StatusType = StatusType;

    public _dataPromise: Deferred<boolean> = new Deferred<boolean>();
    public get HasAccountData(): Promise<boolean> {
        return this._dataPromise.promise;
    }

    //Start Alert Service
    public subject = new Subject<Alert>();
    //public keepAfterRouteChange = false;
    //End Alert Service

    constructor(public route: ActivatedRoute, public router: Router, public http: HttpClient, public Translator: TranslateService) {
        //this.Settings = window["settings"];
        //this.Settings.API_URL = this.Settings.Base_API_URL + 'api/';
        this.Settings = <Settings_Model>{
            Base_API_URL: environment.Base_API_URL, Site_URL: environment.Site_URL, Expiration_Time: environment.Expiration_Time
        };
        this.Settings.API_URL = this.Settings.Base_API_URL + '/api';

        this.Account = <Account_Model>{};
        this.App = new AppHelper(this);
        this.Data = new DataHelper(http, this.App, this);
        Translator.init().then(() => { this.CL = "en"; });
        this.loadAccountDetail();
    }

    CommonDateConfig(format = '') {
        let opt: FlatpickrOptions = { altInput: true, altFormat: "d M Y", dateFormat: format ? format : "Y-m-d", disableMobile: true };
        return opt;
    }
    //CommonDateConfig_MonthYearOnly(format = '') {
    //    let opt: FlatpickrOptions = {
    //        altInput: true, altFormat: "d M Y", dateFormat: format ? format : "Y-m-d", disableMobile: true, plugins: [new window['monthSelectPlugin']({ shorthand: true, dateFormat: "Y-m", altFormat: "M Y" })]
    //    };
    //    return opt;
    //}
    OpenFlatpickr(ele: any) { ele.flatpickr.toggle(); }
    Date_Format(input: Date | string, format: string) {
        return new DatePipe("en-us").transform(input, format)
    }

    async loadAccountDetail(): Promise<boolean> {
        //window.setTimeout(async () => {
        if (this.App.getCookie("Bearer")) {
            try {
                let data = await this.Data.ExecuteAPI_Post<Account_Model>("Admin/Get_Account_Detail");

                let isagent = this.Account.Is_Agent;//for remember agent is in agent portal or client portal, so get old value                    
                this.Account = new Account_Model(data);
                if (isagent != undefined && isagent != null) { this.Account.Is_Agent = isagent };//for remember agent is in agent portal or client portal, so get old value                   
                this.Account.Is_Show_ClientPortal_Link = this.Account.Is_Agent;

                if (this.Account.UserID > 0) { this._dataPromise.resolve(true); }
                else { this._dataPromise.resolve(false); this.redirectToLogin(); }

            } catch (e) {
                this._dataPromise.resolve(false); this.redirectToLogin();
            }
        } else {
            this._dataPromise.resolve(false);
        }
        //}, 1);
        return this._dataPromise.promise;
    }

    redirectToLogin(returnUrl?: string) {
        this.Account = <Account_Model>{ UserID: 0, UserName: "" };
        if (returnUrl && returnUrl != '/')
            this.router.navigate(['login'], { queryParams: { returnUrl: returnUrl }, replaceUrl: true });
        else
            this.router.navigate(['login']);
    }
    goToDashboard() { this.router.navigate(['/']); }
    ClearToken() {
        this.App.setCookie("Bearer", "", 0);
        this.Account = <Account_Model>{ UserID: 0, UserName: "" };
    }
    logOut() {
        //this.Data.startConnection();
        this.resetPromise();
        this.App.setCookie("Bearer", "", 0);
        //this.Account = <Account_Model>{ UserID: 0, UserName: "" };
        this.redirectToLogin();
    }
    resetPromise() {
        this._dataPromise = new Deferred<boolean>();
    }

    GoTo_ScrollTop(wind: any) {
        try {
            wind.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
            $('body').removeClass('modal-open');
        } catch (ex) { }
    }

    Is_RTL() {
        return localStorage.getItem("lang") == 'AE';
    }
    Set_RTL() {
        if (this.Is_RTL()) {
            document.querySelector('html').classList.add('rtl');
        }
        else {
            document.querySelector('html').classList.remove('rtl');
        }
    }


    //Show/hide left menu
    ShowHide_LeftMenu(type = '') {
        if (type == 'admin') {
            if (this.menu_Model.Admin_Menu_Class == 'show-left-menu') { this.menu_Model.Admin_Menu_Class = 'hide-left-menu'; }
            else { this.menu_Model.Admin_Menu_Class = 'show-left-menu'; }
        }
        else {
            if (this.menu_Model.Main_Menu_Class == 'show-left-menu') { this.menu_Model.Main_Menu_Class = 'hide-left-menu'; }
            else { this.menu_Model.Main_Menu_Class = 'show-left-menu'; }
        }
    }
    async Get_Languages() {
        let lst: any = [
            { Key: 'Arabic', Value: 'AE' },
            { Key: 'English', Value: 'EN' },
            { Key: 'French', Value: 'FR' },
        ];
        return lst;
    }

    //Start Alert Service
    getAlert(alertId?: string): Observable<any> {
        return this.subject.asObservable().pipe(filter((x: Alert) => x && x.alertId === alertId));
      }
    showMessage(type, message) {
        if (type == AlertType.Success) { this.alert(new Alert({ message, type: AlertType.Success, cssClass: "alert-success" })); }
        else if (type == AlertType.Error) { this.alert(new Alert({ message, type: AlertType.Error, cssClass: "alert-danger" })); }
        else if (type == AlertType.Warning) { this.alert(new Alert({ message, type: AlertType.Warning, cssClass: "alert-warning" })); }
        else if (type == AlertType.Info) { this.alert(new Alert({ message, type: AlertType.Info, cssClass: "alert-info" })); }
    }
    // main alert method    
    alert(alert: Alert) {
        this.subject.next(alert);
    }
    // clear alerts
    clear(alertId?: string) { this.subject.next(new Alert({ alertId })); }
    //End Alert Service

    //random colors for Google charts
    lstColors = ['#7cb5ec', '#f45b5b', '#2b908f', '#e4d354', '#f15c80', '#8085e9', '#f7a35c', '#90ed7d', '#434348', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'];
    Get_Randon_Colors() {
        let lst = this.lstColors.reduce((p, n) => {
            const size = p.length;
            const index = Math.trunc(Math.random() * (size - 1));
            p.splice(index, 0, n);
            return p;
        }, []);
        return lst;
    }

    //random colors for ChartJs
    lst_BarColors = [{ backgroundColor: 'rgba(134,199,243,0.9)', borderColor: 'rgba(134,199,243,1)' }, { backgroundColor: 'rgba(144,237,125,0.9)', borderColor: 'rgba(144,237,125,1)' }, { backgroundColor: 'rgba(244,91,91,0.9)', borderColor: 'rgba(244,91,91,1)' }];
    Get_FixBarColors() { return this.lst_BarColors; }
    Get_Random_PieColors() {
        let lst = this.lstColors.reduce((p, n) => {
            const size = p.length;
            const index = Math.trunc(Math.random() * (size - 1));
            p.splice(index, 0, n);
            return p;
        }, []);
        return [{ backgroundColor: lst }];
    }


    //Round 2 Decimal Points
    RoundValue(n, d = 2) {
        let m = Math.pow(10, d);
        return Math.round(n * m) / m;
    }

    //Get Default Profile Image
    Default_Profile_Pic() { return "/assets/images/profile.png"; }

    //Kendo Editor Set, Refresh and Get Value
    setKendoEditor(id) {
        window.setTimeout(() => {
            $(id)["kendoEditor"]({
                resizable: true,
                //animation: false,
                tools: [
                    "formatting",
                    "bold",
                    "italic",
                    "underline",
                    "strikethrough",
                    "justifyLeft",
                    "justifyCenter",
                    "justifyRight",
                    "justifyFull",
                    "insertUnorderedList",
                    "insertOrderedList",
                    "createLink",
                    "unlink",
                    "insertImage",
                    "insertFile",
                    "createTable",
                    "addRowAbove",
                    "addRowBelow",
                    "addColumnLeft",
                    "addColumnRight",
                    "deleteRow",
                    "deleteColumn",
                    "viewHtml",
                    "cleanFormatting",
                    "foreColor",
                    "backColor",
                    "print",
                    "fontName",
                    "fontSize"
                ],
                imageBrowser: {
                    messages: {
                        dropFilesHere: "Drop files here"
                    },
                    transport: {
                        read: this.Settings.API_URL + "/Home/Read",
                        destroy: {
                            url: this.Settings.API_URL + "/Home/Destroy",
                            type: "POST"
                        },
                        create: {
                            url: this.Settings.API_URL + "/Home/Create",
                            type: "POST"
                        },
                        thumbnailUrl: this.Settings.API_URL + "/Home/Thumbnail",
                        uploadUrl: this.Settings.API_URL + "/Home/Upload",
                        imageUrl: this.Settings.Base_API_URL + "/Documents/ImageBrowser/{0}"
                    }
                }
            });
        }, 200);
    }
    refreshKendoEditor(id) { $(id).data("kendoEditor").refresh(); }

    Get_NotAllowedExtensions() { return ["js", "jsp", "apk", "bat", "bin", "cgi", "pl", "com", "exe", "gadget", "jar", "py", "wsf"]; }
}

class DataHelper {
    public objEvents: any = {};

    public get IsConnected(): boolean {
        return this._hubConnection && this._hubConnection.state === HubConnectionState.Connected;
    }
    private _hubConnection: HubConnection;
    constructor(public http: HttpClient, public App: AppHelper, public service: SystemService) {
        this.SetHttpOptions2();
        //if (this.service.Account.Is_Enable_SignalR) {
        if (!this.IsConnected) {
            this.createConnection();
            this.startConnection();
        }
        //}
    }
    public createConnection() {
        this._hubConnection = new HubConnectionBuilder().withUrl(this.service.Settings.Base_API_URL + '/appHub').build();
    }
    public startConnection(): void {
        this.stopConnection();
        this._hubConnection.start().then(() => { })
            .catch(err => {
                console.log('Error while establishing hub connection, retrying...');
                setTimeout(() => { this.startConnection(); }, 600000);//10 min
            });
    }
    stopConnection() {
        if (this._hubConnection) { this._hubConnection.stop(); }
    }
    registerReceiver<T>(action: string): EventEmitter<T> {
        action = action.toLowerCase();
        let event = this.objEvents[action];
        if (!event) {
            event = new EventEmitter<T>();
            this.objEvents[action] = event;
            this._hubConnection.on(action, (data: T) => { event.emit(data); });
            //this.AppHub.on(action,(data: T) => {event.emit(data);});
        }
        return event;
    }



    public BearerToken = this.App.getCookie("Bearer");
    public httpOptions = { headers: new HttpHeaders() };

    public httpOptions_empty = { headers: new HttpHeaders() };
    SetHttpOptions() {
        this.BearerToken = this.App.getCookie("Bearer");

        let headers = new HttpHeaders();
        headers.append("Content-Type", "application/json; charset=utf-8");

        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Headers': '*',
                'Authorization': 'Bearer ' + this.BearerToken
            })
        };
        this.httpOptions_empty = {
            headers: new HttpHeaders({ 'Authorization': 'Bearer ' + this.BearerToken })
        };
    }

    SetHttpOptions2() {
        this.BearerToken = this.App.getCookie("Bearer");

        let headers = new HttpHeaders();

        this.httpOptions = {
            headers: headers
        };

        headers.append("Authorization", 'Bearer ' + this.BearerToken);
        this.httpOptions_empty = {
            headers: headers
        };
    }

    public httpOptions1 = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' as 'json' };
    ExecuteAPI_Post_Local<T>(action: string, params: any = {}): Promise<any> {
        let url = this.service.Settings.API_URL + action;
        // return this.http.post<any>(url, params, this.httpOptions).toPromise<any>();
        return firstValueFrom(this.http.post<any>(url, params, this.httpOptions));
    }

    //API Common Method
    // ExecuteAPI_Get<T>(action: string, params: any = {}): Promise<T> {
    //     action = this.service.Settings.API_URL + '/' + action;
    //     //return this.http.get<T>(action).toPromise<T>();
    //     return this.http.get<T>(action, { params: params, headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.BearerToken }) }).toPromise<T>().catch((err) => {
    //         throw err;
    //     });;
    // }
    ExecuteAPI_Get<T>(action: string, params: any = {}): Promise<T> {
        action = this.service.Settings.API_URL + '/' + action;
        return firstValueFrom(
            this.http.get<T>(action, { 
                params: params, 
                headers: new HttpHeaders({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.BearerToken
                }) 
            })
        ).catch((err) => {
            throw err;
        });
    }
    // ExecuteAPI_Post<T>(action: string, params: any = {}): Promise<any> {
    //     let url = this.service.Settings.API_URL + '/' + action;
    //     //return this.http.post<any>(url, params, httpOptions).toPromise<any>();
    //     return this.http.post<T>(url, params, this.httpOptions).pipe(timeout(300000)).toPromise<T>().catch((err) => {
    //         throw err;
    //     });
    // }
    ExecuteAPI_Post<T>(action: string, params: any = {}): Promise<any> {
        let url = this.service.Settings.API_URL + '/' + action;
        return firstValueFrom(
            this.http.post<T>(url, params, this.httpOptions).pipe(timeout(300000))
        ).catch((err) => {
            throw err;
        });
    }
    ExecuteAPI_Post_Loader<T>(action: string, params: any = {}): Promise<any> {
        this.App.ShowLoader = true;
        let promise = this.ExecuteAPI_Post<T>(action, params);
        promise.then(() => { this.App.ShowLoader = false; }).catch((err) => { this.App.ShowLoader = false; throw err; });
        return promise;
    }
}

export class Deferred<T> {
    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

class AppHelper {
    constructor(public service: SystemService) { }
    public ShowLoader: boolean = false; public AppLoader: boolean = true;
    public RefreshData: EventEmitter<any> = new EventEmitter();

    public searchFilter: EventEmitter<any> = new EventEmitter();
    public refreshGrid: EventEmitter<any> = new EventEmitter();
    public showhideColumnFilter: EventEmitter<any> = new EventEmitter();
    public clearAllCheckbox: EventEmitter<any> = new EventEmitter();

    public _appData: any = {};
    GetData<T>(key: string): T {
        return (<T>this._appData[key]);
    }
    SetData(key: string, data: any) {
        this._appData[key] = data;
    }
    setCookie(cname, cvalue, date: Date | number) {
        let d = new Date();
        if (date instanceof Date) {
            d = <Date>date;
        } else {
            d.setTime(d.getTime() + (<number>date * 24 * 60 * 60 * 1000));
        }
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }


    checkSetting() {
        this.setCookie("Bearer", "", 0);
    }
    Clear_Local_Storage() {
        window.localStorage.clear();
    }
    set_localstorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    get_localstorage(key) {
        let value = localStorage.getItem(key);
        return JSON.parse(value);
    }
    get_cached_column(key, gridfilter: Array<GridFilter>) {
        let cols = this.get_localstorage(key);
        if (cols) {
            gridfilter.map(d => {
                let item = cols.find(x => x.col == d.ColumnName);
                if (item) { d.Is_Visible = item.show; }
            });
        }
    }
}

enum StatusType {
    Open = "Open",
    Closed = "Closed",
    OnHold = "OnHold"
}
enum Storage_Key {
    DB_Announcement = "DB_Announcement"
}