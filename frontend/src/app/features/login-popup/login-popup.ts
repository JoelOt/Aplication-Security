import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Router } from '@angular/router';

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
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      // Login field: allow alphanumeric, dots, underscores, hyphens, and @ for email
      // Note: required validation is handled manually in onSubmit for login mode
      username_email: ['', [
        Validators.maxLength(100),
        this.noXSSValidator()
      ]],

      // Username: only alphanumeric, underscores, hyphens
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/),
        this.noXSSValidator()
      ]],

      // ID/DNI: only alphanumeric and hyphens
      id: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9-]+$/),
        this.noXSSValidator()
      ]],

      // Date of birth
      dob: ['', [
        Validators.required,
        this.dobValidator()
      ]],

      // Email: strict pattern validation
      email: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        this.noXSSValidator()
      ]],

      // Password: allow most characters but block dangerous ones
      // Note: minLength(8) is only enforced during registration, checked in onSubmit
      password: ['', [
        Validators.required,
        Validators.maxLength(128),
        this.noXSSValidator()
      ]],

      // Confirm password
      confirmPassword: ['', [
        Validators.required,
        this.isSamePasswordValidator()
      ]],

      // Role: only 'author' or 'user'
      role: ['', [
        Validators.required,
        Validators.pattern(/^(author|user)$/i)
      ]]
    });
  }


  onSubmit() {
    console.log('Form submitted');
    console.log(this.loginForm.value);
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
      // Registration mode: validate only registration fields
      const registrationFields = ['username', 'id', 'dob', 'email', 'password', 'confirmPassword', 'role'];
      let hasErrors = false;

      console.log('Validating registration form...');
      registrationFields.forEach(fieldName => {
        const field = this.loginForm.get(fieldName);
        if (field && field.invalid) {
          console.log(`Field '${fieldName}' is invalid:`, field.errors);
          hasErrors = true;
        }
      });

      // Additional manual validation for password length in registration mode
      const password = this.loginForm.get('password')?.value;
      if (password && password.length < 8) {
        console.log('Password is too short (minimum 8 characters)');
        this.errorMessage = 'Password must be at least 8 characters long';
        this.cdr.detectChanges();
        hasErrors = true;
      }

      if (hasErrors) {
        console.log("Form has validation errors");
        this.loginForm.markAllAsTouched();
        return;
      }
    }

    console.log("2222");

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isLoginMode) {
      // Login
      const username = this.sanitizeInput(this.loginForm.get('username_email')?.value);
      const password = this.loginForm.get('password')?.value; // Don't sanitize password, just use as-is

      this.api.login(username, password).subscribe({
        next: (response) => {
          this.api.setToken(response.token);
          this.api.getCurrentUser().subscribe({
            next: (user) => {
              this.api.setCurrentUser(user);
              this.isLoading = false;
              this.closePopup.emit();
              this.router.navigate(['/main']); // Navigate to dashboard
            },
            error: (err) => {
              console.error('Error fetching user:', err);
              this.isLoading = false;
              this.closePopup.emit(); // Close anyway, token is valid
              this.router.navigate(['/main']); // Navigate anyway
            }
          });
        },
        error: (err) => {
          console.error('Login error:', err);
          this.isLoading = false;
          // Show a clear error message for failed login
          this.errorMessage = 'Username/email or password are incorrect';
          // Force change detection to update UI immediately
          this.cdr.detectChanges();
        }
      });
    } else {
      // Register - sanitize all inputs before sending to backend
      console.log("33333333333");

      const roleValue = this.loginForm.get('role')?.value.toLowerCase();
      const calculatedAge = this.calculateAge(this.loginForm.get('dob')?.value);

      // Validate that age is a valid number
      if (isNaN(calculatedAge) || calculatedAge < 0 || calculatedAge > 120) {
        this.errorMessage = 'Invalid date of birth';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      const userData = {
        firstName: this.sanitizeInput(this.loginForm.get('username')?.value),
        lastName: 'User', // Default surname
        username: this.sanitizeInput(this.loginForm.get('username')?.value),
        email: this.sanitizeInput(this.loginForm.get('email')?.value),
        dni: this.sanitizeInput(this.loginForm.get('id')?.value),
        age: calculatedAge,
        password: this.loginForm.get('password')?.value, // Don't sanitize password
        isArtist: roleValue === 'author' // true if author, false if user
      };

      console.log("44444444444");
      console.log("Sending registration data:", userData);
      this.api.register(userData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          // The backend returns a token upon successful registration
          // Use it to automatically log in the user
          if (response.token) {
            this.api.setToken(response.token);
            // Fetch current user and navigate to dashboard
            this.api.getCurrentUser().subscribe({
              next: (user) => {
                this.api.setCurrentUser(user);
                this.isLoading = false;
                this.successMessage = 'Registration successful! Logging you in...';
                // Close popup and navigate to main dashboard
                setTimeout(() => {
                  this.closePopup.emit();
                  this.router.navigate(['/main']);
                }, 500); // Small delay to show success message
              },
              error: (err) => {
                console.error('Error fetching user after registration:', err);
                this.isLoading = false;
                // Even if fetching user fails, we have the token, so navigate anyway
                this.closePopup.emit();
                this.router.navigate(['/main']);
              }
            });
          } else {
            // Fallback: if no token returned, show success and switch to login mode
            this.isLoading = false;
            this.isLoginMode = true;
            this.successMessage = 'Registration successful! Please login.';
          }
        },
        error: (err) => {
          console.log('Registration error:', err);
          console.log('Error status:', err.status);
          console.log('Error message:', err.error);
          this.isLoading = false;
          this.errorMessage = err.error?.message || err.error?.error || 'Registration failed';
          this.cdr.detectChanges();
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

  /**
   * Custom validator to detect and prevent XSS attacks
   * Checks for dangerous patterns like script tags, event handlers, etc.
   */
  private noXSSValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const dangerousPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,  // Script tags
        /<iframe[\s\S]*?>/gi,                     // Iframe tags
        /javascript:/gi,                          // JavaScript protocol
        /on\w+\s*=/gi,                            // Event handlers (onclick=, onerror=, etc.)
        /<img[\s\S]*?onerror[\s\S]*?>/gi,        // Image with onerror
        /<svg[\s\S]*?onload[\s\S]*?>/gi,         // SVG with onload
        /eval\s*\(/gi,                            // eval() function
        /expression\s*\(/gi,                      // CSS expression()
        /<embed[\s\S]*?>/gi,                      // Embed tags
        /<object[\s\S]*?>/gi,                     // Object tags
        /<[^>]*>/g                                // Any HTML tags
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return { xssDetected: true };
        }
      }

      return null;
    };
  }

  /**
   * Sanitize user input before sending to backend
   * Removes dangerous characters and limits length
   */
  private sanitizeInput(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .replace(/[<>]/g, '')           // Remove < and >
      .replace(/javascript:/gi, '')   // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '')     // Remove event handlers
      .substring(0, 200);             // Limit length
  }

}
