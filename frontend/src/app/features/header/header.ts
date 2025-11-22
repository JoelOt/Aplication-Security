import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { LoginPopup } from '../login-popup/login-popup';



@Component({
  selector: 'header',
  imports: [CommonModule, FormsModule, LoginPopup],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  public searchQuery: string = '';
  public showLoginPopup: boolean = false;
  public isLoginMode: boolean = true;

  ngOnInit() {
    console.log('Header initialized');
    //TODO!
    // ara shauria de fer una variable de si esta la session iniciada, en cas que si
    // mostras el nom dusuario, si no el login/signup, si el usuario es author,
    //shauria de mostrar un boto flotant a la part inferior dreta per pujar noves cansons
    //fer el dialeg de noves cansons, on ha dhaver un file uploader per la portada i un per la canso,
    // i un input per el titol i una textarea per la descripcio i genere
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

  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  constructor(private api: ApiService) { }

  onSearch() {
    this.api.searchTracks(this.searchQuery);
  }
}

