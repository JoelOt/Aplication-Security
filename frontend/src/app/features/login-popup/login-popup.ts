import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'login-popup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-popup.html',
  styleUrl: './login-popup.scss',
})
export class LoginPopup {
  @Output() closePopup = new EventEmitter<void>();
  @Input() isLoginMode: boolean = true;
  @Input() forced: boolean = false;

  public loginForm: FormGroup;
  public errorMessage: string = '';
  public successMessage: string = '';
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.loginForm = this.fb.group({
      username_email: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      id: ['', [Validators.required, Validators.minLength(8)]],
      dob: ['', [Validators.required, this.dobValidator()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, this.isSamePasswordValidator()]],
      role: ['', [Validators.required]]
    });
  }


  onSubmit() {
    // In login mode we only need username/email and password, so skip full form validation
    if (this.isLoginMode) {
      // Ensure required login fields are present
      const username = this.loginForm.get('username_email')?.value?.trim();
      const password = this.loginForm.get('password')?.value;
      if (!username || !password) {
        this.errorMessage = 'Username/email and password are required';
        this.loginForm.markAllAsTouched();
        return;
      }
    } else {
      // Registration mode: validate the whole form
      if (!this.loginForm.valid) {
        this.loginForm.markAllAsTouched();
        return;
      }
    }


    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isLoginMode) {
      // Login
      const username = this.loginForm.get('username_email')?.value;
      const password = this.loginForm.get('password')?.value;

      this.api.login(username, password).subscribe({
        next: (response) => {
          this.api.setToken(response.token);
          this.api.getCurrentUser().subscribe({
            next: (user) => {
              this.api.setCurrentUser(user);
              this.isLoading = false;
              this.closePopup.emit();
            },
            error: (err) => {
              console.error('Error fetching user:', err);
              this.isLoading = false;
              this.closePopup.emit(); // Close anyway, token is valid
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid username or password';
        }
      });
    } else {
      // Register
      const userData = {
        name: this.loginForm.get('username')?.value, // Using username as name for now
        surname: 'User', // Default surname
        username: this.loginForm.get('username')?.value,
        email: this.loginForm.get('email')?.value,
        dni: this.loginForm.get('id')?.value,
        age: this.calculateAge(this.loginForm.get('dob')?.value),
        password: this.loginForm.get('password')?.value,
        role: this.loginForm.get('role')?.value.toUpperCase()
      };

      this.api.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Auto-login after registration
          this.isLoginMode = true;
          this.successMessage = 'Registration successful! Please login.';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed';
        }
      });
    }
  }

  calculateAge(dob: string): number {
    const [day, month, year] = dob.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onClose() {
    this.closePopup.emit();
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

  get dob() {
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
