import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth';
import { User } from '../../auth/interfaces/user';
import { EpisodeComment, EpisodeCommentThreadState } from '../interfaces/comment.interface';
import { createFallbackAvatarUrl, resolveStoredProfileAvatarUrl } from '../../../shared/utils/avatar-url';

@Injectable({
  providedIn: 'root',
})
export class EpisodeCommentsService {
  private readonly authService = inject(AuthService);
  private readonly commentsStoragePrefix = 'episode-comments:v1:';
  private readonly threadStoragePrefix = 'episode-comments-thread:v1:';

  private readonly commentsState = signal<Record<number, EpisodeComment[]>>({});
  private readonly threadState = signal<Record<number, EpisodeCommentThreadState>>({});
  private readonly loadedEpisodes = new Set<number>();

  readonly activeUser = computed(() => this.authService.currentUser());

  ensureEpisodeLoaded(episodeId: number): void {
    if (!episodeId || this.loadedEpisodes.has(episodeId)) {
      return;
    }

    const storedComments = this.readComments(episodeId);
    const storedThreadState = this.readThreadState(episodeId);

    this.commentsState.update((state) => ({
      ...state,
      [episodeId]: storedComments,
    }));

    this.threadState.update((state) => ({
      ...state,
      [episodeId]: storedThreadState,
    }));

    this.loadedEpisodes.add(episodeId);
  }

  getComments(episodeId: number): EpisodeComment[] {
    return this.commentsState()[episodeId] ?? [];
  }

  isCommentsLocked(episodeId: number): boolean {
    return this.getThreadState(episodeId).commentsLocked;
  }

  canCreateComment(episodeId: number): boolean {
    const user = this.activeUser();
    if (!user) {
      return false;
    }

    return this.isAdmin(user) || !this.isCommentsLocked(episodeId);
  }

  canEditComment(comment: EpisodeComment): boolean {
    const user = this.activeUser();
    if (!user) {
      return false;
    }

    return this.isAdmin(user) || this.isOwner(user, comment);
  }

  canDeleteComment(comment: EpisodeComment): boolean {
    const user = this.activeUser();
    if (!user) {
      return false;
    }

    return this.isAdmin(user) || this.isOwner(user, comment);
  }

  addComment(episodeId: number, content: string): EpisodeComment | null {
    this.ensureEpisodeLoaded(episodeId);

    const user = this.activeUser();
    if (!user || (!this.canCreateComment(episodeId) && !this.isAdmin(user))) {
      return null;
    }

    const normalizedContent = content.trim();
    if (!normalizedContent) {
      return null;
    }

    const timestamp = new Date().toISOString();
    const comment: EpisodeComment = {
      id: this.createId(),
      episodeId,
      authorId: this.getUserId(user),
      authorName: user.name,
      authorEmail: user.email,
      authorRole: user.role === 'admin' ? 'admin' : 'user',
      authorAvatarUrl: this.resolveAuthorAvatar(user),
      content: normalizedContent,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.commentsState.update((state) => ({
      ...state,
      [episodeId]: [comment, ...(state[episodeId] ?? [])],
    }));

    this.persistComments(episodeId);
    return comment;
  }

  updateComment(episodeId: number, commentId: string, content: string): EpisodeComment | null {
    this.ensureEpisodeLoaded(episodeId);

    const normalizedContent = content.trim();
    if (!normalizedContent) {
      return null;
    }

    const currentComments = this.getComments(episodeId);
    const existingComment = currentComments.find((comment) => comment.id === commentId);
    if (!existingComment || !this.canEditComment(existingComment)) {
      return null;
    }

    const updatedComment: EpisodeComment = {
      ...existingComment,
      content: normalizedContent,
      updatedAt: new Date().toISOString(),
    };

    this.commentsState.update((state) => ({
      ...state,
      [episodeId]: state[episodeId]?.map((comment) => comment.id === commentId ? updatedComment : comment) ?? [],
    }));

    this.persistComments(episodeId);
    return updatedComment;
  }

  deleteComment(episodeId: number, commentId: string): boolean {
    this.ensureEpisodeLoaded(episodeId);

    const currentComments = this.getComments(episodeId);
    const existingComment = currentComments.find((comment) => comment.id === commentId);
    if (!existingComment || !this.canDeleteComment(existingComment)) {
      return false;
    }

    this.commentsState.update((state) => ({
      ...state,
      [episodeId]: state[episodeId]?.filter((comment) => comment.id !== commentId) ?? [],
    }));

    this.persistComments(episodeId);
    return true;
  }

  toggleThreadLock(episodeId: number): EpisodeCommentThreadState | null {
    this.ensureEpisodeLoaded(episodeId);

    const user = this.activeUser();
    if (!user || !this.isAdmin(user)) {
      return null;
    }

    const currentThread = this.getThreadState(episodeId);
    const nextThread: EpisodeCommentThreadState = {
      ...currentThread,
      episodeId,
      commentsLocked: !currentThread.commentsLocked,
      lockedByUserId: this.getUserId(user),
      lockedByUserName: user.name,
      lockedByUserRole: 'admin',
      lockedAt: new Date().toISOString(),
    };

    this.threadState.update((state) => ({
      ...state,
      [episodeId]: nextThread,
    }));

    this.persistThreadState(episodeId);
    return nextThread;
  }

  getThreadState(episodeId: number): EpisodeCommentThreadState {
    const currentState = this.threadState()[episodeId];
    return currentState ?? {
      episodeId,
      commentsLocked: false,
    };
  }

  private resolveAuthorAvatar(user: User): string {
    return resolveStoredProfileAvatarUrl(user.id, user.email, this.getUserId(user));
  }

  private persistComments(episodeId: number): void {
    localStorage.setItem(
      this.getCommentsStorageKey(episodeId),
      JSON.stringify(this.getComments(episodeId))
    );
  }

  private readComments(episodeId: number): EpisodeComment[] {
    const rawValue = localStorage.getItem(this.getCommentsStorageKey(episodeId));
    if (!rawValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(rawValue) as EpisodeComment[];
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  }

  private persistThreadState(episodeId: number): void {
    localStorage.setItem(
      this.getThreadStorageKey(episodeId),
      JSON.stringify(this.getThreadState(episodeId))
    );
  }

  private readThreadState(episodeId: number): EpisodeCommentThreadState {
    const rawValue = localStorage.getItem(this.getThreadStorageKey(episodeId));
    if (!rawValue) {
      return {
        episodeId,
        commentsLocked: false,
      };
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Partial<EpisodeCommentThreadState>;
      return {
        episodeId,
        commentsLocked: Boolean(parsedValue.commentsLocked),
        lockedByUserId: parsedValue.lockedByUserId,
        lockedByUserName: parsedValue.lockedByUserName,
        lockedByUserRole: parsedValue.lockedByUserRole,
        lockedAt: parsedValue.lockedAt,
      };
    } catch {
      return {
        episodeId,
        commentsLocked: false,
      };
    }
  }

  private isAdmin(user: User): boolean {
    return user.role === 'admin';
  }

  private isOwner(user: User, comment: EpisodeComment): boolean {
    return this.getUserId(user) === comment.authorId;
  }

  private getUserId(user: User): string {
    return user.id || user.email || 'guest-user';
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private getCommentsStorageKey(episodeId: number): string {
    return `${this.commentsStoragePrefix}${episodeId}`;
  }

  private getThreadStorageKey(episodeId: number): string {
    return `${this.threadStoragePrefix}${episodeId}`;
  }
}
