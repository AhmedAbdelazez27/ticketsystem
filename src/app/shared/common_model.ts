export class KeyValue {
    public Key: string;
    public Value: number;
}
export class KeyValueDefault {
    public Key: string;
    public Value: number;
    public MainID: number;
    public Is_Default: boolean;
}
export class KeyValueString {
    public Key: string;
    public Value: string;
}

export class Account_Model {
    UserID: number;
    DisplayName: string;
    UserName: string;
    Email: string;
    ProfilePicture: string;
    Is_Agent_Original: boolean;
    Is_Agent: boolean;
    Is_Client: boolean;
    CompanyLogo: string;
    CompanyTitle: string;
    DefaultLanguage: string;
    DefaultPassword: string;
    Is_EasyAddOn_Visible: boolean;
    Is_Chat_Visible: boolean;
    Is_Admin_Search: boolean;
    Is_Pickup: boolean;
    Is_AssignTo_Dropdown: boolean;
    Is_Close_Ticket: boolean;
    Is_Ticket_StartPage: boolean;
    Is_EditRow_On_DoubleClick: boolean;

    Is_Profile_Visible: boolean;
    Is_Profile_Visible_Client: boolean;
    Is_CommonSetting_Visible: boolean;
    Is_CommonSetting_Visible_Client: boolean;
    Is_Help_Visible: boolean;
    Is_Help_Visible_Client: boolean;
    Is_Solution_Visible: boolean;
    Is_Solution_Visible_Client: boolean;
    Is_ColumnChooser_Visible: boolean;
    Is_ColumnChooser_Visible_Client: boolean;
    PageSize: number;
    PageSize_Client: number;
    Is_Ticket_Visible: boolean;
    Is_Search_Visible: boolean;


    Is_Print: boolean;
    Is_Print_Client: boolean;
    Is_Export: boolean;
    Is_Export_Client: boolean;
    Is_Ticket_Search: boolean;
    Is_Ticket_Search_Client: boolean;
    Is_Solution_Search: boolean;
    Is_Solution_Search_Client: boolean;
    Is_Column_Filter_Ticket: boolean;
    Is_Column_Filter_Ticket_Client: boolean;
    Is_Column_Filter_Solution: boolean;
    Is_Column_Filter_Solution_Client: boolean;
    Is_Clone_Ticket: boolean;
    Is_Clone_Ticket_Client: boolean;
    Is_Clone_Solution: boolean;
    Is_Clone_Solution_Client: boolean;

    //Ticket
    Show_Ticket_Menu: boolean;
    Is_Full_Ticket: boolean;
    Is_View_Ticket: boolean;
    Is_Add_Ticket: boolean;
    Is_Edit_Ticket: boolean;
    Is_Delete_Ticket: boolean;

    Show_Ticket_Menu_Client: boolean;
    Is_Full_Ticket_Client: boolean;
    Is_View_Ticket_Client: boolean;
    Is_Add_Ticket_Client: boolean;
    Is_Edit_Ticket_Client: boolean;
    Is_Delete_Ticket_Client: boolean;

    //Summary
    Show_Summary_Menu: boolean;
    Is_Full_Summary: boolean;
    Is_View_Summary: boolean;
    Is_Add_Summary: boolean;
    Is_Edit_Summary: boolean;
    Is_Delete_Summary: boolean;

    //Solution
    Show_Solution_Menu: boolean;
    Is_Full_Solution: boolean;
    Is_View_Solution: boolean;
    Is_Add_Solution: boolean;
    Is_Edit_Solution: boolean;
    Is_Delete_Solution: boolean;

    Show_Solution_Menu_Client: boolean;
    Is_Full_Solution_Client: boolean;
    Is_View_Solution_Client: boolean;
    Is_Add_Solution_Client: boolean;
    Is_Edit_Solution_Client: boolean;
    Is_Delete_Solution_Client: boolean;

    //Admin
    Show_Admin_Menu: boolean;
    Is_Full_Admin: boolean;
    Is_View_Admin: boolean;
    Is_Add_Admin: boolean;
    Is_Edit_Admin: boolean;
    Is_Delete_Admin: boolean;

    //Show Admin Dashboard
    Show_Admin_Dashboard: boolean;

