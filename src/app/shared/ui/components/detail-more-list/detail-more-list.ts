import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-detail-more-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-more-list.html',
  styleUrl: './detail-more-list.css',
})
export class DetailMoreListComponent<T extends { id?: number | string }> {
  @Input() items: T[] = [];
  @Input() hasMore = false;
  @Input() emptyMessage = '';
  @Input() moreLabel = '(more)';
  @Input({ required: true }) itemTemplate!: TemplateRef<{ $implicit: T; index: number }>;

  @Output() more = new EventEmitter<void>();

  onMore(): void {
    this.more.emit();
  }

  trackByItem(index: number, item: T): number | string {
    return item.id ?? index;
  }
}
