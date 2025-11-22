import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainDashboard } from './features/main-dashboard/main-dashboard';
import { Header } from './features/header/header';
import { LoginPopup } from './features/login-popup/login-popup';
import { ApiService } from './core/api.service';

@Component({
  selector: 'app-root',
  imports: [MainDashboard, CommonModule, LoginPopup],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('AppSecurityFrontEnd');
  public isLoggedIn: boolean = false;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.checkLoginStatus();

    // Subscribe to user changes to update UI automatically
    this.api.currentUser$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
    });
  }

  checkLoginStatus() {
    if (this.api.isLoggedIn()) {
      this.api.getCurrentUser().subscribe({
        next: (user: any) => {
          this.api.setCurrentUser(user);
          this.isLoggedIn = true;
        },
        error: () => {
          this.api.logout();
          this.isLoggedIn = false;
        }
      });
    } else {
      this.isLoggedIn = false;
    }
  }
}
