import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { RouterLoaderService } from '../../../../shared/services/router-loader.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordStrengthDirective, PasswordStrengthState } from '../../directives/password-strength';
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RegisterPayload } from '../../services/auth';

const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value || !control.parent) {
    return null;
  }

  const password = control.parent.get('password')?.value;

  return password === control.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordStrengthDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatSelectModule, MatIconModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loaderService = inject(RouterLoaderService);

  private subscriptions: Subscription[] = [];

  private snackBar = inject(MatSnackBar);

  registerForm!: FormGroup;

  formError = false;
  isSubmitting = false;

  readonly stateOptions = ['Argentina', 'Uruguay', 'Chile', 'Brasil', 'Paraguay'];

  passwordState: PasswordStrengthState = {
    minLength: false,
    uppercase: false,
    number: false,
    strength: 'débil',
    percentage: 0
  };

  showPasswordRequirements = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['Argentina', Validators.required],
      zip: ['', [Validators.required, Validators.pattern('^[0-9]{4,10}$')]]
    });

    this.subscriptions.push(
      this.registerForm.get('password')!.valueChanges.subscribe(() => {
        this.registerForm.get('confirmPassword')!.updateValueAndValidity({ onlySelf: true });
      })
    );

    // Suscribirse a los cambios de estado del formulario para mostrar/ocultar errores en tiempo real
    this.subscriptions.push(
      this.registerForm.statusChanges.subscribe(status => {
        if (status === 'VALID') {
          this.formError = false;
        }
      })
    );
  }

  // Metodo para manejar el envío del formulario de registro
  handleSubmit(): void {
    if (this.registerForm.invalid) {
      this.formError = true;
      this.registerForm.markAllAsTouched();

      this.snackBar.open('Completá correctamente el formulario', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    this.formError = false;
    this.isSubmitting = true;
    this.loaderService.show();

    const { confirmPassword, state, ...formValue } = this.registerForm.getRawValue();
    const payload: RegisterPayload = {
      ...formValue,
      country: state,
    };

    this.subscriptions.push(
      this.authService.register(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loaderService.hide();
          this.snackBar.open('Registration successful. Please sign in.', 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.loaderService.hide();
          this.formError = true;
          this.snackBar.open(this.getErrorMessage(error, 'Could not complete registration'), 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      })
    );

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onPasswordStrengthChange(state: PasswordStrengthState): void {
    this.passwordState = state;
  }

  onPasswordFocus(): void {
    this.showPasswordRequirements = true;
  }

  onPasswordBlur(): void {
    this.showPasswordRequirements = false;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { header?: { error?: string } } })?.error?.header?.error;
    return typeof message === 'string' ? message : fallback;
  }

}
