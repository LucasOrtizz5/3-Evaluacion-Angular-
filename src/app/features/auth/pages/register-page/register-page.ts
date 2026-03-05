import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordStrengthDirective, PasswordStrengthState } from '../../../../shared/directives/password-strength';
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordStrengthDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatProgressBarModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  private subscriptions: Subscription[] = [];

  private snackBar = inject(MatSnackBar);

  registerForm!: FormGroup;

  formError = false;

  passwordState: PasswordStrengthState = {
    minLength: false,
    uppercase: false,
    number: false,
    strength: 'débil',
    percentage: 0
  };

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

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
        duration: 3000
      });
      return;
    }

    // Verificar si el email ya está registrado
    const email = this.registerForm.value.email;
    if (this.authService.emailExists(email)) {
      this.formError = true;
      this.snackBar.open('Este email ya está registrado. Por favor usá otro.', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.formError = false;

    const user = {
      id: Date.now().toString(),
      ...this.registerForm.value
    };

    this.authService.register(user as any);

    this.snackBar.open('Registro exitoso 🎉', 'Cerrar', {
      duration: 3000
    });

    this.router.navigate(['/auth/profile']);

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onPasswordStrengthChange(state: PasswordStrengthState): void {
    this.passwordState = state;
  }

}
