import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { RouterLoaderService } from '../../../../core/services/router-loader.service';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatCheckboxModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private loaderService = inject(RouterLoaderService);

  private subscriptions: Subscription[] = [];

  loginForm!: FormGroup;
  formError = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Cargar datos guardados si existen
    this.loadSavedCredentials();

    // El cartel de alerta desaparece cuando el formulario es válido
    this.subscriptions.push(
      this.loginForm.statusChanges.subscribe(status => {
        if (status === 'VALID') {
          this.formError = false;
        }
      })
    );
  }

  handleSubmit(): void {
    if (this.loginForm.invalid) {
      this.formError = true;
      this.loginForm.markAllAsTouched();

      this.snackBar.open('Completá correctamente el formulario', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    this.formError = false;
    this.isSubmitting = true;
    this.loaderService.show();

    // Guardar solo el email si remember me está marcado.
    if (this.loginForm.value.rememberMe) {
      this.saveCredentials(this.loginForm.value.email);
    } else {
      this.clearSavedCredentials();
    }

    this.subscriptions.push(
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loaderService.hide();
          this.snackBar.open('Welcome back!', 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
          this.router.navigate(['/characters']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.loaderService.hide();
          this.formError = true;
          this.snackBar.open(this.getErrorMessage(error, 'Invalid email or password'), 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      })
    );
  }

  private saveCredentials(email: string): void {
    const credentials = { email };
    localStorage.setItem('rememberMeCredentials', JSON.stringify(credentials));
  }

  private loadSavedCredentials(): void {
    const saved = localStorage.getItem('rememberMeCredentials');
    if (saved) {
      const credentials = JSON.parse(saved);
      this.loginForm.patchValue({
        email: credentials.email,
        rememberMe: true
      });
    }
  }

  private clearSavedCredentials(): void {
    localStorage.removeItem('rememberMeCredentials');
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { header?: { error?: string } } })?.error?.header?.error;
    return typeof message === 'string' ? message : fallback;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
