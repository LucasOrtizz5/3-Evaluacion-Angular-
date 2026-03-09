import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
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

  private subscriptions: Subscription[] = [];

  loginForm!: FormGroup;
  formError = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

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
        duration: 3000
      });
      return;
    }

    this.formError = false;

    // Validar credenciales contra localStorage
    const loginResult = this.authService.login(this.loginForm.value.email, this.loginForm.value.password);

    if (loginResult.success) {
      this.snackBar.open('¡Bienvenido de vuelta! 🎉', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/characters']);
    } else {
      this.formError = true;
      this.snackBar.open(loginResult.message, 'Cerrar', {
        duration: 3000
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
