import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { idText } from 'typescript';

@Component({
  selector: 'login-popup',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonToggleModule],
  templateUrl: './login-popup.html',
  styleUrl: './login-popup.scss',
})
export class LoginPopup {
  public isLoginMode: boolean = true;
  public loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LoginPopup>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loginForm = this.fb.group({
      username_email: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      id: ['', [Validators.required, Validators.minLength(8)]],
      dob: ['', [Validators.required, this.dobValidator()]], // <- usar validador personalizado
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, this.isSamePasswordValidator()]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.data && this.data.isLoginMode === false) {
      this.isLoginMode = false;
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form data:', this.loginForm.value);
      // Aquí envías los datos al backend
    } else {
      console.log('Form inválido');
      this.loginForm.markAllAsTouched();
    }
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onClose() {
    this.dialogRef.close('cancel'); // o this.dialogRef.close();
  }

  onRecoverPassword() {
    console.log('Recuperar contraseña');
  }

  get username() {
    return this.loginForm.get('username');
  }

  get id() {
    return this.loginForm.get('id');
  }

  get dob () {
    return this.loginForm.get('dob');
  }
  
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get confirmPassword() {
    return this.loginForm.get('confirmPassword');
  }

  get role() {
    return this.loginForm.get('role');
  }

  get username_email() {
    return this.loginForm.get('username_email');
  }

  // Validador que verifica formato DD/MM/YYYY y que la fecha sea válida
  private dobValidator(): ValidatorFn {
    const fmt = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value;
      if (!v) return null; // required se maneja por separado
      if (!fmt.test(v)) return { invalidFormat: true };
      const [dd, mm, yyyy] = v.split('/').map(Number);
      const d = new Date(yyyy, mm - 1, dd);
      // comprobar que la fecha construida coincide con los valores
      if (d.getFullYear() !== yyyy || d.getMonth() !== (mm - 1) || d.getDate() !== dd) {
        return { invalidDate: true };
      }
      return null;
    };
  }

  private isSamePasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.loginForm) return null; // formulario no inicializado aún
      const password = this.loginForm.get('password')?.value;
      const confirmPassword = control.value;
      if (password !== confirmPassword) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  } 

}