    //extra
    Is_Show_ClientPortal_Link: boolean; //this will use for show client's pages or agent's pages

    Is_DemoVersion: boolean;
    Is_Enable_SignalR: boolean;

    //Page_Permission: Page_Permission;
    public init() {
        this.Show_Ticket_Menu = this.Is_Full_Ticket || this.Is_View_Ticket || this.Is_Add_Ticket || this.Is_Edit_Ticket || this.Is_Delete_Ticket;
        this.Show_Ticket_Menu_Client = this.Is_Full_Ticket_Client || this.Is_View_Ticket_Client || this.Is_Add_Ticket_Client || this.Is_Edit_Ticket_Client || this.Is_Delete_Ticket_Client;
        this.Show_Summary_Menu = this.Is_Full_Summary || this.Is_View_Summary || this.Is_Add_Summary || this.Is_Edit_Summary || this.Is_Delete_Summary;
        this.Show_Solution_Menu = this.Is_Full_Solution || this.Is_View_Solution || this.Is_Add_Solution || this.Is_Edit_Solution || this.Is_Delete_Solution;
        this.Show_Solution_Menu_Client = this.Is_Full_Solution_Client || this.Is_View_Solution_Client || this.Is_Add_Solution_Client || this.Is_Edit_Solution_Client || this.Is_Delete_Solution_Client;
        this.Show_Admin_Menu = this.Is_Full_Admin || this.Is_View_Admin || this.Is_Add_Admin || this.Is_Edit_Admin || this.Is_Delete_Admin;


        if (this.Is_Agent_Original) { this.Show_Admin_Dashboard = true; } else { this.Show_Admin_Dashboard = false; }
    }
    constructor(item: Account_Model) {
        Object.keys(item).forEach((d) => {
            this[d] = item[d];
        });
        this.init();
        //this.Page_Permission = new Page_Permission(item.Page_Permission);
    }
}

class Page_Permission {
    constructor(item: Page_Permission) {
        Object.keys(item).forEach((d) => {
            this[d] = item[d];
        });
        this.init();
    }
    public init() {

    }
}

export class Settings_Model {
    Base_API_URL: string;
    API_URL: string;
    Site_URL: string;
    Expiration_Time: number;
}

//Common Grid
export interface GridFilter {
    ColumnName: string;
    SortColumnName: string;
    DisplayText: string;
    Value: any;
    Condition: string;
    Type: string; // string|date|datetime|int|number|decimal|bool
    Is_Visible: boolean;
    Width: number;
    TextAlign: string;
    Is_Sum: boolean;
    Is_Price: boolean;
    Is_Sort: boolean;
    Is_EditLink: boolean;
    EditType: string;
    Actions: Array<Action_Type>;
    Is_TDClass: boolean;
}
export class Action_Type {
    class: string;
    text: string;
    font: string;
    type: string;
}

export class Pager {
    public totalItems: number;
    public currentPage: number;
    public pageSize: number;
    public totalPages: number;
    public startPage: number;
    public endPage: number;
    public startIndex: number;
    public endIndex: number;
    public pages: any;
}
export class Column_Detail {
    Display_Name: string;
    Property_Name: string;
    Width: number;
    Is_Visible: boolean;
    Is_Sortable: boolean;
    Type: string;
    Sort_Order: string;
}

//paging wise
export class Custom_Paging_Model {
    page: number;
    pageSize: number;
    sortColumn: string;
    sortOrder: string;
    search: string;
    where: string;
    Columns: Array<GridFilter> = [];
    isAll: number;
    isFooterRow: number;
    isTotal: number;

    StartDate: string; EndDate: string;
}

export enum GridEvent_Type {
    Page = 'page',
    Pagesize = 'pagesize',
    Sort = 'sort',
    Search = 'search',
    Refresh = 'refresh'
}
//Common Grid


//Start Alerts
export class Alert {
    type: AlertType;
    message: string;
    alertId: string;
    keepAfterRouteChange: boolean;
    cssClass: string;
    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}
//End Alerts

export class ApiResponse {
    isSuccess: boolean;
    msg: string;
    data: any;
}

