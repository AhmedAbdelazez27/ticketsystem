import { AfterViewInit, Component } from '@angular/core';

import { Tooltip } from 'bootstrap';  // Correct import for Bootstrap components

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit{

    // Lifecycle hook that is triggered after the view is initialized
  ngAfterViewInit(): void {
    this.initializeTooltips();
  }

  // Function to initialize the tooltips
  private initializeTooltips(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new Tooltip(tooltipTriggerEl);  // Create tooltip instance
    });
  }

  toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('collapsed');
        }
}
