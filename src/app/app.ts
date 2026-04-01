import { Component, inject } from '@angular/core';
import { MainLayout } from './layout/main-layout/main-layout';
import { GlobalLoaderComponent } from './shared/ui/components/global-loader/global-loader';
import { RouterLoaderService } from './core/services/router-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayout, GlobalLoaderComponent],
  template: `
    <app-global-loader></app-global-loader>
    <app-main-layout></app-main-layout>
  `
})
export class App {
  private loaderService = inject(RouterLoaderService);
}
