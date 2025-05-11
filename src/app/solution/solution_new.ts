import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SystemService } from '../shared/SystemService';
import { KeyValueDefault } from '../shared/common_model';
import { AlertType } from '../shared/common_model';
import { FocusInvalidDirective } from '../shared/app.directive';
declare var $: JQueryStatic;

@Component({
    templateUrl: './solution_new.html',
    providers: [FocusInvalidDirective]
})

export class Solution_NewComponent {
    isLoading = false; Is_SaveAndclose: boolean = false;
    model: Common_Solution_Detail_Model;
    Filter_SubCategory_List: Array<KeyValueDefault> = []; Filter_ItemList: Array<KeyValueDefault> = [];
    minStDate: Date = new Date();
    SolutionForm: UntypedFormGroup;
    @ViewChild('focus') inpfocus: ElementRef;
    constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router) {
        this.service.GoTo_ScrollTop(window);
        this.Not_AllowedExtensions = this.service.Get_NotAllowedExtensions();
        this.InitSolutionForm();
    }
    ngOnInit() {
        setTimeout(() => { this.bindData(); });
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.service.setKendoEditor(".kendoEditor");//initialize kendo editor            
            this.inpfocus.nativeElement.focus();
        }, 10);
    }
    InitSolutionForm() {
        this.SolutionForm = this.fb.group({
            SolutionID: [0],
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

            this.service.App.ShowLoader = false;
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
            let obj = this.SolutionForm.getRawValue();
            obj.Description = $("#txtDesc").data("kendoEditor").value();

            if (obj.Description) {
                this.service.App.ShowLoader = true;
                let res = await this.service.Data.ExecuteAPI_Post<any>("Solution/Solution_Update", { model: obj, attachment: this.lstAttachments ? this.lstAttachments : [] });
                if (res) {//tuple<long,string>
                    window.setTimeout(() => {
                        if (this.Is_SaveAndclose) {
                            this.router.navigate(["/solution"]);
                        }
                        else {
                            this.router.navigate(["/solution/detail", res.Item2]);//redirect to Solution detail page
                        }
                    }, 300);
                    this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgSolutionCreated"));
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


    UserSelectDone(item: any) { }
}

interface Common_Solution_Detail_Model {
    CategoryList: Array<KeyValueDefault>;
    SubCategoryList: Array<KeyValueDefault>;
    ItemList: Array<KeyValueDefault>;
}