//Menu Class
export class Menu_Model {
    Main_Menu_Class: string = "";
    Admin_Menu_Class: string = "";
    Is_Admin_Page: boolean = false;
}

export class UserManagement_Model {
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
    Is_Agent: boolean;
    Is_Client: boolean;

    selectedRow: boolean;
}


//Ticket Model
export interface Ticket_Model {
    TicketID: number;
    DisplayTicketID: string;
    Subject: string;
    RequestTypeID: number;
    StatusID: number;
    OldStatusID: number;
    PriorityID: number;
    UrgencyID: number;
    CategoryID: number;
    SubCategoryID: number;
    ItemID: number;
    ImpactID: number;
    DepartmentID: number;
    LevelID: number;
    LocationID: number;
    TicketModeID: number;
    CreatedUser: number;
    UpdatedUser: number;
    CreatedDate: Date;
    UpdatedDate: Date;
    RequestedUser: number;
    AssignedUser: number;
    AssignedDate: Date;
    DueDate: Date;
    Description: string;
    SolutionDescription: string;
    IPAddress: string;
    ClosedDate: Date;
    Is_FCR: boolean;
    Is_Active: boolean;
    RequestTypeName: string;
    StatusName: string;
    StatusType: string;
    PriorityName: string;
    ColorName: string;
    UrgencyName: string;
    CategoryName: string;
    SubCategoryName: string;
    ItemName: string;
    ImpactName: string;
    DepartmentName: string;
    LevelName: string;
    LocationName: string;
    TicketModeName: string;
    RequestedName: string;
    AssignedName: string;
    CreatedUserName: string;
    HasAttachment: boolean;
    TicketCloseModeID: number;
    StatusCloseReason: string;
    selectedRow: boolean;
}
export interface Ticket_Model_Export {
    DisplayTicketID: string;
    Subject: string;
    //Description: string;        
    RequestTypeName: string;
    StatusName: string;
    RequestedName: string;
    AssignedName: string;
    CreatedUserName: string;
    PriorityName: string;
    CategoryName: string;
    SubCategoryName: string;
    ItemName: string;
    UrgencyName: string;
    ImpactName: string;
    DepartmentName: string;
    LevelName: string;
    LocationName: string;
    TicketModeName: string;
    CreatedDate: string;
    DueDate: string;
    ClosedDate: string;
}
export class Description_Model {
    Description: string;
    SolutionDescription: string;
}

//Solution Model
export interface Solution_Model {
    SolutionID: number;
    DisplaySolutionID: string;
    TicketID: number;
    Subject: string;
    Description: string;
    Comments: string;
    CategoryID: number;
    SubCategoryID: number;
    ItemID: number;
    MetaKeywords: string;
    CreatedUser: number;
    UpdatedUser: number;
    UpdatedDate: Date;
    IPAddress: string;
    Is_Client_Visible: boolean;
    Is_Active: boolean;
    CreatedUserName: string;
    CategoryName: string;
    SubCategoryName: string;
    ItemName: string;
    HasAttachment: boolean;
    CreatedDate: Date;
    selectedRow: boolean;
}
export interface Solution_Model_Export {
    DisplaySolutionID: string;
    Subject: string;
    //Description: string;
    Comments: string;
    MetaKeywords: string;
    CreatedUserName: string;
    CategoryName: string;
    SubCategoryName: string;
    ItemName: string;
    IPAddress: string;
    Is_Client_Visible: string;
    Is_Active: string;
    CreatedDate: string;
}

//Dashboard Model
export interface Dashboard_Summary_Model {
    AllTickets: number;
    AllTickets_percent: number;
    OpenTickets: number;
    OpenTickets_percent: number;
    ClosedTickets: number;
    ClosedTickets_percent: number;
    PendingTickets: number;
    PendingTickets_percent: number;
    UnAssignedTickets: number;
    UnAssignedTickets_percent: number;
    OverdueTickets: number;
    OverdueTickets_percent: number;
    DueTodayTickets: number;
    DueTodayTickets_percent: number;
    AssignedToMeTickets: number;
    AssignedToMeTickets_percent: number;
}
export enum ModuleType {
    ticket = "ticket",
    solution = "solution",
    problem = "problem",
    change = "change"
}