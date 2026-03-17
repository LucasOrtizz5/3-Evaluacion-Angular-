import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { RouterLoaderService } from '../../../../shared/services/router-loader.service';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatSnackBarModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private loaderService = inject(RouterLoaderService);

  private subscriptions: Subscription[] = [];

  readonly user = this.authService.currentUser;
  profileForm!: FormGroup;
  formError = false;

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (!currentUser || !this.profileForm) {
        return;
      }

      this.profileForm.patchValue({
        name: currentUser.name ?? '',
        email: currentUser.email ?? ''
      }, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [this.user()?.name || '', Validators.required],
      email: [this.user()?.email || '', [Validators.required, Validators.email]]
    });

    // El cartel de alerta desaparece cuando el formulario es válido
    this.subscriptions.push(
      this.profileForm.statusChanges.subscribe(status => {
        if (status === 'VALID') {
          this.formError = false;
        }
      })
    );
  }

  handleSave(): void {
    if (this.profileForm.invalid) {
      this.formError = true;
      this.profileForm.markAllAsTouched();

      this.snackBar.open('Completá correctamente el formulario', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.formError = false;

    this.snackBar.open('Profile update endpoint is not available yet.', 'Close', {
      duration: 3000
    });
  }

  logout(): void {
    this.loaderService.show();
    this.subscriptions.push(
      this.authService.logout().subscribe(() => {
        this.loaderService.hide();
        this.router.navigate(['/auth/login']);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
