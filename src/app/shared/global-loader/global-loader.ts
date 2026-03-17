import { Component, inject } from '@angular/core';
import { RouterLoaderService } from '../services/router-loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.css',
})
export class GlobalLoaderComponent {
  loaderService = inject(RouterLoaderService);

  get isLoading() {
    return this.loaderService.isLoading;
  }
}
