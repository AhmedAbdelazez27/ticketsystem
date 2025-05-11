import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core'

@Component({
    host: {
        '(document:click)': 'onClick($event)',
        '[attr.id]': 'id'
    },
    selector: "modal-dialog",
    templateUrl: "./modal.dialog.html"
})

export class ModalDialog {
    public maxHeight: number;
    @Input() contentWidth: string = "auto";
    @Input() modalClass: string = "modal-md";
    public id: any = Math.random();
    @Input() backDrop: boolean = false;
    @Input() isEscClose: boolean = true;
    @Input() modalHeader: string;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    @Output() public onOpen: EventEmitter<any> = new EventEmitter();
    visible: boolean = false;
    visibleOut: boolean = false;

    constructor(public el: ElementRef) { }
    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (this.isEscClose) { this.close(); }
    }
    ngOnInit() {
        window.setTimeout(() => {
            $("modal-dialog[id='" + this.id + "']").appendTo('body');
        }, 200);
    }
    ngOnDestroy() {
        $("modal-dialog[id='" + this.id + "']").remove();

        if ($(".modal.show").length == 1) { $('body').removeClass('modal-open'); }
    }
    open() {
        this.maxHeight = $(window).height() - 120;
        this.visibleOut = false;
        window.setTimeout(function (obj) {
            obj.visible = true;
            obj.onOpen.emit(true);
            $('body').addClass('modal-open');
        }, 50, this);
    }
    close() {
        this.visibleOut = true;
        setTimeout(() => {    //<<<---    using ()=> syntax
            this.visible = false;
            if ($(".modal.show").length == 1) { $('body').removeClass('modal-open'); }
        }, 250);
        this.onClose.emit(true);
    }    

    closeByBackDrop() {
        if (this.backDrop) { this.close(); }
    }

    onClick(event) {
        if (this.visible) {
            var ele = this.el.nativeElement.getElementsByClassName("modal-content");
            var rect = ele[0].getBoundingClientRect();
            if (ele.length > 0 && !((event.clientY >= (rect.top) && event.clientY <= (rect.top + rect.height)) && (event.clientX >= rect.left && event.clientX <= (rect.left + rect.width)))) // or some similar check
            {
                if (this.visible && this.backDrop) {
                    this.close();
                }
            }
        }
    }
}