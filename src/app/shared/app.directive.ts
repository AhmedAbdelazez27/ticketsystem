import { Directive, ElementRef, HostListener } from '@angular/core'

@Directive({
    selector: '[number-only]'
})

export class NumberOnly {
    constructor(public el: ElementRef) { }
    @HostListener('keydown', ['$event']) onKeyDown(event) {
        let e = <KeyboardEvent>event;
        if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
            // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }
}


//This directive only works with form button type submit not normal type button click 
@Directive({
    selector: '[novalidate]'
})
export class FocusInvalidDirective {
    constructor(private el: ElementRef) { }
    @HostListener('submit') onFormSubmit() {
        const invalidControl = this.el.nativeElement.querySelector('form .ng-invalid:not([type="hidden"])');        
        if (invalidControl) {
            invalidControl.focus();
        }
    }
}

import { animate, state, style, transition, trigger } from '@angular/animations';
export const slideInOut =
    trigger('slideInOut', [
        state('in', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
        state('out', style({ height: '*', visibility: 'visible' })),
        //transition('in <=> out', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        transition('in => out', animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        transition('out => in', animate('400ms ease-out')),
    ]);