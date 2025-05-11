import { Component, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  NgForm,
} from "@angular/forms";
import { SystemService } from "../../shared/SystemService";
import { GridFilter } from "../../shared/common_model";
import { ModalDialog } from "../../shared/modal.dialog";
import { AlertType } from "../../shared/common_model";
import { FlatpickrOptions } from "ng2-flatpickr";

declare var $: JQueryStatic;

@Component({
  templateUrl: "./notification.html",
})
export class NotificationComponent {
  isLoading = false;
  allItems: Array<Notification_Model> = [];
  txtSearch = "";
  totalitems: number;
  gridFilter: Array<GridFilter> = [];
  Is_SaveAndAddNew: boolean = false;
  minStDate;
  minEndDate;

  dtStart_Config: FlatpickrOptions = this.service.CommonDateConfig();
  dtEnd_Config: FlatpickrOptions = this.service.CommonDateConfig();
  @ViewChild("stDate") stDate;
  @ViewChild("edDate") edDate;
  constructor(
    public fb: UntypedFormBuilder,
    public service: SystemService,
    public router: Router
  ) {
    this.service.GoTo_ScrollTop(window);

    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblSubject",
      ColumnName: "Subject",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblStartDate",
      ColumnName: "StartDate",
      Condition: "no",
      Type: "date",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblEndDate",
      ColumnName: "EndDate",
      Condition: "no",
      Type: "date",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblIsActive",
      ColumnName: "Is_Active",
      Condition: "no",
      Type: "bool",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblIsClientVisible",
      ColumnName: "Is_Client_Visible",
      Condition: "no",
      Type: "bool",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblIsAgentVisible",
      ColumnName: "Is_Agent_Visible",
      Condition: "no",
      Type: "bool",
      Value: "",
      Is_Visible: true,
    });

    let cdt = new Date();
    cdt.setDate(cdt.getDate() + 1);
    this.minStDate = this.service.Date_Format(new Date(), "yyyy-MM-dd");
    this.minEndDate = this.service.Date_Format(cdt, "yyyy-MM-dd");

    this.initForm();
  }
  ngOnInit() {
    this.bindData();
  }
  ngAfterViewInit() {
    this.setKendoEditor(".kendoEditor"); //initialize kendo editor
  }
  SetDateOptions() {
    this.Set_StartDate(this.minStDate);
    this.stDate.flatpickr.set("onChange", (dtarr, dt, instance) => {
      this.NotificationForm.controls["StartDate"].setValue(dt);

      let cdt: any = new Date(dt);
      cdt.setDate(cdt.getDate() + 1);
      this.Set_EndDate(this.service.Date_Format(cdt, "yyyy-MM-dd"), dt);
    });

    this.Set_EndDate(this.minEndDate, this.minStDate);
    this.edDate.flatpickr.set("onChange", (dtarr, dt, instance) => {
      this.NotificationForm.controls["EndDate"].setValue(dt);
    });
  }
  Set_StartDate(dt: any) {
    this.stDate.flatpickr.set("minDate", dt);
    this.stDate.flatpickr.setDate(dt);
    this.NotificationForm.controls["StartDate"].setValue(dt);
  }
  Set_EndDate(dt: any, minDt: any) {
    this.edDate.flatpickr.set("minDate", minDt);
    this.edDate.flatpickr.setDate(dt);
    this.NotificationForm.controls["EndDate"].setValue(dt);
  }

  async bindData(isRefresh = false) {
    try {
      this.isLoading = true;
      let res = await this.service.Data.ExecuteAPI_Post<
        Array<Notification_Model>
      >("Admin/Get_Notification_List");
      if (res) {
        this.allItems = res;
        this.totalitems = res.length;

        if (isRefresh) {
          this.service.App.refreshGrid.emit();
        }
      }
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }
  }
  pageChanged(obj: any) {}

  //Add/Edit
  NotificationForm: UntypedFormGroup;
  isEdit = false;
  @ViewChild("f") form: NgForm;
  @ViewChild("modalAdd") modalAdd: ModalDialog;
  initForm() {
    this.NotificationForm = this.fb.group({
      NotificationID: [0],
      Subject: ["", Validators.required],
      StartDate: [null, Validators.required],
      EndDate: [null, Validators.required],
      Description: [""],
      Is_Active: [true],
      Is_Client_Visible: [true],
      Is_Agent_Visible: [true],
    });

    window.setTimeout(() => {
      this.SetDateOptions();
    }, 10); //Date Configs
  }
  AddRow() {
    this.isEdit = false;
    this.clearForm();
    this.modalAdd.open();
    this.Focus_Element();

    //kendo oeditor refresh when editor in popup
    this.refreshKendoEditor(".kendoEditor");
    this.setKendoEditorValue(".kendoEditor", "");

    this.Set_StartDate(this.minStDate);
    this.Set_EndDate(this.minEndDate, this.minStDate);
  }
  EditRow() {
    this.isEdit = true;
    let selectedRow = this.allItems.filter((x) => x.selectedRow);
    if (selectedRow.length == 0) {
      this.service.showMessage(
        AlertType.Warning,
        this.service.Translator.instant("msgSelectRow")
      );
    } else if (selectedRow.length > 1) {
      this.service.showMessage(
        AlertType.Warning,
        this.service.Translator.instant("msgSelectOnlyOneRow")
      );
    } else {
      let ID = selectedRow[0]["NotificationID"];
      this.EditNotification(ID);
    }
  }
  EditRowDBClick(RowItem: any) {
    this.isEdit = true;
    if (!RowItem.isTrusted && RowItem) {
      this.EditNotification(RowItem.NotificationID);
    }
  }
  async EditNotification(NotificationID) {
    try {
      let res = await this.service.Data.ExecuteAPI_Post<Notification_Model>(
        "Admin/Get_Notification_ByID",
        { NotificationID: NotificationID }
      );
      if (res) {
        this.NotificationForm.patchValue(res);
      }
      this.modalAdd.open();
      this.Focus_Element();

      //kendo oeditor refresh when editor in popup
      this.refreshKendoEditor(".kendoEditor");
      this.setKendoEditorValue(".kendoEditor", res.Description);
      if (res) {
        window.setTimeout(() => {
          //Set dates
          let stdt = this.service.Date_Format(res.StartDate, "yyyy-MM-dd");
          let enddt = this.service.Date_Format(res.EndDate, "yyyy-MM-dd");
          this.Set_StartDate(stdt);
          this.Set_EndDate(enddt, stdt);
        }, 60);
      }
    } catch (e) {
      this.service.showMessage(
        AlertType.Error,
        this.service.Translator.instant("msgError")
      );
    }
  }

  async SaveNotification() {
    try {
      this.service.App.ShowLoader = true;

      let obj = this.NotificationForm.getRawValue();
      obj.NotificationID = obj.NotificationID == null ? 0 : obj.NotificationID;
      obj.Description = $(".kendoEditor").data("kendoEditor").value();

      let index = this.allItems.findIndex(
        (d) =>
          d.Subject == obj.Subject && d.NotificationID != obj.NotificationID
      ); //check subject exists or not
      if (index < 0) {
        let res = await this.service.Data.ExecuteAPI_Post<number>(
          "Admin/Notification_Update",
          obj
        );
        this.service.App.ShowLoader = false;
        if (res > 0) {
          if (!this.Is_SaveAndAddNew) {
            this.modalAdd.close();
          }
          this.service.showMessage(
            AlertType.Success,
            this.service.Translator.instant("msgNotificationSaved")
          );
          this.clearForm();
          this.refreshGrid();
        } else {
          this.service.showMessage(
            AlertType.Error,
            this.service.Translator.instant("msgError")
          );
        }
      } else {
        if (index > -1) {
          this.service.showMessage(
            AlertType.Error,
            this.service.Translator.instant(
              "msgNotificationSubjectAlreadyExists"
            )
          );
        }
      }
      this.Is_SaveAndAddNew = false;
      this.service.App.ShowLoader = false;
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }
  async DeleteRow() {
    try {
      let selectedRow = this.allItems
        .filter((x) => x.selectedRow)
        .map((d) => d.NotificationID)
        .join();
      if (selectedRow.length == 0) {
        this.service.showMessage(
          AlertType.Warning,
          this.service.Translator.instant("msgSelectRow")
        );
      } else {
        if (
          confirm(this.service.Translator.instant("msgDeleteSelectedItems"))
        ) {
          this.service.App.ShowLoader = true;
          let res = await this.service.Data.ExecuteAPI_Post<number>(
            "Admin/Notification_Delete",
            { NotificationIDs: selectedRow }
          );
          if (res > 0) {
            this.service.showMessage(
              AlertType.Success,
              this.service.Translator.instant("msgNotificationDeleted")
            );
            this.refreshGrid();
          } else {
            this.service.showMessage(
              AlertType.Error,
              this.service.Translator.instant("msgError")
            );
          }
          this.service.App.ShowLoader = false;
        }
      }
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }

  clearForm() {
    this.Is_SaveAndAddNew = false;
    this.form.resetForm();
    this.NotificationForm.controls["Is_Active"].setValue(true);
    this.NotificationForm.controls["Is_Client_Visible"].setValue(true);
    this.NotificationForm.controls["Is_Agent_Visible"].setValue(true);
    this.setKendoEditorValue(".kendoEditor", "");
  }
  refreshGrid() {
    this.bindData(true);
  }

  //Kendo Editor Set, Refresh and Get Value
  setKendoEditor(id) {
    window.setTimeout(() => {
      $(id)["kendoEditor"]({
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
          "viewHtml",
          "foreColor",
          "backColor",
          "fontName",
          "fontSize",
        ],
      });
    }, 200);
  }
  refreshKendoEditor(id) {
    $(id).data("kendoEditor").refresh();
  }
  setKendoEditorValue(id, value) {
    $(id).data("kendoEditor").value(value);
  }
  getKendoEditorValue(id) {
    $(id).data("kendoEditor").value();
  }

  @ViewChild("focus") inpfocus: ElementRef;
  Focus_Element() {
    window.setTimeout(() => {
      this.inpfocus.nativeElement.focus();
    }, 50);
  }
}

interface Notification_Model {
  NotificationID: number;
  Subject: string;
  StartDate: Date;
  EndDate: Date;
  Description: string;
  Is_Active: boolean;
  Is_Client_Visible: boolean;
  Is_Agent_Visible: boolean;
  CreatedDate: Date;
  selectedRow: boolean;
}
