import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];

  get visibleItems(): BreadcrumbItem[] {
    return this.items.filter(item => item.label?.trim().length > 0);
  }
}
