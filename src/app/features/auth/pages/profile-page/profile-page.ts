import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { RouterLoaderService } from '../../../../core/services/router-loader.service';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetailLayoutComponent } from '../../../../shared/ui/layouts/detail-layout/detail-layout';
import { User } from '../../interfaces/user';
import { EpisodeFavoritesService } from '../../../episodes/services/episode-favorites.service';
import { FavoriteEpisode } from '../../../episodes/interfaces/episode.interface';
import { createDetailPagination } from '../../../../shared/utils/detail-pagination';

interface ProfileDraft {
  nickname: string;
  birthDate: string;
  location: string;
  profileImageUrl: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, DetailLayoutComponent, RouterLink],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private loaderService = inject(RouterLoaderService);
  private episodeFavoritesService = inject(EpisodeFavoritesService);

  private subscriptions: Subscription[] = [];
  private readonly localStoragePrefix = 'profile-draft:';
  private readonly maxCharacterAvatarId = 826;

  readonly user = this.authService.currentUser;
  readonly hasProfileError = computed(() => !this.user());
  readonly draft = signal<ProfileDraft>({
    nickname: '',
    birthDate: '',
    location: '',
    profileImageUrl: ''
  });

  readonly favoriteEpisodes = computed<FavoriteEpisode[]>(() =>
    [...this.episodeFavoritesService.favorites()]
      .sort((a, b) => a.id - b.id)
  );
  private episodesPagination = createDetailPagination(this.favoriteEpisodes, 20);
  readonly visibleEpisodes = this.episodesPagination.visibleItems;
  readonly hasMoreEpisodes = this.episodesPagination.hasMore;

  readonly profileDisplayName = computed(() => this.user()?.name || 'Sin datos');
  readonly profileEmail = computed(() => this.user()?.email || 'Sin datos');
  readonly profileNickname = computed(() => this.draft().nickname || 'Sin datos');
  readonly profileBirthDate = computed(() => this.draft().birthDate || 'Sin datos');
  readonly profileLocation = computed(() => this.draft().location || 'Sin datos');

  readonly placeholderAvatarUrl = computed(() => {
    const userKey = this.user()?.id || this.user()?.email || 'guest-user';
    const characterId = this.getAvatarCharacterId(userKey);
    return `https://rickandmortyapi.com/api/character/avatar/${characterId}.jpeg`;
  });

  readonly failedCustomImageUrl = signal('');

  readonly displayImageUrl = computed(() => {
    const customImage = this.draft().profileImageUrl.trim();
    if (customImage && customImage !== this.failedCustomImageUrl()) {
      return customImage;
    }

    return this.placeholderAvatarUrl();
  });

  profileForm!: FormGroup;
  imageForm!: FormGroup;

  formError = false;
  imageError = false;
  isEditingProfile = false;
  isEditingImage = false;
  isManagingFavorites = false;

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (!currentUser) {
        return;
      }

      this.hydrateDraft(currentUser);

      if (this.profileForm) {
        this.profileForm.patchValue({
          nickname: this.draft().nickname,
          location: this.draft().location,
        }, { emitEvent: false });
      }

      if (this.imageForm) {
        this.imageForm.patchValue({
          profileImageUrl: this.draft().profileImageUrl,
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nickname: [this.draft().nickname, [Validators.required, Validators.maxLength(25)]],
      location: [this.draft().location, [Validators.required, Validators.maxLength(80)]],
    });

    this.imageForm = this.fb.group({
      profileImageUrl: [this.draft().profileImageUrl, [Validators.required, Validators.pattern('https?://.+')]],
    });

    this.subscriptions.push(
      this.profileForm.statusChanges.subscribe(status => {
        if (status === 'VALID') {
          this.formError = false;
        }
      })
    );

    this.subscriptions.push(
      this.imageForm.statusChanges.subscribe(status => {
        if (status === 'VALID') {
          this.imageError = false;
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

    const formValue = this.profileForm.getRawValue();
    this.draft.update(value => ({
      ...value,
      nickname: (formValue.nickname || '').trim(),
      location: (formValue.location || '').trim(),
    }));
    this.persistDraft();

    this.formError = false;
    this.isEditingProfile = false;

    this.snackBar.open('Información personal actualizada localmente.', 'Cerrar', {
      duration: 3000
    });
  }

  toggleProfileEditor(): void {
    if (this.isEditingProfile) {
      this.handleSave();
      return;
    }

    this.isEditingProfile = true;
    this.profileForm.patchValue({
      nickname: this.draft().nickname,
      location: this.draft().location,
    }, { emitEvent: false });
  }

  cancelProfileEditor(): void {
    this.isEditingProfile = false;
    this.formError = false;
    this.profileForm.patchValue({
      nickname: this.draft().nickname,
      location: this.draft().location,
    }, { emitEvent: false });
  }

  toggleImageEditor(): void {
    this.isEditingImage = !this.isEditingImage;
    this.imageError = false;

    if (this.isEditingImage) {
      this.imageForm.patchValue({ profileImageUrl: this.draft().profileImageUrl }, { emitEvent: false });
    }
  }

  saveImage(): void {
    if (this.imageForm.invalid) {
      this.imageError = true;
      this.imageForm.markAllAsTouched();
      this.snackBar.open('Ingresá una URL de imagen válida.', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const profileImageUrl = (this.imageForm.getRawValue().profileImageUrl || '').trim();
    this.draft.update(value => ({ ...value, profileImageUrl }));
    this.persistDraft();
    this.failedCustomImageUrl.set('');

    this.imageError = false;
    this.isEditingImage = false;

    this.snackBar.open('Foto de perfil actualizada.', 'Cerrar', {
      duration: 3000
    });
  }

  cancelImageEditor(): void {
    this.isEditingImage = false;
    this.imageError = false;
    this.imageForm.patchValue({ profileImageUrl: this.draft().profileImageUrl }, { emitEvent: false });
  }

  removeProfilePhoto(): void {
    this.draft.update(value => ({ ...value, profileImageUrl: '' }));
    this.persistDraft();
    this.failedCustomImageUrl.set('');
    this.imageError = false;
    this.isEditingImage = false;
    this.imageForm.patchValue({ profileImageUrl: '' }, { emitEvent: false });
  }

  onProfileImageError(): void {
    const customImage = this.draft().profileImageUrl.trim();
    if (customImage) {
      this.failedCustomImageUrl.set(customImage);
    }
  }

  showMoreEpisodes(): void {
    this.episodesPagination.showMore();
  }

  removeFavorite(episodeId: number): void {
    this.episodeFavoritesService.removeFavorite(episodeId);

    if (this.favoriteEpisodes().length === 0) {
      this.isManagingFavorites = false;
    }
  }

  toggleFavoritesEdition(): void {
    this.isManagingFavorites = !this.isManagingFavorites;
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

  private hydrateDraft(user: User): void {
    const persisted = this.readDraftFromStorage(user);
    const baseLocation = [user.city, user.country].filter(Boolean).join(', ') || user.address || '';

    this.draft.set({
      nickname: persisted?.nickname || '',
      birthDate: persisted?.birthDate || '',
      location: persisted?.location || baseLocation,
      profileImageUrl: persisted?.profileImageUrl || '',
    });
  }

  private persistDraft(): void {
    const user = this.user();
    if (!user) {
      return;
    }

    localStorage.setItem(this.getStorageKey(user), JSON.stringify(this.draft()));
  }

  private readDraftFromStorage(user: User): ProfileDraft | null {
    const rawValue = localStorage.getItem(this.getStorageKey(user));
    if (!rawValue) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Partial<ProfileDraft>;
      return {
        nickname: parsedValue.nickname ?? '',
        birthDate: parsedValue.birthDate ?? '',
        location: parsedValue.location ?? '',
        profileImageUrl: parsedValue.profileImageUrl ?? '',
      };
    } catch {
      return null;
    }
  }

  private getStorageKey(user: User): string {
    return `${this.localStoragePrefix}${user.id || user.email}`;
  }

  private getAvatarCharacterId(seed: string): number {
    const hash = seed
      .split('')
      .reduce((acc, current) => ((acc << 5) - acc + current.charCodeAt(0)) | 0, 0);

    return (Math.abs(hash) % this.maxCharacterAvatarId) + 1;
  }
}
