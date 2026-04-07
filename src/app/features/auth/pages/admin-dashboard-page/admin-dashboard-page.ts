import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AdminUserWithFavorites } from '../../services/auth';
import { BreadcrumbComponent } from '../../../../shared/ui/components/breadcrumb/breadcrumb';
import { DetailMoreListComponent } from '../../../../shared/ui/components/detail-more-list/detail-more-list';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbComponent, DetailMoreListComponent],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly subscriptions: Subscription[] = [];
  private readonly usersPageSize = 4;
  private readonly favoritesPageSize = 2;

  readonly users = signal<AdminUserWithFavorites[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly usersPage = signal(1);
  readonly favoritePages = signal<Record<string, number>>({});

  readonly visibleUsers = computed(() =>
    this.users().slice(
      (this.usersPage() - 1) * this.usersPageSize,
      (this.usersPage() - 1) * this.usersPageSize + this.usersPageSize,
    )
  );

  readonly hasMoreUsers = computed(() =>
    this.usersPage() * this.usersPageSize < this.users().length
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.usersPage.set(1);
    this.favoritePages.set({});

    this.subscriptions.push(
      this.authService.getAdminUsersWithFavorites().subscribe({
        next: (users) => {
          this.users.set(users);
          this.isLoading.set(false);
        },
        error: () => {
          this.users.set([]);
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      })
    );
  }

  showMoreUsers(): void {
    this.usersPage.update((value) => value + 1);
  }

  getVisibleFavorites(user: AdminUserWithFavorites) {
    const currentPage = this.getFavoritePage(user.id);
    const start = (currentPage - 1) * this.favoritesPageSize;
    return user.favorites.slice(start, start + this.favoritesPageSize);
  }

  hasMoreFavorites(user: AdminUserWithFavorites): boolean {
    return this.getFavoritePage(user.id) * this.favoritesPageSize < user.favorites.length;
  }

  showMoreFavorites(userId: string): void {
    this.favoritePages.update((state) => ({
      ...state,
      [userId]: this.getFavoritePage(userId) + 1,
    }));
  }

  private getFavoritePage(userId: string): number {
    return this.favoritePages()[userId] ?? 1;
  }
}
