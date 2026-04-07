import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth';
import { createFallbackAvatarUrl, resolveAvatarUrl } from '../../../../shared/utils/avatar-url';
import { EpisodeComment } from '../../interfaces/comment.interface';
import { EpisodeCommentsService } from '../../services/episode-comments.service';

@Component({
  selector: 'app-episode-comments-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './episode-comments-section.html',
  styleUrl: './episode-comments-section.css',
})
export class EpisodeCommentsSectionComponent implements OnChanges {
  @Input({ required: true }) episodeId!: number;
  @Input() episodeTitle = '';

  @Output() commentsChanged = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly commentsService = inject(EpisodeCommentsService);

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.authenticated;
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly editingCommentId = signal<string | null>(null);
  readonly openMenuId = signal<string | null>(null);
  readonly commentsPage = signal(1);
  private readonly commentsPerPage = 3;
  readonly brokenAvatarIds = signal<Record<string, boolean>>({});
  readonly threadState = computed(() => this.commentsService.getThreadState(this.episodeId));
  readonly comments = computed(() => this.commentsService.getComments(this.episodeId));
  readonly canWrite = computed(() => this.commentsService.canCreateComment(this.episodeId));
  readonly canModerateThread = computed(() => this.isAdmin());
  readonly placeholderAvatarUrl = computed(() => {
    const user = this.currentUser();
    const seed = user?.id || user?.email || 'guest-user';
    return createFallbackAvatarUrl(seed);
  });

  private readonly resetAvatarFailures = effect(() => {
    this.currentUser();
    this.brokenAvatarIds.set({});
  });

  readonly commentForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
  });

  readonly sortedComments = computed(() =>
    [...this.comments()].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
  );

  readonly visibleComments = computed(() => {
    const start = (this.commentsPage() - 1) * this.commentsPerPage;
    const end = start + this.commentsPerPage;
    return this.sortedComments().slice(start, end);
  });

  readonly hasMoreComments = computed(() =>
    this.commentsPage() * this.commentsPerPage < this.sortedComments().length
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodeId'] && this.episodeId) {
      this.commentsService.ensureEpisodeLoaded(this.episodeId);
      this.resetComposer();
      this.commentsPage.set(1);
    }
  }

  isEditing(commentId: string): boolean {
    return this.editingCommentId() === commentId;
  }

  toggleMenu(commentId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openMenuId.set(this.openMenuId() === commentId ? null : commentId);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  getAvatarUrl(comment: EpisodeComment): string {
    const brokenAvatars = this.brokenAvatarIds();
    if (brokenAvatars[comment.id]) {
      return this.placeholderAvatarUrl();
    }

    const user = this.currentUser();
    if (user && this.isOwnComment(comment)) {
      return resolveAvatarUrl(user.profileImageUrl, this.getUserSeed(user));
    }

    return resolveAvatarUrl(comment.authorAvatarUrl, comment.authorId);
  }

  onAvatarError(comment: EpisodeComment): void {
    this.brokenAvatarIds.update((state) => ({
      ...state,
      [comment.id]: true,
    }));
  }

  startCreate(): void {
    this.editingCommentId.set(null);
    this.commentForm.reset({ content: '' });
  }

  startEdit(comment: EpisodeComment): void {
    if (!this.commentsService.canEditComment(comment)) {
      return;
    }

    this.editingCommentId.set(comment.id);
    this.commentForm.setValue({ content: comment.content });
  }

  cancelEdit(): void {
    this.startCreate();
  }

  submitComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const content = this.commentForm.getRawValue().content || '';
    const editingCommentId = this.editingCommentId();

    if (editingCommentId) {
      this.commentsService.updateComment(this.episodeId, editingCommentId, content);
    } else {
      this.commentsService.addComment(this.episodeId, content);
    }

    this.commentsChanged.emit();
    this.startCreate();
    this.commentsPage.set(1);
  }

  removeComment(comment: EpisodeComment): void {
    if (!this.commentsService.deleteComment(this.episodeId, comment.id)) {
      return;
    }

    if (this.editingCommentId() === comment.id) {
      this.startCreate();
    }

    this.commentsChanged.emit();

    const maxPage = Math.max(Math.ceil(this.sortedComments().length / this.commentsPerPage), 1);
    if (this.commentsPage() > maxPage) {
      this.commentsPage.set(maxPage);
    }
  }

  toggleThreadLock(): void {
    if (!this.commentsService.toggleThreadLock(this.episodeId)) {
      return;
    }

    if (!this.canWrite()) {
      this.startCreate();
    }

    this.commentsChanged.emit();
  }

  formatDate(dateValue: string): string {
    return new Date(dateValue).toLocaleString('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  isOwnComment(comment: EpisodeComment): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }

    const userKey = this.getUserSeed(user);
    return comment.authorId === userKey;
  }

  canEditComment(comment: EpisodeComment): boolean {
    return this.commentsService.canEditComment(comment);
  }

  canDeleteComment(comment: EpisodeComment): boolean {
    return this.commentsService.canDeleteComment(comment);
  }

  showMoreComments(): void {
    if (!this.hasMoreComments()) {
      return;
    }

    this.commentsPage.update((value) => value + 1);
  }

  private resetComposer(): void {
    this.editingCommentId.set(null);
    this.brokenAvatarIds.set({});
    this.commentForm.reset({ content: '' });
  }

  private getUserSeed(user: { id?: string; email?: string }): string {
    return user.id || user.email || 'guest-user';
  }
}
