import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth';
import { CharactersService } from '../../features/characters/services/characters.service';
import { EpisodesService } from '../../features/episodes/services/episodes.service';
import { LocationsService } from '../../features/locations/services/locations.service';

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
  private episodesService = inject(EpisodesService);
  private locationsService = inject(LocationsService);
  private router = inject(Router);

  readonly charactersCount = signal(0);
  readonly episodesCount = signal(0);
  readonly locationsCount = signal(0);
  readonly user = this.authService.currentUser;
  readonly isAuthenticated = this.authService.authenticated;
  readonly isAdmin = signal(false);
  readonly isNavbarOpen = signal(false);
  readonly isUserMenuOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.isAdmin.set(this.user()?.role === 'admin');
        this.loadCharactersCount();
        this.loadEpisodesCount();
        this.loadLocationsCount();
        return;
      }

      this.isAdmin.set(false);
      this.charactersCount.set(0);
      this.episodesCount.set(0);
      this.locationsCount.set(0);
      this.isUserMenuOpen.set(false);
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

  private loadEpisodesCount(): void {
    this.episodesService.getEpisodes(1).subscribe({
      next: (response) => {
        this.episodesCount.set(response.info.count);
      },
      error: (err) => {
        console.error('Error fetching episodes count:', err);
        this.episodesCount.set(0);
      }
    });
  }

  private loadLocationsCount(): void {
    this.locationsService.getLocations(1).subscribe({
      next: (response) => {
        this.locationsCount.set(response.info.count);
      },
      error: (err) => {
        console.error('Error fetching locations count:', err);
        this.locationsCount.set(0);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isUserMenuOpen.set(false);
      this.closeNavbar();
      this.router.navigate(['/auth/login']);
    });
  }

  goToProfile(): void {
    this.isUserMenuOpen.set(false);
    this.closeNavbar();
    this.router.navigate(['/auth/profile']);
  }

  goToAdminDashboard(): void {
    this.isUserMenuOpen.set(false);
    this.closeNavbar();
    this.router.navigate(['/auth/admin-dashboard']);
  }

  toggleNavbar(): void {
    this.isNavbarOpen.update(value => !value);
  }

  closeNavbar(): void {
    this.isNavbarOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen.update((value) => !value);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }
}
