import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../interfaces/user';
import { environment } from '../../../../environments/environment';
import { catchError, firstValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';

interface ApiResponse<T> {
  header: {
    resultCode: number;
    error?: string;
  };
  data: T;
}

interface ApiHeaderOnlyResponse {
  header: {
    resultCode: number;
    error?: string;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private initPromise: Promise<void> | null = null;

  private readonly currentUserState = signal<User | null>(null);
  private readonly initializedState = signal(false);

  readonly currentUser = computed(() => this.currentUserState());
  readonly authenticated = computed(() => !!this.currentUserState());
  readonly initialized = computed(() => this.initializedState());

  initializeAuth(): Promise<void> {
    if (this.initializedState()) {
      return Promise.resolve();
    }

    if (!this.initPromise) {
      this.initPromise = firstValueFrom(
        this.fetchCurrentUser().pipe(
          tap((user) => this.currentUserState.set(user)),
          map(() => void 0),
          catchError(() => {
            this.currentUserState.set(null);
            return of(void 0);
          }),
          tap(() => this.initializedState.set(true))
        )
      );
    }

    return this.initPromise;
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.apiUrl}/auth/register`, payload, {
        withCredentials: true,
      })
      .pipe(map((response) => response.data));
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<ApiHeaderOnlyResponse>(
        `${this.apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(switchMap(() => this.me()));
  }

  me(): Observable<User> {
    return this.fetchCurrentUser().pipe(
      map((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        return user;
      }),
      tap((user) => {
        this.currentUserState.set(user);
        this.initializedState.set(true);
      })
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<ApiHeaderOnlyResponse>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        map(() => void 0),
        tap(() => this.currentUserState.set(null)),
        catchError(() => {
          this.currentUserState.set(null);
          return of(void 0);
        })
      );
  }

  getCurrentUser(): User | null {
    return this.currentUserState();
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  getUser(): User | null {
    return this.currentUserState();
  }

  updateCurrentUser(patch: Partial<User>): void {
    const currentUser = this.currentUserState();
    if (!currentUser) {
      return;
    }

    this.currentUserState.set({
      ...currentUser,
      ...patch,
    });
  }

  private fetchCurrentUser(): Observable<User | null> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        catchError(() => of(null))
      );
  }
}
