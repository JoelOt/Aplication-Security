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
    // Sanitizar y validar el input antes de enviarlo
    const sanitizedQuery = this.sanitizeSearchInput(this.searchQuery);

    if (sanitizedQuery) {
      this.api.searchTracks(sanitizedQuery);
    }
  }

  /**
   * Sanitiza el input de búsqueda para prevenir XSS y otros ataques
   * @param input - El texto de búsqueda del usuario
   * @returns El input sanitizado o vacío si no es válido
   */
  private sanitizeSearchInput(input: string): string {
    if (!input) return '';

    // 1. Trim whitespace
    let sanitized = input.trim();

    // 2. Limitar longitud (prevenir DoS)
    const MAX_LENGTH = 100;
    if (sanitized.length > MAX_LENGTH) {
      sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    // 3. Remover caracteres peligrosos que podrían usarse en XSS
    sanitized = sanitized
      .replace(/[<>]/g, '') // Remover < y > para prevenir tags HTML
      .replace(/['"]/g, '') // Remover comillas para prevenir inyección de atributos
      .replace(/javascript:/gi, '') // Remover protocolo javascript:
      .replace(/on\w+\s*=/gi, '') // Remover event handlers (onclick=, onerror=, etc.)
      .replace(/script/gi, ''); // Remover la palabra "script"

    // 4. Validar que no esté vacío después de sanitizar
    if (!sanitized.trim()) {
      console.warn('Search query was empty after sanitization');
      return '';
    }

    // 5. Validar caracteres permitidos (solo alfanuméricos, espacios y algunos símbolos musicales)
    const allowedPattern = /^[a-zA-Z0-9\s\-_.,!?áéíóúñÁÉÍÓÚÑ]+$/;
    if (!allowedPattern.test(sanitized)) {
      console.warn('Search query contains invalid characters');
      // Remover caracteres no permitidos en lugar de rechazar toda la query
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.,!?áéíóúñÁÉÍÓÚÑ]/g, '');
    }

    return sanitized;
  }
}

