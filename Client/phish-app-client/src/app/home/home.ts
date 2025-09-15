import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  isSidebarExpanded = true;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  navigateToDashboard() {
    this.router.navigate(['/home', 'dashboard']);
  }

  navigateToCampaigns() {
    this.router.navigate(['/home', 'campaigns']);
  }

  navigateToRecipients() {
    this.router.navigate(['/home', 'recipients']);
  }

  navigateToTemplates() {
    this.router.navigate(['/home', 'templates']);
  }
}
