import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth';
import { User } from '../../auth/interfaces/user';
import { EpisodeComment, EpisodeCommentThreadState } from '../interfaces/comment.interface';
import { environment } from '../../../../environments/environment';
import { catchError, map, of } from 'rxjs';

interface ApiResponse<T> {
  header: {
    resultCode: number;
    error?: string;
  };
  data: T;
}

interface EpisodeCommentsApiData {
  comments: EpisodeComment[];
  thread: EpisodeCommentThreadState;
}

@Injectable({
  providedIn: 'root',
})
export class EpisodeCommentsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/episodes`;

  private readonly commentsState = signal<Record<number, EpisodeComment[]>>({});
  private readonly threadState = signal<Record<number, EpisodeCommentThreadState>>({});
  private readonly loadedEpisodes = new Set<number>();

  readonly activeUser = computed(() => this.authService.currentUser());

  ensureEpisodeLoaded(episodeId: number): void {
    if (!episodeId || this.loadedEpisodes.has(episodeId)) {
      return;
    }

    this.refreshEpisode(episodeId);
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

    this.http
      .post<ApiResponse<EpisodeComment>>(
        `${this.apiUrl}/${episodeId}/comments`,
        { content: normalizedContent },
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.data),
        catchError(() => of(null)),
      )
      .subscribe((createdComment) => {
        if (!createdComment) {
          this.refreshEpisode(episodeId);
          return;
        }

        this.commentsState.update((state) => ({
          ...state,
          [episodeId]: [createdComment, ...(state[episodeId] ?? [])],
        }));
      });

    return null;
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

    this.http
      .patch<ApiResponse<EpisodeComment>>(
        `${this.apiUrl}/${episodeId}/comments/${commentId}`,
        { content: normalizedContent },
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.data),
        catchError(() => of(null)),
      )
      .subscribe((updatedComment) => {
        if (!updatedComment) {
          this.refreshEpisode(episodeId);
          return;
        }

        this.commentsState.update((state) => ({
          ...state,
          [episodeId]:
            state[episodeId]?.map((comment) =>
              comment.id === commentId ? updatedComment : comment,
            ) ?? [],
        }));
      });

    return null;
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

    this.http
      .delete<ApiResponse<unknown>>(`${this.apiUrl}/${episodeId}/comments/${commentId}`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) {
          this.refreshEpisode(episodeId);
        }
      });

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

    this.http
      .patch<ApiResponse<EpisodeCommentThreadState>>(
        `${this.apiUrl}/${episodeId}/comments/thread-lock/toggle`,
        {},
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.data),
        catchError(() => of(null)),
      )
      .subscribe((thread) => {
        if (!thread) {
          this.refreshEpisode(episodeId);
          return;
        }

        this.threadState.update((state) => ({
          ...state,
          [episodeId]: thread,
        }));
      });

    return nextThread;
  }

  getThreadState(episodeId: number): EpisodeCommentThreadState {
    const currentState = this.threadState()[episodeId];
    return currentState ?? {
      episodeId,
      commentsLocked: false,
    };
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

  private refreshEpisode(episodeId: number): void {
    this.http
      .get<ApiResponse<EpisodeCommentsApiData>>(`${this.apiUrl}/${episodeId}/comments`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data),
        catchError(() =>
          of<EpisodeCommentsApiData>({
            comments: [],
            thread: {
              episodeId,
              commentsLocked: false,
            },
          }),
        ),
      )
      .subscribe((payload) => {
        this.commentsState.update((state) => ({
          ...state,
          [episodeId]: payload.comments,
        }));

        this.threadState.update((state) => ({
          ...state,
          [episodeId]: payload.thread,
        }));

        this.loadedEpisodes.add(episodeId);
      });
  }
}
