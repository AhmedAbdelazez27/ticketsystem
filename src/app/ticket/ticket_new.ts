import { Component, ViewChild, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Location } from "@angular/common";
import { SystemService } from "../shared/SystemService";
import { KeyValueDefault, UserManagement_Model } from "../shared/common_model";

import { User_Technician_ListComponent } from "../admin_setting/user/user_technician_list";
import { AlertType } from "../shared/common_model";
import { FlatpickrOptions } from "ng2-flatpickr";
import { FocusInvalidDirective } from "../shared/app.directive";
declare var $: JQueryStatic;

@Component({
  templateUrl: "./ticket_new.html",
  providers: [FocusInvalidDirective],
})
export class Ticket_NewComponent {
  isLoading = false;
  Is_SaveAndclose: boolean = false;
  model: Common_Ticket_Detail_Model;
  AgentList: Array<UserManagement_Model> = [];
  selectedAgent: UserManagement_Model;
  ClientList: Array<UserManagement_Model> = [];
  selectedClient: UserManagement_Model;
  Filter_SubCategory_List: Array<KeyValueDefault> = [];
  Filter_ItemList: Array<KeyValueDefault> = [];
  minStDate: Date = new Date();
  TicketForm: UntypedFormGroup;
  @ViewChild(User_Technician_ListComponent)
  public UserSelect: User_Technician_ListComponent;
  DueDate_Config: FlatpickrOptions = this.service.CommonDateConfig();
  @ViewChild("dueDate") dueDate;
  @ViewChild("focus") inpfocus: ElementRef;
  constructor(
    public fb: UntypedFormBuilder,
    public service: SystemService,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location
  ) {
    this.service.GoTo_ScrollTop(window);
    this.InitTicketForm();
    this.Not_AllowedExtensions = this.service.Get_NotAllowedExtensions();
  }
  ngOnInit() {
    setTimeout(() => {
      this.bindData();
    });
  }
  ngAfterViewInit() {
    this.service.setKendoEditor(".kendoEditor"); //initialize kendo editor
    this.SetDateOptions();
    setTimeout(() => {
      this.inpfocus.nativeElement.focus();
    }, 100);
  }
  InitTicketForm() {
    this.TicketForm = this.fb.group({
      TicketID: [0],
      RequestedName: ["", Validators.required],
      RequestedUser: [
        null,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      RequestedUserEmail: [""], //Only for send mail
      AssignedName: [""],
      AssignedUser: [null],
      AssignedUserEmail: [""], //Only for send mail
      StatusID: [
        null,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
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
      DueDate: [""],
      Subject: ["", Validators.required],
      Description: [""],
      SolutionDescription: [""],
    });
  }

  SetDateOptions() {
    // this.dueDate.flatpickr.set("onChange", (dtarr, dt, instance) => {
    //     this.TicketForm.controls['DueDate'].setValue(dt);
    // });
  }
  async bindData() {
    try {
      this.service.App.ShowLoader = true;

      this.model =
        await this.service.Data.ExecuteAPI_Post<Common_Ticket_Detail_Model>(
          "Ticket/Get_Ticket_Detail_Data",
          { Is_Agent: true }
        );
      this.SetDefaultValue();

      let res1 = await this.service.Data.ExecuteAPI_Post<
        Array<UserManagement_Model>
      >("Admin/Get_UserSelection_List", { Is_Agent: false });
      this.ClientList = res1;
      this.AgentList = res1.filter((d) => d.Is_Agent);

      this.service.App.ShowLoader = false;
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }
  async SaveTicket() {
    let obj = this.TicketForm.getRawValue();
    obj.Description = $("#txtDesc").data("kendoEditor").value();
    obj.SolutionDescription = $("#txtSolDesc").data("kendoEditor").value();
    if (obj.DueDate) {
      obj.DueDate =
        obj.DueDate + " " + this.service.Date_Format(new Date(), "HH:mm:ss");
    }

    try {
      this.service.App.ShowLoader = true;
      let res = await this.service.Data.ExecuteAPI_Post<any>(
        "Ticket/Ticket_Create",
        {
          model: obj,
          attachment: this.lstAttachments ? this.lstAttachments : [],
        }
      );
      if (res) {
        //tuple<long,string>
        this.service.showMessage(
          AlertType.Success,
          this.service.Translator.instant("msgTicketCreated")
        );
        window.setTimeout(() => {
          if (this.Is_SaveAndclose) {
            this.router.navigate(["/ticket"]);
          } else {
            this.router.navigate(["/ticket/detail", res.Item2]);
          }
        }, 500);
      } else {
        this.service.showMessage(
          AlertType.Error,
          this.service.Translator.instant("msgError")
        );
      }

      this.service.App.ShowLoader = false;
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }
  SetDefaultValue() {
    let Status = this.model.StatusList.find((d) => d.Is_Default);
    if (Status) {
      this.TicketForm.controls["StatusID"].setValue(Status.Value);
    }

    let Level = this.model.LevelList.find((d) => d.Is_Default);
    if (Level) {
      this.TicketForm.controls["LevelID"].setValue(Level.Value);
    }

    let RequestType = this.model.RequestTypeList.find((d) => d.Is_Default);
    if (RequestType) {
      this.TicketForm.controls["RequestTypeID"].setValue(RequestType.Value);
    }

    let Category = this.model.CategoryList.find((d) => d.Is_Default);
    if (Category) {
      this.TicketForm.controls["CategoryID"].setValue(Category.Value);
    }

    let Impact = this.model.ImpactList.find((d) => d.Is_Default);
    if (Impact) {
      this.TicketForm.controls["ImpactID"].setValue(Impact.Value);
    }

    let Priority = this.model.PriorityList.find((d) => d.Is_Default);
    if (Priority) {
      this.TicketForm.controls["PriorityID"].setValue(Priority.Value);
    }

    let Department = this.model.DepartmentList.find((d) => d.Is_Default);
    if (Department) {
      this.TicketForm.controls["DepartmentID"].setValue(Department.Value);
    }

    let Urgency = this.model.UrgencyList.find((d) => d.Is_Default);
    if (Urgency) {
      this.TicketForm.controls["UrgencyID"].setValue(Urgency.Value);
    }

    let Location = this.model.LocationList.find((d) => d.Is_Default);
    if (Location) {
      this.TicketForm.controls["LocationID"].setValue(Location.Value);
    }

    if (Category) {
      this.Change_Category(Category.Value);
    }
  }

  Change_Category(CategoryID: number, SubCategoryID: number = 0) {
    this.Filter_SubCategory_List = this.model.SubCategoryList.filter(
      (d) => d.MainID == CategoryID
    );
    this.Change_SubCategory(SubCategoryID > 0 ? SubCategoryID : null);
  }
  Change_SubCategory(SubCategoryID: number) {
    this.Filter_ItemList = this.model.ItemList.filter(
      (d) => d.MainID == SubCategoryID
    );
    if (this.Filter_ItemList.length == 0) {
      this.TicketForm.controls["ItemID"].setValue(null);
    }
  }

  BackToList() {
    this.router.navigate(["/ticket"]);
  }

  //AutoComplete Requester & Technician
  NoRequesterFound(item: any) {
    //this.TicketForm.controls["RequestedUser"].setValue(0); this.TicketForm.controls["RequestedName"].setValue("");
  }
  //onSelectRequester($event: TypeaheadMatch) {
  onSelectRequester($event: any) {
    let obj: any = {};
    obj.user = $event.item;
    obj.isTechnician = false;
    this.UserSelectDone(obj);
  }
  NoTechnicianFound(event: any) {
    //this.TicketForm.controls["AssignedUser"].setValue(0); this.TicketForm.controls["AssignedName"].setValue("");
  }
  //onSelectTechnician($event: TypeaheadMatch) {
  onSelectTechnician($event: any) {
    let obj: any = {};
    obj.user = $event.item;
    obj.isTechnician = true;
    this.UserSelectDone(obj);
  }

  //Bind User & Technician Grid
  OpenUserList(type: string) {
    if (type == "user") {
      this.UserSelect.open(false, this.ClientList);
    } else if (type == "technician") {
      this.UserSelect.open(true, this.AgentList);
    }
  }
  ViewUser() {
    if (this.selectedClient) {
      this.UserSelect.ViewRow(this.selectedClient);
    }
  }
  UserSelectDone(item: any) {
    if (item.isTechnician) {
      this.selectedAgent = item.user;
      this.TicketForm.controls["AssignedName"].setValue(
        this.selectedAgent.DisplayName
      );
      this.TicketForm.controls["AssignedUser"].setValue(
        this.selectedAgent.UserID
      );
      this.TicketForm.controls["AssignedUserEmail"].setValue(
        this.selectedAgent.Email
      );
    } else {
      this.selectedClient = item.user;
      this.TicketForm.controls["RequestedName"].setValue(
        this.selectedClient.DisplayName
      );
      this.TicketForm.controls["RequestedUser"].setValue(
        this.selectedClient.UserID
      );
      this.TicketForm.controls["RequestedUserEmail"].setValue(
        this.selectedClient.Email
      );
    }
  }
  AssignCurrentUser() {
    this.selectedAgent = <UserManagement_Model>{
      UserID: this.service.Account.UserID,
      DisplayName: this.service.Account.DisplayName,
      UserName: this.service.Account.UserName,
      Email: this.service.Account.Email,
    };

    this.TicketForm.controls["AssignedName"].setValue(
      this.selectedAgent.DisplayName
    );
    this.TicketForm.controls["AssignedUser"].setValue(
      this.selectedAgent.UserID
    );
    this.TicketForm.controls["AssignedUserEmail"].setValue(
      this.selectedAgent.Email
    );
  }

  //Attachments
  @ViewChild("flAttachment") flAttachment: ElementRef;
  isAttachLoading: boolean = false;
  lstAttachments: Array<any> = [];
  Not_AllowedExtensions: Array<string> = [];
  fileChange(event: any) {
    let files = event.target.files; // [].slice.call(event.target.files);
    for (var i = 0; i < files.length; i++) {
      let file = files[i];
      this.ReadFiles(file); //read files
    }
  }
  ReadFiles(file) {
    this.isAttachLoading = true;
    var myReader: FileReader = new FileReader();
    let extension = file.name.replace(/^.*\./, "");
    if (this.Not_AllowedExtensions.indexOf(extension.toLowerCase()) < 0) {
      myReader.readAsDataURL(file);
      myReader.onloadend = (e) => {
        this.lstAttachments.push({
          name: file.name,
          type: file.type,
          extension: extension,
          size: file.size,
          value: <string>myReader.result,
        });
        this.isAttachLoading = false;
      };
    } else {
      this.service.showMessage(
        AlertType.Error,
        this.service.Translator.instant("msgFileExtensionNotSupport")
      );
      this.isAttachLoading = false;
    }
  }

  RemoveAttachment(item: any, type: string) {
    this.lstAttachments = this.lstAttachments.filter((d) => d != item);
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
