import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { SystemService } from '../../shared/SystemService';
import { KeyValueDefault } from '../../shared/common_model';
import { AlertType } from '../../shared/common_model';
declare var $: JQueryStatic;

@Component({
    templateUrl: './requester_ticket_new.html'
})

export class Requester_Ticket_NewComponent {
    isLoading = false; Is_SaveAndclose: boolean = false;
    model: Common_Ticket_Detail_Model;
    Filter_SubCategory_List: Array<KeyValueDefault> = []; Filter_ItemList: Array<KeyValueDefault> = [];
    minStDate: Date = new Date();
    TicketForm: UntypedFormGroup;
    @ViewChild('focus') inpfocus: ElementRef;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
        this.service.GoTo_ScrollTop(window);
        this.Not_AllowedExtensions = this.service.Get_NotAllowedExtensions();
        this.InitTicketForm();
    }
    ngOnInit() {
        setTimeout(() => { this.bindData(); });
    }
    ngAfterViewInit() {
        this.service.setKendoEditor(".kendoEditor");//initialize kendo editor        
        this.inpfocus.nativeElement.focus();
    }
    InitTicketForm() {
        this.TicketForm = this.fb.group({
            TicketID: [0],
            StatusID: [null],
            TicketModeID: [1],
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
            Description: [""]
        });
    }

    async bindData() {
        try {
            this.service.App.ShowLoader = true;
            this.model = await this.service.Data.ExecuteAPI_Post<Common_Ticket_Detail_Model>("Ticket/Get_Ticket_Detail_Data", { Is_Agent: false });
            this.SetDefaultValue();

            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    async SaveTicket() {
        try {
            this.service.App.ShowLoader = true;

            let obj = this.TicketForm.getRawValue();
            obj.Description = $("#txtDesc").data("kendoEditor").value();

            let res = await this.service.Data.ExecuteAPI_Post<any>("Ticket/Ticket_Requester_Create", { model: obj, attachment: this.lstAttachments ? this.lstAttachments : [] });
            if (res) {//tuple<long,string>          
                this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgTicketCreated"));
                window.setTimeout(() => {
                    if (this.Is_SaveAndclose) {
                        this.router.navigate(["/requester/ticket"]);
                    }
                    else {
                        this.router.navigate(["/requester/ticket/detail", res.Item2]);//res.m_Item2//redirect to ticket detail page                
                    }
                }, 500);
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
            }
            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    SetDefaultValue() {
        let Status = this.model.StatusList.find(d => d.Is_Default);
        if (Status) { this.TicketForm.controls["StatusID"].setValue(Status == null ? null : Status.Value); }

        let Level = this.model.LevelList.find(d => d.Is_Default);
        if (Level) { this.TicketForm.controls["LevelID"].setValue(Level == null ? null : Level.Value); }

        let RequestType = this.model.RequestTypeList.find(d => d.Is_Default);
        if (RequestType) { this.TicketForm.controls["RequestTypeID"].setValue(RequestType == null ? null : RequestType.Value); }

        let Category = this.model.CategoryList.find(d => d.Is_Default);
        if (Category) { this.TicketForm.controls["CategoryID"].setValue(Category == null ? null : Category.Value); }

        let Impact = this.model.ImpactList.find(d => d.Is_Default);
        if (Impact) { this.TicketForm.controls["ImpactID"].setValue(Impact == null ? null : Impact.Value); }

        let Priority = this.model.PriorityList.find(d => d.Is_Default);
        if (Priority) { this.TicketForm.controls["PriorityID"].setValue(Priority == null ? null : Priority.Value); }

        let Department = this.model.DepartmentList.find(d => d.Is_Default);
        if (Department) { this.TicketForm.controls["DepartmentID"].setValue(Department == null ? null : Department.Value); }

        let Urgency = this.model.UrgencyList.find(d => d.Is_Default);
        if (Urgency) { this.TicketForm.controls["UrgencyID"].setValue(Urgency == null ? null : Urgency.Value); }

        let Location = this.model.LocationList.find(d => d.Is_Default);
        if (Location) { this.TicketForm.controls["LocationID"].setValue(Location == null ? null : Location.Value); }

        if (Category) { this.Change_Category(Category.Value); }
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

    //Attachments
    @ViewChild('flAttachment') flAttachment: ElementRef;
    isAttachLoading: boolean = false; lstAttachments: Array<any> = [];
    Not_AllowedExtensions: Array<string> = [];
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

    RemoveAttachment(item: any, type: string) {
        this.lstAttachments = this.lstAttachments.filter(d => d != item);
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
