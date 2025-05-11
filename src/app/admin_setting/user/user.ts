import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { SystemService } from '../../shared/SystemService';
import { GridFilter, KeyValue } from '../../shared/common_model';
import { ModalDialog } from '../../shared/modal.dialog';
import { AlertType } from '../../shared/common_model';
import { elementAt } from 'rxjs-compat/operator/elementAt';


@Component({
	templateUrl: './user.html'
})

export class UserComponent {
	isLoading = false; allItems: Array<UserManagement_Model> = []; txtSearch = "";
	totalitems: number; gridFilter: Array<GridFilter> = [];
	RoleList: Array<KeyValue> = []; Is_Agent: boolean = false; Is_Client: boolean = true; RoleList_All = [];
	Is_Edit_Form: boolean = false;
	@ViewChild("modalAdd") modalAdd: ModalDialog;
	public imageUrl: string = "/assets/images/profile.png";
	public allowedExtensions: Array<string> = ["png", "jpg", "jpeg", "gif", "bmp"];
	public UserID: number = 0; Title: string;
	Is_Agent_Only = false;
	header_title = '';
	constructor(public fb: UntypedFormBuilder, public service: SystemService, public route: ActivatedRoute, public router: Router, public location: Location) {
		this.service.GoTo_ScrollTop(window);

		this.gridFilter.push(<GridFilter>{ DisplayText: "", ColumnName: "ProfilePicture", Type: "image", Value: "", Is_Visible: true, TextAlign: "text-center", Width: 5 });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblDisplayName", ColumnName: "DisplayName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblUserName", ColumnName: "UserName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblEmail", ColumnName: "Email", Condition: "no", Type: "string", Value: "", Is_Visible: true });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblRoleName", ColumnName: "RoleName", Condition: "no", Type: "string", Value: "", Is_Visible: true });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblPhoneNo", ColumnName: "PhoneNo", Condition: "no", Type: "string", Value: "", Is_Visible: true });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblCountry", ColumnName: "Country", Condition: "no", Type: "string", Value: "", Is_Visible: true });
		this.gridFilter.push(<GridFilter>{ DisplayText: "lblIsActive", ColumnName: "Is_Active", Condition: "no", Type: "bool", Value: "", Is_Visible: true });

		if (window.location.href.indexOf("user_admin") > -1) {
			this.Is_Agent = true; this.Is_Client = true;
			if (!this.service.Account.Is_Agent || !this.service.Account.Is_Client) { this.router.navigate(['/admin']); }
		}
		else if (window.location.href.indexOf("user_agent") > -1) {
			this.Is_Agent = true; this.Is_Client = false;
		}
		else { this.Is_Agent = false; this.Is_Client = false; }

		this.UserID = this.route.snapshot.queryParams['id'];
		if (this.UserID && this.UserID > 0) {
			this.Is_Edit_Form = true;

			if (this.Is_Agent && this.Is_Client) { this.location.replaceState('/admin/user_admin'); }
			else if (this.Is_Agent) { this.location.replaceState('/admin/user_agent'); }
			else { this.location.replaceState('/admin/user_client'); }
			this.isEdit = true;
			this.EditUserManagement(this.UserID);
			if (this.service.Account.Is_Agent && !this.service.Account.Is_Client) { this.Is_Agent_Only = true; }
		}
		this.initForm();
	}
	ngOnInit() {
		this.bindData();
		this.set_header_title();
	}
	async bindData(isRefresh = false) {
		try {
			this.isLoading = true;
			let res = await this.service.Data.ExecuteAPI_Post<Array<UserManagement_Model>>("Admin/Get_UserManagement_List", { Is_Agent: this.Is_Agent, Is_Client: this.Is_Client });
			if (res) {
				this.allItems = res;
				this.totalitems = res.length;

				if (isRefresh) { this.service.App.refreshGrid.emit(); }
			}

			this.RoleList_All = await this.service.Data.ExecuteAPI_Post<any>("Admin/Get_Roles_List");
			this.setRoles();

			this.isLoading = false;
		} catch (e) {
			this.isLoading = false;
		}
	}
	async setRoles() {
		let lst = [];
		if (this.Is_Agent && this.Is_Client) {
			lst = this.RoleList_All.filter(d => d.Is_Agent && d.Is_Client);
		}
		else if (this.Is_Agent && !this.Is_Client) {
			lst = this.RoleList_All.filter(d => d.Is_Agent && !d.Is_Client);
		}
		else if (!this.Is_Agent) {
			lst = this.RoleList_All.filter(d => !d.Is_Agent && d.Is_Client);
		}
		else {
			lst = this.RoleList_All;
		}
		this.RoleList = await lst.map(d => { return <KeyValue>{ Key: d.Name, Value: d.RoleID } });
	}

	pageChanged(obj: any) { }
	refreshGrid() {
		this.bindData(true);
	}

	//Add/Edit 
	UserManagementForm: UntypedFormGroup; isEdit = false;
	@ViewChild('f') form: NgForm;
	initForm() {
		this.UserManagementForm = this.fb.group({
			UserID: [0],
			RoleID: [0, Validators.compose([Validators.required, Validators.min(1)])],
			DisplayName: ["", Validators.required],
			UserName: ["", Validators.required],
			Email: ["", Validators.compose([Validators.required, Validators.email])],
			Password: ["", Validators.required],
			PhoneNo: [""],
			//CellPhoneNo: [""],
			City: [""],
			State: [""],
			Country: [""],
			Pincode: [""],
			JobTitle: [""],
			Address: [""],
			//TimeZoneID: [""],
			Organization: [""],
			Is_SendMail_Password: [false],
			Description: [""],
			ProfilePicture: [""],
			Is_Active: [true]
		});
	}
	AddRow() {
		this.setRoles();
		this.imageUrl = "/assets/images/profile.png";
		this.isEdit = false;
		this.Is_Edit_Form = true;
		this.clearForm();
		this.setUserName_Readonly(false);
	}
	EditRow() {
		this.isEdit = true;
		let selectedRow = this.allItems.filter((x) => x.selectedRow);
		if (selectedRow.length == 0) {
			this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
		}
		else if (selectedRow.length > 1) {
			this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectOnlyOneRow"));
		}
		else {
			let ID = selectedRow[0]["UserID"];
			this.EditUserManagement(ID);
		}
	}
	EditRowDBClick(RowItem: any) {
		this.isEdit = true;
		if (!RowItem.isTrusted && RowItem) {
			this.EditUserManagement(RowItem.UserID);
		}
	}
	async EditUserManagement(UserID) {
		try {
			this.service.App.ShowLoader = true;
			this.setRoles();

			let res = await this.service.Data.ExecuteAPI_Post<UserManagement_Model>("Admin/Get_UserManagement_ByID", { UserID: UserID });
			if (res) {
				this.UserManagementForm.patchValue(res);
				if (res.ProfilePicture) {
					let cdt = this.service.Date_Format(new Date(), 'yyyyMMddHHmmss');
					this.imageUrl = this.service.Settings.Base_API_URL + "/Documents/Profile/" + res.ProfilePicture + "?" + cdt;
				}
				else { this.imageUrl = "/assets/images/profile.png"; }

				//This condition only for demo version
				if (this.service.Account.Is_DemoVersion && res.UserName == 'admin') {
					this.UserManagementForm.controls["Password"].setValue(".......");
				}
			}
			this.Is_Edit_Form = true;
			this.setUserName_Readonly(true);
			this.set_header_title();

			this.service.App.clearAllCheckbox.emit();
			this.service.App.ShowLoader = false;
		} catch (e) {
			this.service.App.ShowLoader = false;
		}
	}

	async SaveUserManagement() {
		try {
			let obj = this.UserManagementForm.getRawValue();
			if (!this.service.Account.Is_DemoVersion || (this.service.Account.Is_DemoVersion && obj.UserName != 'admin')) {//This condition only for demo version

				this.service.App.ShowLoader = true;
				obj.UserID = obj.UserID == null ? 0 : obj.UserID;
				obj.ProfilePicture = this.imageUrl ? this.imageUrl : obj.ProfilePicture;
				obj.ProfilePictureName = this.ProfilePictureName;

				let index = this.allItems.findIndex(d => d.UserName == obj.UserName && d.UserID != obj.UserID);//check username exists or not                
				if (index < 0) {
					let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/UserManagement_Update", obj);
					if (res > 0) {
						this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgUserSaved"));
						if (this.UserID > 0 || this.Is_Agent_Only) {
						} else {
							//go to list when not come from profile link
							this.Is_Edit_Form = false;
							this.clearForm();
							this.refreshGrid();
						}
					}
					else {
						this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
					}
				}
				else {
					if (index > -1) {
						this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgUserAlreadyExists"));
					}
				}
				this.service.App.ShowLoader = false;
			}
			else {
				this.service.showMessage(AlertType.Error, "This features is not enable for demo version.");
			}

		} catch (e) {
			this.service.App.ShowLoader = false;
		}
	}
	async DeleteRow() {
		try {
			let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.UserID).join();
			if (selectedRow.length == 0) {
				this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
			} else {
				if (confirm(this.service.Translator.instant("msgDeleteSelectedItems"))) {
					this.service.App.ShowLoader = true;
					let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/UserManagement_Delete", { UserIDs: selectedRow });
					if (res > 0) {
						this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgUserDeleted"));
						this.refreshGrid();
					}
					else {
						this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgErrorUsersUsedInAnotherTable"));
					}
					this.service.App.ShowLoader = false;
				}
			}
		} catch (e) {
			this.service.App.ShowLoader = false;
		}
	}

	clearForm() {
		this.set_header_title();
		if (this.form) { this.form.resetForm(); }
		this.UserManagementForm.controls["UserID"].setValue(0);
		this.UserManagementForm.controls["RoleID"].setValue(0);
		this.UserManagementForm.controls["Is_SendMail_Password"].setValue(false);
		this.UserManagementForm.controls["Is_Active"].setValue(true);
	}
	BackToList() {
		if (this.Is_Agent_Only) { this.router.navigate(['/']); }
		else {
			this.Is_Edit_Form = false; this.service.GoTo_ScrollTop(window); this.UserID = 0;
		}
		this.set_header_title();
	}

	//profile picture
	ProfilePictureName: string = "";
	fileChange(event: any) {
		let file = event.target.files[0];
		if (file) {
			let extension = file.name.replace(/^.*\./, '');
			if (this.allowedExtensions.indexOf(extension.toLowerCase()) > -1) {
				var myReader: FileReader = new FileReader();
				myReader.onloadend = (e) => {
					this.imageUrl = <string>myReader.result;
					this.ProfilePictureName = file.name;
				}
				myReader.readAsDataURL(file);
			}
			else {
				this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgSelectValidImage"));
			}
		}
	}

	async ActiveDeActiveUser() {
		try {
			let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.UserID).join();
			if (selectedRow.length == 0) {
				this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
			} else {
				let lstUsers = <any>this.allItems.filter((x) => x.selectedRow).map((d) =>
					<KeyValue>{
						Key: d.Is_Active.toString(), Value: d.UserID
					});

				if (confirm(this.service.Translator.instant("msgActiveDeactiveSelectedUsers"))) {
					this.service.App.ShowLoader = true;
					let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/ActiveDeActive_User", lstUsers);
					if (res > 0) {
						this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgUserActivateDeActivate"));
						this.refreshGrid();
					}
					else {
						this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
					}
					this.service.App.ShowLoader = false;
				}
			}
		} catch (e) {
			this.service.App.ShowLoader = false;
		}
	}

	async ResetDefaultPassword() {
		try {
			let selectedRow = this.allItems.filter((x) => x.selectedRow).map(d => d.UserID).join();
			if (selectedRow.length == 0) {
				this.service.showMessage(AlertType.Warning, this.service.Translator.instant("msgSelectRow"));
			} else {
				if (this.service.Account.DefaultPassword) {
					if (confirm(this.service.Translator.instant("msgResetPasswordToDefaultOfSelectedUsers"))) {
						this.service.App.ShowLoader = true;
						let res = await this.service.Data.ExecuteAPI_Post<number>("Admin/ResetDefaultPassword_User", { UserIDs: selectedRow, DefaultPassword: this.service.Account.DefaultPassword });
						if (res > 0) {
							this.service.showMessage(AlertType.Success, this.service.Translator.instant("msgPasswordReseted"));
							this.refreshGrid();
						}
						else {
							this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgError"));
						}
						this.service.App.ShowLoader = false;
					}
				}
				else {
					this.service.showMessage(AlertType.Error, this.service.Translator.instant("msgDefaultPasswordNotSetted"));
				}
			}
		} catch (e) {
			this.service.App.ShowLoader = false;
		}
	}

	setUserName_Readonly(is_readonly) {
		if (is_readonly) { $("input[formcontrolname='UserName']").attr('readonly', 'readonly'); }
		else { $("input[formcontrolname='UserName']").removeAttr('readonly'); }
	}
	set_header_title() {
		if (this.Is_Edit_Form) {
			if (this.Is_Agent && this.Is_Client) {
				if (this.isEdit) { this.header_title = 'lblUpdateAdmin'; }
				else { this.header_title = 'lblAddAdmin'; }
			}
			else if (this.Is_Agent && !this.Is_Client) {
				if (this.isEdit) { this.header_title = 'lblUpdateAgent'; }
				else { this.header_title = 'lblAddAgent'; }
			}
			else {
				if (this.isEdit) { this.header_title = 'lblUpdateClient'; }
				else { this.header_title = 'lblAddClient'; }
			}
		}
		else {
			if (this.Is_Agent && this.Is_Client) {
				this.header_title = 'lblAdminList';
			}
			else if (this.Is_Agent && !this.Is_Client) {
				this.header_title = 'lblAgentList';
			}
			else {
				this.header_title = 'lblClientList';
			}
		}
	}

}

interface UserManagement_Model {
	UserID: number;
	RoleID: number;
	RoleName: string;
	DisplayName: string;
	UserName: string;
	Password: string;
	Email: string;
	PhoneNo: string;
	CellPhoneNo: string;
	City: string;
	State: string;
	Country: string;
	Pincode: string;
	JobTitle: string;
	Address: string;
	TimeZoneID: number;
	Organization: string;
	Is_SendMail_Password: boolean;
	Description: string;
	ProfilePicture: string;
	ProfilePictureName: string;
	Is_Active: boolean;
	CreatedDate: Date;
	selectedRow: boolean;
}