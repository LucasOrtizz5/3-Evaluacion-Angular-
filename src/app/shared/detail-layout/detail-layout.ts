import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb';
import { LoaderComponent } from '../loader/loader';

@Component({
  selector: 'app-detail-layout',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, LoaderComponent],
  templateUrl: './detail-layout.html',
  styleUrl: './detail-layout.css',
})
export class DetailLayoutComponent {
  @Input() breadcrumbItems: BreadcrumbItem[] = [];

  @Input() loading = false;
  @Input() hasError = false;
  @Input() loadingMessage = 'Loading detail...';
  @Input() errorMessage = 'An unexpected error occurred.';

  @Input() mediaSrc: string | null = null;
  @Input() mediaAlt = 'Detail image';
  @Input() showMedia = true;

  @Input() infoTitle = 'Detail Info';
  @Input() contentTitle = 'Related Information';
}
