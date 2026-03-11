import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth';
import { CharactersService } from '../../features/characters/services/characters.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  private authService = inject(AuthService);
  private characterService = inject(CharactersService);
  private router = inject(Router);

  readonly charactersCount = signal(0);
  readonly user = this.authService.currentUser;
  readonly isAuthenticated = this.authService.authenticated;

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.loadCharactersCount();
        return;
      }

      this.charactersCount.set(0);
    });
  }

  private loadCharactersCount(): void {
    this.characterService.getCharacters(1).subscribe({
      next: (response) => {
        this.charactersCount.set(response.info.count);
      },
      error: (err) => {
        console.error('Error fetching characters count:', err);
        this.charactersCount.set(0);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/auth/profile']);
  }
}
