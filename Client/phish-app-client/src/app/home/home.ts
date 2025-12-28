import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  isSidebarExpanded = true;

  constructor(private router: Router, private authService: AuthService) {}


  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
    });
  }

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

  navigateToReports() {
    this.router.navigate(['/home', 'reports']);
  }

  navigateToTemplates() {
    this.router.navigate(['/home', 'templates']);
  }

  navigateToLandingPages() {
    this.router.navigate(['/home', 'landing-pages']);
  }

  navigateToSendingProfiles() {
    this.router.navigate(['/home', 'sending-profiles']);
  }
  navigateToQuizzes() {
    this.router.navigate(['/home', 'quizzes']);
  }
}

