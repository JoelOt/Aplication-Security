import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { LoginPopup } from '../login-popup/login-popup';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'header',
  standalone: true,
  imports: [CommonModule, FormsModule, LoginPopup, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  public searchQuery: string = '';
  public showLoginPopup: boolean = false;
  public isLoginMode: boolean = true;
  public isLoggedIn: boolean = false;
  public currentUser: any = null;

  constructor(private api: ApiService) { }

  ngOnInit() {
    console.log('Header initialized');

    // Check initial login state
    this.isLoggedIn = this.api.isLoggedIn();
    if (this.isLoggedIn) {
      this.api.getCurrentUser().subscribe({
        next: (user) => {
          this.api.setCurrentUser(user);
        },
        error: () => {
          this.logout();
        }
      });
    }

    // Subscribe to user changes
    this.api.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  doLogin() {
    console.log('Iniciando login...');
    this.isLoginMode = true;
    this.showLoginPopup = true;
  }

  doRegister() {
    console.log('Iniciando signup...');
    this.isLoginMode = false;
    this.showLoginPopup = true;
  }

  logout() {
    this.api.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  onSearch() {
    this.api.searchTracks(this.searchQuery);
  }
}

