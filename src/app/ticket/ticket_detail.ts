import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { SystemService } from '../shared/SystemService';
import { KeyValue, KeyValueDefault, UserManagement_Model, Ticket_Model, Description_Model } from '../shared/common_model';
import { ModalDialog } from '../shared/modal.dialog';

import { User_Technician_ListComponent } from '../admin_setting/user/user_technician_list';
import { Solution_Find_ListComponent } from '../solution/solution_find_list';
import { AlertType } from '../shared/common_model';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { FocusInvalidDirective } from '../shared/app.directive';
declare var $: JQueryStatic;

@Component({
    templateUrl: './ticket_detail.html',
    providers: [FocusInvalidDirective]
})

export class Ticket_DetailComponent {
    isLoading = false; Is_SaveAndclose: boolean = false; sub: any;
    model: Common_Ticket_Detail_Model;
    AgentList: Array<UserManagement_Model> = []; selectedAgent: UserManagement_Model;
    ClientList: Array<UserManagement_Model> = []; selectedClient: UserManagement_Model;
    Filter_SubCategory_List: Array<KeyValueDefault> = []; Filter_ItemList: Array<KeyValueDefault> = [];
    minStDate: Date = new Date(); AttachmentList: Array<any> = [];
    TicketForm: UntypedFormGroup;
    DisplayTicketID: string; TicketID: number;
    selectedTicket: Ticket_Model;
    @ViewChild(User_Technician_ListComponent) public UserSelect: User_Technician_ListComponent;
    @ViewChild(Solution_Find_ListComponent) public modalFindSolution: Solution_Find_ListComponent;
    DueDate_Config: FlatpickrOptions = this.service.CommonDateConfig(); @ViewChild('dueDate') dueDate;
    @ViewChild('focus') inpfocus: ElementRef;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
        this.service.GoTo_ScrollTop(window);
        this.DisplayTicketID = this.route.snapshot.paramMap.get("id");
        this.InitTicketForm();
        this.InitCloseTicketForm();
    }
    ngOnInit() {
        setTimeout(() => { this.bindData(); });
        this.sub = this.service.Data.registerReceiver<any>('Get_TicketChat_Refresh').subscribe((res) => {
            if (res && res.TicketID == this.TicketID) {
                this.bind_chats(res);
            }
        });
    }
    ngOnDestroy() {
        if (this.sub) { this.sub.unsubscribe(); }
    }
    InitTicketForm() {
        this.service.App.ShowLoader = true;
        this.TicketForm = this.fb.group({
            TicketID: [0],
            DisplayTicketID: [""],
            RequestedName: ["", Validators.required],
            RequestedUser: [null, Validators.compose([Validators.required, Validators.min(1)])],
            RequestedUserEmail: [""],//Only for send mail
            AssignedName: [""],
            AssignedUser: [null],
            AssignedUserEmail: [""],//Only for send mail
            OldAssignedUser: [null],
            StatusID: [null, Validators.compose([Validators.required, Validators.min(1)])],
            OldStatusID: [null],
            TicketModeID: [null],
            LevelID: [null],
            RequestTypeID: [null],
            CategoryID: [null],
            SubCategoryID: [null],
            ItemID: [null],
            ImpactID: [null],
            PriorityID: [null],
            DepartmentID: [null],
            UrgencyID: [null],
            LocationID: [null],
            DueDate: [""],
            Subject: ["", Validators.required],
            Description: [""],
            SolutionDescription: [""],

            AssignedDate: [],
            UpdatedUser: [],
            UpdatedDate: []
        });
    }
    SetDateOptions(dt = "") {
        this.dueDate.flatpickr.setDate(dt);
        this.dueDate.flatpickr.set("onChange", (dtarr, dt, instance) => {
            if (dt) { dt = this.service.Date_Format(dt, 'YYYY-MM-dd') + ' ' + this.service.Date_Format(new Date(), 'HH:mm:ss') }
            this.TicketForm.controls['DueDate'].setValue(dt);
        });
    }
    async bindData() {
        try {
            this.model = await this.service.Data.ExecuteAPI_Post<Common_Ticket_Detail_Model>("Ticket/Get_Ticket_Detail_Data", { Is_Agent: true });
            this.getTicketDetails();

            this.ClientList = await this.service.Data.ExecuteAPI_Post<Array<UserManagement_Model>>("Admin/Get_UserSelection_List", { Is_Agent: false });
            this.AgentList = this.ClientList.filter(d => d.Is_Agent);

        } catch (e) { }
    }

    async getTicketDetails() {
        try {
            this.service.App.ShowLoader = true;
            this.selectedTicket = await this.service.Data.ExecuteAPI_Post<Ticket_Model>("Ticket/Get_Ticket_ByID", { TicketID: 0, DisplayTicketID: this.DisplayTicketID });
            if (this.selectedTicket) {
                this.TicketForm.patchValue(this.selectedTicket);
                this.bindDescription();//set description and solution value
                this.TicketID = this.selectedTicket.TicketID;
                this.Is_FCR = this.selectedTicket.Is_FCR;
                this.Is_Show_FCR = (!this.selectedTicket.Is_FCR && this.selectedTicket.StatusType == this.service.StatusType.Closed ? true : false);

                if (this.selectedTicket.CategoryID) { this.Change_Category(this.selectedTicket.CategoryID, this.selectedTicket.SubCategoryID); }
                this.SetDateOptions(<any>this.selectedTicket.DueDate);//bind date      
            }
            this.bindTicketAttachment();
            this.bind_chats();
        } catch (e) { this.service.App.ShowLoader = false; }
    }

    objDescription: any;
    async bindDescription() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Description_Model>("Dashboard/Get_DescriptionByID", { ModuleType: "ticket", ID: this.DisplayTicketID });
            if (res) {
                this.TicketForm.controls["Description"].setValue(res.Description);
                this.TicketForm.controls["SolutionDescription"].setValue(res.SolutionDescription);
                this.service.setKendoEditor(".kendoEditor");//initialize kendo editor      
            }
            window.setTimeout(() => { this.service.App.ShowLoader = false }, 200);
        } catch (e) { this.service.App.ShowLoader = false; }
    }
    setDescription() {
        this.TicketForm.controls["Description"].setValue(this.objDescription.Description);
        this.TicketForm.controls["SolutionDescription"].setValue(this.objDescription.SolutionDescription);
        this.service.setKendoEditor(".kendoEditor");//initialize kendo editor
        window.setTimeout(() => { this.service.App.ShowLoader = false }, 100);
    }

    // type = clone etc
    async SaveTicket(type = "") {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.TicketForm.getRawValue();
            obj.Description = $("#txtDesc").data("kendoEditor").value();
            obj.SolutionDescription = $("#txtSolDesc").data("kendoEditor").value();

            let res = await this.service.Data.ExecuteAPI_Post<any>("Ticket/Ticket_Update", { model: obj, attachment: this.lstAttachments ? this.lstAttachments : [] });
            if (res) {//tuple<long,string>
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketUpdated"));
                if (this.Is_SaveAndclose) {
                    window.setTimeout(() => { this.router.navigate(["/ticket"]); }, 300);
                }
                else {
                    if (this.lstAttachments.length > 0) { this.lstAttachments = []; this.bindTicketAttachment(); }
                    this.service.GoTo_ScrollTop(window);
                }
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
            }

            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    Change_Category(CategoryID: number, SubCategoryID: number = 0) {
        this.Filter_SubCategory_List = this.model.SubCategoryList.filter(d => d.MainID == CategoryID);
        this.Change_SubCategory(SubCategoryID > 0 ? SubCategoryID : null);
    }
    Change_SubCategory(SubCategoryID: number) {
        this.Filter_ItemList = this.model.ItemList.filter(d => d.MainID == SubCategoryID);
        if (this.Filter_ItemList.length == 0) { this.TicketForm.controls["ItemID"].setValue(null); }
    }

    BackToList() {
        this.router.navigate(['/ticket']);
    }

    //AutoComplete Requester & Technician
    NoRequesterFound(item: any) {
        //this.TicketForm.controls["RequestedUser"].setValue(0); this.TicketForm.controls["RequestedName"].setValue("");
    }
    //onSelectRequester($event: TypeaheadMatch) {
    onSelectRequester($event: any) {
        let obj: any = {};
        obj.user = $event.item; obj.isTechnician = false;
        this.UserSelectDone(obj);
    }
    NoTechnicianFound(item: any) {
        //this.TicketForm.controls["AssignedUser"].setValue(0); this.TicketForm.controls["AssignedName"].setValue("");
    }
    //onSelectTechnician($event: TypeaheadMatch) {
    onSelectTechnician($event: any) {
        let obj: any = {};
        obj.user = $event.item; obj.isTechnician = true;
        this.UserSelectDone(obj);
    }

    //Bind User & Technician Grid   
    OpenUserList(type: string) {
        if (type == 'user') {
            this.UserSelect.open(false, this.ClientList);
        }
        else if (type == 'technician') {
            this.UserSelect.open(true, this.AgentList);
        }
    }
    ViewUser() {
        if (this.selectedClient) {
            this.UserSelect.ViewRow(this.selectedClient);
        }
        else { this.UserSelect.ViewRow(null, this.TicketForm.get("RequestedUser").value); }
    }
    UserSelectDone(item: any) {
        if (item.isTechnician) {
            this.selectedAgent = item.user;
            this.TicketForm.controls["AssignedName"].setValue(this.selectedAgent.DisplayName);
            this.TicketForm.controls["AssignedUser"].setValue(this.selectedAgent.UserID);
            this.TicketForm.controls["AssignedUserEmail"].setValue(this.selectedAgent.Email);
        }
        else {
            this.selectedClient = item.user;
            this.TicketForm.controls["RequestedName"].setValue(this.selectedClient.DisplayName);
            this.TicketForm.controls["RequestedUser"].setValue(this.selectedClient.UserID);
            this.TicketForm.controls["RequestedUserEmail"].setValue(this.selectedClient.Email);
        }
    }
    AssignCurrentUser() {
        this.selectedAgent = <UserManagement_Model>{
            UserID: this.service.Account.UserID, DisplayName: this.service.Account.DisplayName,
            UserName: this.service.Account.UserName, Email: this.service.Account.Email
        };
        this.TicketForm.controls["AssignedName"].setValue(this.selectedAgent.DisplayName);
        this.TicketForm.controls["AssignedUser"].setValue(this.selectedAgent.UserID);
        this.TicketForm.controls["AssignedUserEmail"].setValue(this.selectedAgent.Email);
    }

    async DeleteRow() {
        try {
            if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                this.service.App.ShowLoader = true;
                let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/Ticket_Delete", { TicketIDs: this.TicketID });
                if (res > 0) {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketDeleted"));
                    window.setTimeout(() => { this.BackToList(); }, 1000);
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorTicketsUsedInAnotherTable"));
                }

                this.service.App.ShowLoader = false;
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    //CloneTicket
    async CloneTicket() {
        try {
            if (confirm(this.service.Translator.instant("msgClonethisTicket"))) {
                let res = await this.service.Data.ExecuteAPI_Post<any>("Ticket/Ticket_Clone", { TicketID: this.TicketID });
                if (res) {//tuple<long,string>
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketCloned"));

                    this.TicketForm.controls["TicketID"].setValue(res.Item1);
                    this.TicketForm.controls["DisplayTicketID"].setValue(res.Item2);

                    this.service.GoTo_ScrollTop(window);
                    this.router.navigate(["/ticket"]);
                    window.setTimeout(() => { this.router.navigate(["/ticket/detail", res.Item2]); }, 20);
                }
            }
        } catch (e) { }
    }
    //Print
    Print() {
        let url = this.service.Settings.API_URL + "/Home/Print?ids=" + this.TicketID + "&type=ticket&lang=" + this.service.CL;
        window.open(url, "Print Preview");
    }

    //Set First Call Resolution(FCR)
    Is_FCR: boolean = false; Is_Show_FCR: boolean = false;
    async Set_FCR(Is_FCR) {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/Set_Ticket_FCR", { TicketID: this.TicketID, Is_FCR: Is_FCR });
            if (res) {
                this.Is_FCR = Is_FCR;
                this.Is_Show_FCR = !Is_FCR;
                if (Is_FCR) {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgFCRMarked"));
                }
                else {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgFCRUnMarked"));
                }
            }

        } catch (e) { }
    }

    //Close Tickets
    CloseTicketForm: UntypedFormGroup;
    @ViewChild("modalCloseTicket") modalCloseTicket: ModalDialog;
    CLosedStatusList: Array<any> = []; TicketCloseModeList: Array<any> = [];
    async InitCloseTicketForm() {
        this.CloseTicketForm = this.fb.group({
            StatusID: [0, Validators.compose([Validators.required, Validators.min(1)])],
            TicketCloseModeID: [0, Validators.compose([Validators.required, Validators.min(1)])],
            StatusCloseReason: [""]
        });
        let res = await this.service.Data.ExecuteAPI_Post<Array<any>>("Admin/Get_Status_List");
        if (res) {
            this.CLosedStatusList = res.filter(d => d.Is_Closed == 1);
        }

        let res1 = await this.service.Data.ExecuteAPI_Post<Array<KeyValue>>("Admin/Get_TicketCloseMode_List");
        if (res1) {
            this.TicketCloseModeList = res1;
        }
    }
    OpenCloseTicket() {
        this.modalCloseTicket.open();
    }
    async CloseTicket() {
        try {
            this.service.App.ShowLoader = true;
            let obj = this.CloseTicketForm.getRawValue();

            let lstSelectedRow = [];
            lstSelectedRow.push(this.selectedTicket);

            let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/Ticket_Status_Update", { lstTicket: lstSelectedRow, StatusID: obj.StatusID, TicketCloseModeID: obj.TicketCloseModeID, StatusCloseReason: obj.StatusCloseReason });
            if (res > 0) {
                this.TicketForm.controls["StatusID"].setValue(obj.StatusID);
                this.modalCloseTicket.close();
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketClosed"));
                this.clearCloseTicketForm();
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
            }
            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    clearCloseTicketForm() {
        this.CloseTicketForm.controls["StatusID"].setValue(null);
        this.CloseTicketForm.controls["TicketCloseModeID"].setValue(null);
        this.CloseTicketForm.controls["StatusCloseReason"].setValue("");
    }

    //Assigned And Pickup Tickets
    PickUp() {
        let objUser = { UserID: this.service.Account.UserID, DisplayName: this.service.Account.DisplayName, Email: this.service.Account.Email };
        this.Ticket_AssignTo_Update(objUser, true);
    }
    async Ticket_AssignTo_Update(objUser, Is_PickUp) {
        if (objUser.UserID > 0) {
            try {

                let lstSelectedRow = [];
                lstSelectedRow.push(this.selectedTicket);

                this.service.App.ShowLoader = true;
                let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/Ticket_AssignTo_Update", { lstTicket: lstSelectedRow, objUser: objUser });
                if (res > 0) {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketPickedUp"));
                    this.AssignCurrentUser();
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
                this.service.App.ShowLoader = false;
            } catch (e) {
                this.service.App.ShowLoader = false;
            }
        }
        else {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
        }
    }


    //Attachments
    @ViewChild('flAttachment') flAttachment: ElementRef;
    isAttachLoading: boolean = false; lstAttachments: Array<any> = [];
    Not_AllowedExtensions: Array<string> = [];
    async bindTicketAttachment() {
        this.Not_AllowedExtensions = this.service.Get_NotAllowedExtensions();
        this.AttachmentList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Ticket/Get_TicketAttachment_ByID", { TicketID: this.TicketID });
    }
    fileChange(event: any) {
        let files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            this.ReadFiles(file); //read files                       
        }
    }
    ReadFiles(file) {
        this.isAttachLoading = true;
        var myReader: FileReader = new FileReader();
        let extension = file.name.replace(/^.*\./, '');
        if (this.Not_AllowedExtensions.indexOf(extension.toLowerCase()) < 0) {
            myReader.readAsDataURL(file);
            myReader.onloadend = (e) => {
                this.lstAttachments.push({ name: file.name, type: file.type, extension: extension, size: file.size, value: <string>myReader.result });
                this.isAttachLoading = false;
            }
        }
        else {
            this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgFileExtensionNotSupport"));
            this.isAttachLoading = false;
        }
    }

    async RemoveAttachment(item: any, type: string) {
        if (type == 'new') {
            this.lstAttachments = this.lstAttachments.filter(d => d != item);
        }
        else if (type == 'old') {
            try {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedAttachments"))) {
                    this.isAttachLoading = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/TicketAttachment_Delete", { TicketAttachmentID: item.TicketAttachmentID, FileName: item.FileName });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgAttachmentDeleted"));
                        this.AttachmentList = this.AttachmentList.filter(d => d != item);
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                    }
                    this.isAttachLoading = false;
                }
            } catch (e) {
                this.isAttachLoading = false;
            }
        }
    }


    //Search Solition
    isLoadingFindSolution = false;
    FindSolution() {
        this.modalFindSolution.open();
    }
    async FindSolutionDone(DisplaySolutionID: any) {
        try {
            this.isLoadingFindSolution = true;
            let res = await this.service.Data.ExecuteAPI_Post<Description_Model>("Dashboard/Get_DescriptionByID", { ModuleType: "solution", ID: DisplaySolutionID });
            if (res) {
                this.TicketForm.controls["SolutionDescription"].setValue(res.Description);
                $("#txtSolDesc").data("kendoEditor").refresh();
                $("#txtSolDesc").data("kendoEditor").value(res.Description);
            }
            this.isLoadingFindSolution = false;
        } catch (e) {
            this.isLoadingFindSolution = false;
        }
    }

    //Ticket Chat
    is_show_chat = false; chat_list = []; txt_chat = ''; is_loading_chat = false;
    show_chat(is_show = true) { this.is_show_chat = is_show; }
    async bind_chats(item = null) {
        try {
            if (item) {
                this.chat_list.splice(0, 0, item);
                let elem = document.querySelector('.ticket-chat .table-responsive');
                if (elem) { this.service.GoTo_ScrollTop(elem); }
            }
            else {
                this.chat_list = await this.service.Data.ExecuteAPI_Post<any>("Ticket/Get_TicketChat", { TicketID: this.TicketID });
            }

        } catch (e) { }
    }
    async save_chat() {
        try {
            if (this.txt_chat) {
                this.is_loading_chat = true;
                let obj = { TicketID: this.TicketID, Description: this.txt_chat };
                let res = await this.service.Data.ExecuteAPI_Post<any>("Ticket/TicketChat_Update", { model: obj });
                this.txt_chat = '';
                //this.is_show_chat = false;
                this.is_loading_chat = false;
            }
        } catch (e) {
            this.is_loading_chat = false;
        }
    }
}

interface Common_Ticket_Detail_Model {
    RequestTypeList: Array<KeyValueDefault>;
    StatusList: Array<KeyValueDefault>;
    PriorityList: Array<KeyValueDefault>;
    CategoryList: Array<KeyValueDefault>;
    SubCategoryList: Array<KeyValueDefault>;
    ItemList: Array<KeyValueDefault>;
    UrgencyList: Array<KeyValueDefault>;
    ImpactList: Array<KeyValueDefault>;
    DepartmentList: Array<KeyValueDefault>;
    LevelList: Array<KeyValueDefault>;
    LocationList: Array<KeyValueDefault>;
    TicketModeList: Array<KeyValueDefault>;
}
