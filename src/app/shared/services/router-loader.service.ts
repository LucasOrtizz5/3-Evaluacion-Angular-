import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterLoaderService {
  private router = inject(Router);

  isLoading = signal(false);

  constructor() {
    this.initializeRouterListener();
  }

  private initializeRouterListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart)
      )
      .subscribe(() => {
        this.isLoading.set(true);
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationError)
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }

  show(): void {
    this.isLoading.set(true);
  }

  hide(): void {
    this.isLoading.set(false);
  }
}
