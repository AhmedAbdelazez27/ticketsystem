import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
} from "@angular/core";
import { Location } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  NgForm,
} from "@angular/forms";
import { SystemService } from "../shared/SystemService";
import {
  GridFilter,
  KeyValue,
  KeyValueString,
  Ticket_Model,
  Ticket_Model_Export,
} from "../shared/common_model";
import { ModalDialog } from "../shared/modal.dialog";
import { ticket_commongrid_Component } from "../shared/grid/ticket_commongrid";

import { Row_ViewComponent } from "../dashboard/row_view";
import { AlertType } from "../shared/common_model";
declare var $: JQueryStatic;

@Component({
  templateUrl: "./ticket_list.html",
})
export class Ticket_ListComponent {
  isLoading = false;
  sub: any;
  allItems_main: Array<Ticket_Model> = [];
  allItems: Array<Ticket_Model> = [];
  txtSearch = "";
  totalitems: number;
  gridFilter: Array<GridFilter> = [];
  FilterList: Array<KeyValueString> = [];
  selectedFilterType: string = "";
  selectedFilterText: string = "lblAllTickets";
  flType: string = "";
  AgentList: Array<any> = [];
  selectedAgent: number = 0;
  @ViewChild(Row_ViewComponent) public Row_View: Row_ViewComponent;
  @ViewChild("commongrid") commongrid: ticket_commongrid_Component;
  constructor(
    public fb: UntypedFormBuilder,
    public service: SystemService,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location
  ) {
    this.service.GoTo_ScrollTop(window);

    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblAttachment",
      ColumnName: "HasAttachment",
      Type: "icon",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblTicketID",
      ColumnName: "DisplayTicketID",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblSubject",
      ColumnName: "Subject",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblRequestType",
      ColumnName: "RequestTypeName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblStatus",
      ColumnName: "StatusName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblRequester",
      ColumnName: "RequestedName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblAssignedTo",
      ColumnName: "AssignedName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblCreatedBy",
      ColumnName: "CreatedUserName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblPriority",
      ColumnName: "PriorityName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: true,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblCategory",
      ColumnName: "CategoryName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblSubCategory",
      ColumnName: "SubCategoryName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblItem",
      ColumnName: "ItemName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblUrgency",
      ColumnName: "UrgencyName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblImpact",
      ColumnName: "ImpactName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblDepartment",
      ColumnName: "DepartmentName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblLevel",
      ColumnName: "LevelName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblLocation",
      ColumnName: "LocationName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblTicketMode",
      ColumnName: "TicketModeName",
      Condition: "no",
      Type: "string",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblCreatedDate",
      ColumnName: "CreatedDate",
      Condition: "no",
      Type: "datetime",
      Value: "",
      Is_Visible: true,
      Width: 11,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblDueDate",
      ColumnName: "DueDate",
      Condition: "no",
      Type: "datetime",
      Value: "",
      Is_Visible: false,
    });
    this.gridFilter.push(<GridFilter>{
      DisplayText: "lblClosedDate",
      ColumnName: "ClosedDate",
      Condition: "no",
      Type: "datetime",
      Value: "",
      Is_Visible: false,
    });

    //get-set last remembered columns
    this.service.App.get_cached_column("ticket_colums", this.gridFilter);

    this.flType = this.route.snapshot.queryParamMap.get("type");
    if (this.flType) {
      this.location.replaceState("/ticket");
    }

    this.bindFilterList();
  }
  ngOnInit() {
    this.bindData();
    this.InitCloseTicketForm();
    this.sub = this.service.Data.registerReceiver<any>(
      "Get_Language_Refresh"
    ).subscribe((res) => {
      if (
        res.UserID == this.service.Account.UserID &&
        this.router.url.toLowerCase() == "/ticket"
      ) {
        $(".subtooltip")["webuiPopover"]("destroy");
        this.bindToolTip();
      }
    });
  }
  ngAfterViewInit() {}
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  async bindData(isRefresh = false) {
    try {
      this.isLoading = true;
      let account = this.service.Account;
      let res = await this.service.Data.ExecuteAPI_Post<Array<Ticket_Model>>(
        "Ticket/Get_Ticket_List",
        { Is_Agent: account.Is_Agent, Is_Client: account.Is_Client }
      );
      if (res) {
        this.allItems_main = this.allItems = res;
        this.totalitems = res.length;

        //Filter change come from dashboard
        if (this.flType) {
          this.selectedFilterType = this.flType;
          this.selectedFilterText = this.FilterList.find(
            (d) => d.Value == this.flType
          ).Key;
          this.FilterChange(this.selectedFilterType);
          this.flType = "";
        } else {
          if (isRefresh) {
            this.FilterChange(this.selectedFilterType);
          }
        }
      }
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }
  }
  pageChanged(obj: any) {
    this.bindToolTip();
  }
  async bindFilterList() {
    this.FilterList.push({ Key: "lblAllTickets", Value: "" });
    this.FilterList.push({ Key: "lblOpenTickets", Value: "open" });
    this.FilterList.push({ Key: "lblCompletedTickets", Value: "closed" });
    this.FilterList.push({ Key: "lblPendingTickets", Value: "pending" });
    this.FilterList.push({ Key: "lblUnassignedTickets", Value: "unassign" });
    this.FilterList.push({ Key: "lblOverdueTickets", Value: "overdue" });
    this.FilterList.push({ Key: "lblTicketsDueToday", Value: "duetoday" });
    this.FilterList.push({ Key: "lblAssginedToMeTickets", Value: "assignme" });
    this.FilterList.push({ Key: "lblMyOpenTickets", Value: "myopen" });
    this.FilterList.push({ Key: "lblMyCompletedTickets", Value: "myclosed" });
    this.FilterList.push({
      Key: "lblMyOpenAndUnassigned",
      Value: "myunassign",
    });
    this.FilterList.push({ Key: "lblMyOverdueTickets", Value: "myoverdue" });
    this.FilterList.push({ Key: "lblMyTicketsDueToday", Value: "myduetoday" });
    this.FilterList.push({ Key: "lblMyUpdatedTickets", Value: "myupdated" });

    this.AgentList = await this.service.Data.ExecuteAPI_Post<Array<any>>(
      "Admin/Get_UserSelection_List",
      { Is_Agent: true }
    );
  }

  bindToolTip() {
    let service = this.service;
    window.setTimeout(() => {
      $(".subtooltip").each(function () {
        var $this = $(this);
        let obj: any = $this.find("#ID").val();
        let strSplit = obj.split("|"); //ID|Subject|Category|Status
        let site_url =
          service.Settings.API_URL +
          "/Home/Get_Tooltip?ModuleType=ticket&lang=" +
          service.CL +
          "&ID=" +
          strSplit[0] +
          "&Subject=" +
          strSplit[1] +
          "&Category=" +
          strSplit[2] +
          "&Status=" +
          strSplit[3];
        $(this)["webuiPopover"]({
          container: $this,
          placement: service.Is_RTL() ? "left" : "right",
          animation: "fade",
          type: "async",
          url: site_url,
          async: {
            type: "POST",
            before: function (that, xhr) {
              xhr.setRequestHeader(
                "Authorization",
                "Bearer " + service.Data.BearerToken
              );
            },
          },
          cache: true,
          width: 600,
          height: "auto",
          trigger: "hover",
          delay: {
            show: 400,
            hide: 100,
          },
          closeable: false,
          offsetTop: 0,
        });
      });
    }, 300);
  }

  refreshGrid(isRefresh) {
    this.bindData(isRefresh);
  }

  change_columnchooser(filter: GridFilter, value, index) {
    filter.Is_Visible != value;
    let lst = this.gridFilter.map((d, index) => {
      return { col: d.ColumnName, show: d.Is_Visible, ind: index };
    });
    this.service.App.set_localstorage("ticket_colums", lst);
  }

  AddRow() {
    this.router.navigate(["/ticket/add"]);
  }
  EditRow() {
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
      let ID = selectedRow[0]["DisplayTicketID"];
      this.EditTicket(ID);
    }
  }
  EditRowDBClick(RowItem: any) {
    if (!RowItem.isTrusted && RowItem) {
      this.EditTicket(RowItem.DisplayTicketID);
    }
  }
  EditTicket(DisplayTicketID) {
    $(".subtooltip")["webuiPopover"]("destroy");
    this.router.navigate(["/ticket/detail", DisplayTicketID]); //redirect to ticket detail page
  }
  async DeleteRow() {
    try {
      let selectedRow = this.allItems
        .filter((x) => x.selectedRow)
        .map((d) => d.TicketID)
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
            "Ticket/Ticket_Delete",
            { TicketIDs: selectedRow }
          );
          if (res > 0) {
            this.service.showMessage(
              AlertType.Success,
              this.service.Translator.instant("msgTicketDeleted")
            );
            this.refreshGrid(true);
          } else {
            this.service.showMessage(
              AlertType.Error,
              this.service.Translator.instant(
                "msgErrorTicketsUsedInAnotherTable"
              )
            );
          }
          this.service.App.ShowLoader = false;
        }
      }
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }

  ViewRow(RowItem: any) {
    if (RowItem) {
      this.Row_View.open(RowItem, "ticket");
    } else {
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
        this.Row_View.open(selectedRow[0], "ticket");
      }
    }
  }

  //CloneTicket
  async CloneTicket() {
    try {
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
        let ID = selectedRow[0]["TicketID"];
        if (
          confirm(this.service.Translator.instant("msgCloneSelectedTicket"))
        ) {
          this.service.App.ShowLoader = true;
          let res = await this.service.Data.ExecuteAPI_Post<any>(
            "Ticket/Ticket_Clone",
            { TicketID: ID }
          );
          if (res) {
            this.service.showMessage(
              AlertType.Success,
              this.service.Translator.instant("msgTicketCloned")
            );
            this.refreshGrid(true);
            this.service.GoTo_ScrollTop(window);
          }
          this.service.App.ShowLoader = false;
        }
      }
      this.ClearCheckbox(); //clear checkbox
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }

  //Filter
  FilterChange(value: string) {
    let filter_Items = [];
    let cDate = this.service.Date_Format(new Date(), "yyyy-MM-dd");
    if (value == "") {
      filter_Items = this.allItems_main;
    } else if (value == "open") {
      filter_Items = this.allItems_main.filter(
        (d) => d.StatusType == "Open" || d.StatusType == "OnHold"
      );
    } else if (value == "closed") {
      filter_Items = this.allItems_main.filter((d) => d.StatusType == "Closed");
    } else if (value == "pending") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") && d.AssignedUser
      );
    } else if (value == "unassign") {
      filter_Items = this.allItems_main.filter((d) => !d.AssignedUser);
    } else if (value == "overdue") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") &&
          d.DueDate &&
          this.service.Date_Format(d.DueDate, "yyyy-MM-dd") < cDate
      );
    } else if (value == "duetoday") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") &&
          d.DueDate &&
          this.service.Date_Format(d.DueDate, "yyyy-MM-dd") == cDate
      );
    } else if (value == "assignme") {
      filter_Items = this.allItems_main.filter(
        (d) => d.AssignedUser == this.service.Account.UserID
      );
    } else if (value == "myopen") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") &&
          d.AssignedUser == this.service.Account.UserID
      );
    } else if (value == "myclosed") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          d.StatusType == "Closed" &&
          d.AssignedUser == this.service.Account.UserID
      );
    } else if (value == "myunassign") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") &&
          (d.AssignedUser == this.service.Account.UserID || !d.AssignedUser)
      );
    } else if (value == "myoverdue") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") &&
          d.AssignedUser == this.service.Account.UserID &&
          d.DueDate &&
          this.service.Date_Format(d.DueDate, "yyyy-MM-dd") < cDate
      );
    } else if (value == "myduetoday") {
      filter_Items = this.allItems_main.filter(
        (d) =>
          (d.StatusType == "Open" || d.StatusType == "OnHold") &&
          d.AssignedUser == this.service.Account.UserID &&
          d.DueDate &&
          this.service.Date_Format(d.DueDate, "yyyy-MM-dd") == cDate
      );
    } else if (value == "myupdated") {
      filter_Items = this.allItems_main.filter(
        (d) => d.UpdatedUser == this.service.Account.UserID
      );
    }
    this.allItems = filter_Items;
    this.service.App.refreshGrid.emit();
  }

  //Assigned And Pickup Tickets
  AssignToUser(item) {
    let objUser = {
      UserID: item.UserID,
      DisplayName: item.DisplayName,
      Email: item.Email,
    };
    if (item.UserID > 0) {
      this.Ticket_AssignTo_Update(objUser, false);
      this.selectedAgent = 0;
    }
  }
  PickUp() {
    let objUser = {
      UserID: this.service.Account.UserID,
      DisplayName: this.service.Account.DisplayName,
      Email: this.service.Account.Email,
    };
    this.Ticket_AssignTo_Update(objUser, true);
  }
  async Ticket_AssignTo_Update(objUser, Is_PickUp) {
    try {
      if (objUser.UserID > 0) {
        let lstSelectedRow = this.allItems.filter(
          (x) => x.selectedRow && x.AssignedUser != objUser.UserID
        );
        if (lstSelectedRow.length == 0) {
          if (Is_PickUp) {
            this.service.showMessage(
              AlertType.Error,
              this.service.Translator.instant("msgSelectTicketsToPickedUp")
            );
          } else {
            this.service.showMessage(
              AlertType.Error,
              this.service.Translator.instant("msgSelectTicketsToAssignAgent")
            );
          }
        } else {
          this.service.App.ShowLoader = true;
          let res = await this.service.Data.ExecuteAPI_Post<number>(
            "Ticket/Ticket_AssignTo_Update",
            { lstTicket: lstSelectedRow, objUser: objUser }
          );
          if (res > 0) {
            if (Is_PickUp) {
              this.service.showMessage(
                AlertType.Success,
                this.service.Translator.instant("msgTicketPickedUp")
              );
            } else {
              this.service.showMessage(
                AlertType.Success,
                this.service.Translator.instant("msgTicketAssignedToAgent")
              );
            }
            this.refreshGrid(true);
          } else {
            this.service.showMessage(
              AlertType.Error,
              this.service.Translator.instant("msgError")
            );
          }
          this.service.App.ShowLoader = false;
        }
      } else {
        this.service.showMessage(
          AlertType.Error,
          this.service.Translator.instant("msgError")
        );
      }
      this.ClearCheckbox(); //clear checkbox
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }

  //Close Tickets
  CloseTicketForm: UntypedFormGroup;
  @ViewChild("modalCloseTicket") modalCloseTicket: ModalDialog;
  StatusList: Array<any> = [];
  CLosedStatusList: Array<any> = [];
  TicketCloseModeList: Array<any> = [];
  async InitCloseTicketForm() {
    this.CloseTicketForm = this.fb.group({
      StatusID: [
        0,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      TicketCloseModeID: [
        0,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      StatusCloseReason: [""],
    });
    this.StatusList = await this.service.Data.ExecuteAPI_Post<Array<any>>(
      "Admin/Get_Status_List"
    );
    this.CLosedStatusList = this.StatusList.filter((d) => d.Is_Closed == 1);

    this.TicketCloseModeList = await this.service.Data.ExecuteAPI_Post<
      Array<any>
    >("Admin/Get_TicketCloseMode_List");
  }
  OpenCloseTicket() {
    let selectedRow = this.allItems
      .filter((x) => x.selectedRow)
      .map((d) => d.TicketID)
      .join();
    if (selectedRow.length == 0) {
      this.service.showMessage(
        AlertType.Error,
        this.service.Translator.instant("msgSelectTicketsToClose")
      );
    } else {
      this.modalCloseTicket.open();
    }
  }
  async CloseTicket() {
    try {
      this.service.App.ShowLoader = true;
      let obj = this.CloseTicketForm.getRawValue();
      let lstSelectedRow = this.allItems.filter((x) => x.selectedRow);
      let res = await this.service.Data.ExecuteAPI_Post<number>(
        "Ticket/Ticket_Status_Update",
        {
          lstTicket: lstSelectedRow,
          StatusID: obj.StatusID,
          TicketCloseModeID: obj.TicketCloseModeID,
          StatusCloseReason: obj.StatusCloseReason,
        }
      );
      if (res > 0) {
        this.modalCloseTicket.close();
        this.service.showMessage(
          AlertType.Success,
          this.service.Translator.instant("msgTicketClosed")
        );
        this.CloseTicketForm.reset();
        this.clearCloseTicketForm();
        this.refreshGrid(true);
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
  clearCloseTicketForm() {
    this.CloseTicketForm.controls["StatusID"].setValue(0);
    this.CloseTicketForm.controls["TicketCloseModeID"].setValue(0);
    this.CloseTicketForm.controls["StatusCloseReason"].setValue("");
  }

  //Print
  Print() {
    let selectedRow = this.allItems
      .filter((x) => x.selectedRow)
      .map((d) => d.TicketID)
      .join();
    if (selectedRow.length == 0) {
      this.service.showMessage(
        AlertType.Error,
        this.service.Translator.instant("msgSelectTicketsToPrint")
      );
    } else {
      let url =
        this.service.Settings.API_URL +
        "/Home/Print?ids=" +
        selectedRow +
        "&type=ticket&lang=" +
        this.service.CL;
      window.open(url, "Print Preview");
    }

    this.ClearCheckbox(); //clear checkbox
  }

  //Export
  async Export(ftype: string) {
    try {
      let items = this.commongrid.records;
      if (items.length > 0) {
        this.service.App.ShowLoader = true;
        let columns = this.gridFilter
          .filter((d) => d.Is_Visible && d.ColumnName != "HasAttachment")
          .map((val) => {
            val.DisplayText = this.service.Translator.instant(val.DisplayText);
            return val;
          });
        let obj = { model: items, Columns: columns, Type: ftype };

        let res = await this.service.Data.ExecuteAPI_Post<any>(
          "Admin/Export_Data",
          obj
        );
        if (res) {
          let filename = "";
          let filetype = "";
          if (ftype == "excel") {
            filename = "Tickets.xlsx";
            filetype = "application/octet-stream";
          } else if (ftype == "pdf") {
            filename = "Tickets.pdf";
            filetype = "application/pdf";
          } else if (ftype == "csv") {
            filename = "Tickets.csv";
            filetype = "application/octet-stream";
          }

          window["saveAs"](
            new Blob([window["base64js"].toByteArray(res.data)], {
              type: filetype,
            }),
            filename
          );
        }
      } else {
        this.service.showMessage(
          AlertType.Error,
          this.service.Translator.instant("msgNoRecordsToExport")
        );
      }

      this.ClearCheckbox(); //clear checkbox
      this.service.App.ShowLoader = false;
    } catch (e) {
      this.service.App.ShowLoader = false;
    }
  }

  //ShowHideColumnFilter
  Is_ShowColumnFilter = true;
  ShowHideColumnFilter() {
    this.Is_ShowColumnFilter = !this.Is_ShowColumnFilter;
    this.service.App.showhideColumnFilter.emit(this.Is_ShowColumnFilter);
  }

  //Clear Checkbox
  ClearCheckbox() {
    this.service.App.clearAllCheckbox.emit();
  }
}
