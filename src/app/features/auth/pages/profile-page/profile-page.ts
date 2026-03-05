import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage {

  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.getUser();

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/register']);
  }
}
