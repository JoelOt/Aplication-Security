import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginPopup } from '../login-popup/login-popup';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  public searchQuery: string = '';

  private dialog = inject(MatDialog);

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
    let dialogRef = this.dialog.open(LoginPopup, 
      {
        width: 'fit-content',
        height: 'fit-content',
        data: {}
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log('Dialog cerrado:', result);
    });
  }

    
  doRegister() {
    console.log('Iniciando signup...');
    let dialogRef = this.dialog.open(LoginPopup, 
      {
        width: 'fit-content',
        height: 'fit-content',
        maxHeight: '90vh',
        data: {isLoginMode: false}
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log('Dialog cerrado:', result);
    });
  }
}
