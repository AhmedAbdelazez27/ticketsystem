import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { SystemService } from '../../shared/SystemService';
import { KeyValueDefault, Ticket_Model, Description_Model } from '../../shared/common_model';
import { AlertType } from '../../shared/common_model';


@Component({
    templateUrl: './requester_ticket_detail.html'
})

export class Requester_Ticket_DetailComponent {
    isLoading = false; Is_SaveAndclose: boolean = false; sub: any;
    model: Common_Ticket_Detail_Model;
    Filter_SubCategory_List: Array<KeyValueDefault> = []; Filter_ItemList: Array<KeyValueDefault> = [];
    minStDate: Date = new Date(); AttachmentList: Array<any> = [];
    TicketForm: UntypedFormGroup;
    DisplayTicketID: string; TicketID: number;
    ticket_model: Ticket_Model;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
        this.service.GoTo_ScrollTop(window);
        this.DisplayTicketID = this.route.snapshot.paramMap.get("id");
        this.InitTicketForm();
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
        this.TicketForm = this.fb.group({
            TicketID: [0],
            DisplayTicketID: [""],
            StatusID: [null],
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
            Subject: ["", Validators.required],
            Description: [""],
            SolutionDescription: [""],
            UpdatedUser: [],
            UpdatedDate: []
        });
    }

    async bindData() {
        try {
            this.service.App.ShowLoader = true;
            this.model = await this.service.Data.ExecuteAPI_Post<Common_Ticket_Detail_Model>("Ticket/Get_Ticket_Detail_Data", { Is_Agent: false });
            this.getTicketDetails();
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    async getTicketDetails() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Ticket_Model>("Ticket/Get_Ticket_ByID", { TicketID: 0, DisplayTicketID: this.DisplayTicketID });
            if (res) {
                this.ticket_model = res;
                this.TicketForm.patchValue(res);
                this.bindDescription();//set description and solution value
                this.TicketID = res.TicketID;
                if (res.CategoryID) { this.Change_Category(res.CategoryID, res.SubCategoryID); }
            }
            this.bindTicketAttachment();
            this.bind_chats();
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    objDescription: any;
    async bindDescription() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Description_Model>("Dashboard/Get_DescriptionByID", { ModuleType: "ticket", ID: this.DisplayTicketID });
            if (res) {
                this.ticket_model.SolutionDescription = res.SolutionDescription;
                this.TicketForm.controls["Description"].setValue(res.Description);
                this.TicketForm.controls["SolutionDescription"].setValue(res.SolutionDescription);
                this.service.setKendoEditor(".kendoEditor");//initialize kendo editor                
            }
            window.setTimeout(() => { this.service.App.ShowLoader = false }, 200);
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }


    // type = clone etc
    async SaveTicket(type = "") {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.TicketForm.getRawValue();
            obj.Description = $("#txtDesc").data("kendoEditor").value();

            let res = await this.service.Data.ExecuteAPI_Post<any>("Ticket/Ticket_Requester_Update", { model: obj, attachment: this.lstAttachments ? this.lstAttachments : [] });
            if (res) {//tuple<long,string>
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketUpdated"));
                if (this.Is_SaveAndclose) {
                    window.setTimeout(() => { this.router.navigate(["/requester/ticket"]); }, 300);
                }
                else {
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
        this.router.navigate(['/requester/ticket']);
    }

    async DeleteRow() {
        try {
            if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                this.service.App.ShowLoader = true;
                let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/Ticket_Delete", { TicketIDs: this.TicketID });
                if (res > 0) {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketDeleted"));
                    window.setTimeout(() => { this.BackToList(); }, 500);
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

    //Print
    Print() {
        let url = this.service.Settings.API_URL + "/Home/Print?ids=" + this.TicketID + "&type=ticket&lang=" + this.service.CL;
        window.open(url, "Print Preview");
    }

    //Attachments
    @ViewChild('flAttachment') flAttachment: ElementRef;
    isAttachLoading: boolean = false; lstAttachments: Array<any> = [];
    Not_AllowedExtensions: Array<string> = [];
    async bindTicketAttachment() {
        this.Not_AllowedExtensions = this.service.Get_NotAllowedExtensions();
        this.AttachmentList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Ticket/Get_TicketAttachment_ByID", { TicketID: this.TicketID })
    }
    fileChange(event: any) {
        let files = event.target.files;// [].slice.call(event.target.files);
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
        try {
            if (type == 'new') {
                this.lstAttachments = this.lstAttachments.filter(d => d != item);
            }
            else if (type == 'old') {
                if (confirm("Are you sure want to delete selected attachments ?")) {
                    this.isAttachLoading = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Ticket/TicketAttachment_Delete", { TicketAttachmentID: item.TicketAttachmentID, FileName: item.FileName });
                    if (res > 0) {
                        this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgAttachmentDeleted"));
                        this.AttachmentList = this.AttachmentList.filter(d => d != item);
                    }
                    else {
                        this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                    }
                }
            }
        } catch (e) {
            this.isAttachLoading = false;
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
