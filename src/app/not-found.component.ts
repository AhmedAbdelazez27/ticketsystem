import { Component } from '@angular/core';
import { SystemService } from './shared/SystemService';
@Component({
    template: `
<div class="main-panel" style="width:100%;">
            <div class="content-wrapper d-flex align-items-center text-center error-page pt-5" style="min-height:300px;">
        <div class="row flex-grow">
          <div class="col-lg-7 mx-auto">
            <div class="row align-items-center d-flex flex-row">
              <div class="col-lg-6 text-lg-right pr-lg-4">
                <h1 class="display-1 mb-0">404</h1>
              </div>
              <div class="col-lg-6 error-page-divider text-lg-left pl-lg-4">
                <h2>SORRY!</h2>
                <h3 class="font-weight-light">The page you’re looking for was not found.</h3>
              </div>
            </div>
            <div class="row mt-5">
              <div class="col-12 text-center mt-xl-2">
                <a *ngIf="service?.Account?.Is_Agent" class="font-weight-medium" routerLink="/">Back to home</a>
                <a *ngIf="!service?.Account?.Is_Agent" class="font-weight-medium" routerLink="/requester">Back to home</a>
              </div>
            </div>            
          </div>
        </div>
      </div>
 </div>
            `
})
export class PageNotFoundComponent {
    constructor(public service: SystemService) { }

}