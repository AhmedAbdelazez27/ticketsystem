import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SystemService } from '../shared/SystemService';
import { KeyValueDefault, Description_Model, Solution_Model } from '../shared/common_model';
import { AlertType } from '../shared/common_model';
import { FocusInvalidDirective } from '../shared/app.directive';
declare var $: JQueryStatic;

@Component({
    templateUrl: './solution_detail.html',
    providers: [FocusInvalidDirective]
})

export class Solution_DetailComponent {
    isLoading = false; Is_SaveAndclose: boolean = false;
    model: Common_Solution_Detail_Model;
    Filter_SubCategory_List: Array<KeyValueDefault> = []; Filter_ItemList: Array<KeyValueDefault> = [];
    minStDate: Date = new Date(); AttachmentList: Array<any> = [];
    SolutionForm: UntypedFormGroup; DisplaySolutionID: string; SolutionID: number;
    @ViewChild('focus') inpfocus: ElementRef;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router) {
        this.service.GoTo_ScrollTop(window);
        this.DisplaySolutionID = this.route.snapshot.paramMap.get("id");
        this.InitSolutionForm();
    }
    ngOnInit() {
        setTimeout(() => { this.bindData(); });
    }
    ngAfterViewInit() {
        this.inpfocus.nativeElement.focus();
    }
    InitSolutionForm() {
        this.SolutionForm = this.fb.group({
            SolutionID: [0],
            DisplaySolutionID: [""],
            Subject: ["", Validators.required],
            Description: [""],
            CategoryID: [0, Validators.compose([Validators.required, Validators.min(1)])],
            SubCategoryID: [0],
            ItemID: [0],
            MetaKeywords: [""],
            Comments: [""],
            Is_Client_Visible: [false],
            Is_Active: [true]
        });
    }

    async bindData() {
        try {
            this.service.App.ShowLoader = true;
            this.model = await this.service.Data.ExecuteAPI_Post<Common_Solution_Detail_Model>("Solution/Get_Solution_Detail_Data");
            this.SetDefaultValue();

            let res = await this.service.Data.ExecuteAPI_Post<Solution_Model>("Solution/Get_Solution_ByID", { SolutionID: 0, DisplaySolutionID: this.DisplaySolutionID });
            if (res) {
                this.SolutionForm.patchValue(res);
                this.bindDescription();//set description value
                this.SolutionID = res.SolutionID;
                if (res.CategoryID) { this.Change_Category(res.CategoryID, res.SubCategoryID); }
            }
            this.bindSolutionAttachment();
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    async bindDescription() {
        try {
            let res = await this.service.Data.ExecuteAPI_Post<Description_Model>("Dashboard/Get_DescriptionByID", { ModuleType: "solution", ID: this.DisplaySolutionID });
            if (res) {
                this.SolutionForm.controls["Description"].setValue(res.Description);
                setTimeout(() => { this.service.setKendoEditor(".kendoEditor"); }, 10);//initialize kendo editor                
                window.setTimeout(() => { this.service.App.ShowLoader = false }, 200);
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    SetDefaultValue() {
        let Category = this.model.CategoryList.find(d => d.Is_Default);
        this.SolutionForm.controls["CategoryID"].setValue(Category == null ? 0 : Category.Value);
        window.setTimeout(() => { if (Category) { this.Change_Category(Category.Value); } }, 10);
    }
    async SaveSolution() {
        try {
            this.service.App.ShowLoader = true;
            let obj = this.SolutionForm.getRawValue();
            obj.Description = $("#txtDesc").data("kendoEditor").value();

            if (obj.Description) {
                let res = await this.service.Data.ExecuteAPI_Post<any>("Solution/Solution_Update", { model: obj, attachment: this.lstAttachments ? this.lstAttachments : [] });
                if (res) {//tuple<long,string>
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgSolutionUpdated"));
                    if (this.Is_SaveAndclose) {
                        window.setTimeout(() => { this.router.navigate(["/solution"]); }, 300);
                    }
                    else {
                        if (this.lstAttachments.length > 0) { this.lstAttachments = []; this.bindSolutionAttachment(); }
                        this.service.GoTo_ScrollTop(window);
                    }
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
                }
            }
            else {
                this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgSolutionNotEmpty"));
            }

            this.service.App.ShowLoader = false;
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    Change_Category(CategoryID: number, SubCategoryID: number = 0) {
        this.Filter_SubCategory_List = this.model.SubCategoryList.filter(d => d.MainID == CategoryID);
        this.Change_SubCategory(SubCategoryID > 0 ? SubCategoryID : 0);
    }
    Change_SubCategory(SubCategoryID: number) {
        this.Filter_ItemList = this.model.ItemList.filter(d => d.MainID == SubCategoryID);
        if (this.Filter_ItemList.length == 0) { this.SolutionForm.controls["ItemID"].setValue(0); }
    }

    BackToList() {
        this.router.navigate(['/solution']);
    }
    async DeleteRow() {
        try {
            if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
                this.service.App.ShowLoader = true;
                let res = await this.service.Data.ExecuteAPI_Post<number>("Solution/Solution_Delete", { SolutionIDs: this.SolutionID });
                if (res > 0) {
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgSolutionDeleted"));
                    window.setTimeout(() => { this.BackToList(); }, 500);
                }
                else {
                    this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorSolutionsUsedInAnotherTable"));
                }
                this.service.App.ShowLoader = false;
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }

    //CloneSolution
    async CloneSolution() {
        try {
            if (confirm(this.service.Translator.instant("msgClonethisSolution"))) {
                this.service.App.ShowLoader = true;
                let res = await this.service.Data.ExecuteAPI_Post<any>("Solution/Solution_Clone", { SolutionID: this.SolutionID });
                if (res) {//tuple<long,string>
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgSolutionCloned"));

                    this.SolutionForm.controls["SolutionID"].setValue(res.Item1);
                    this.SolutionForm.controls["DisplaySolutionID"].setValue(res.Item2);

                    this.service.GoTo_ScrollTop(window);
                    this.router.navigate(["/solution"]);
                    window.setTimeout(() => { this.router.navigate(["/solution/detail", res.Item2]); }, 20);
                }
                this.service.App.ShowLoader = false;
            }
        } catch (e) {
            this.service.App.ShowLoader = false;
        }
    }
    //Print
    Print() {
        let url = this.service.Settings.API_URL + "/Home/Print?ids=" + this.SolutionID + "&type=solution&lang=" + this.service.CL;
        window.open(url, "Print Preview");
    }

    //Attachments
    @ViewChild('flAttachment') flAttachment: ElementRef;
    isAttachLoading: boolean = false; lstAttachments: Array<any> = [];
    Not_AllowedExtensions: Array<string> = [];
    async bindSolutionAttachment() {
        this.Not_AllowedExtensions = this.service.Get_NotAllowedExtensions();
        this.AttachmentList = await this.service.Data.ExecuteAPI_Post<Array<any>>("Solution/Get_SolutionAttachment_ByID", { SolutionID: this.SolutionID });
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
        if (type == 'new') {
            this.lstAttachments = this.lstAttachments.filter(d => d != item);
        }
        else if (type == 'old') {
            try {
                if (confirm(this.service.Translator.instant("msgDeleteSelectedAttachments"))) {
                    this.isAttachLoading = true;
                    let res = await this.service.Data.ExecuteAPI_Post<number>("Solution/SolutionAttachment_Delete", { SolutionAttachmentID: item.SolutionAttachmentID, FileName: item.FileName });
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

    UserSelectDone(item: any) { }
}

interface Common_Solution_Detail_Model {
    CategoryList: Array<KeyValueDefault>;
    SubCategoryList: Array<KeyValueDefault>;
    ItemList: Array<KeyValueDefault>;
}

