import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordStrengthDirective } from '../../../../shared/directives/password-strength';
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordStrengthDirective, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSnackBarModule],
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

  passwordState = {
    minLength: false,
    uppercase: false,
    number: false
  };

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Ejemplo real de suscripción
    this.subscriptions.push(
      this.registerForm.valueChanges.subscribe(value => {
      })
    );

    // El cartel de alerta de completar el formulario desaparece cuando el formulario es válido
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

  onPasswordStrengthChange(state: any) {
    this.passwordState = state;
  }

}
