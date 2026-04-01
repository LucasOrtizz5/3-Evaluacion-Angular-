import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  templateUrl: './pagination-controls.html',
  styleUrl: './pagination-controls.css',
})
export class PaginationControlsComponent {
  @Input() isLoading = false;
  @Input() hasError = false;
  @Input() currentPage = 1;
  @Input() totalPages = 0;
  @Input() pages: number[] = [];

  @Output() pageChange = new EventEmitter<number>();

  onPrevious(): void {
    this.pageChange.emit(this.currentPage - 1);
  }

  onNext(): void {
    this.pageChange.emit(this.currentPage + 1);
  }

  onSelectPage(page: number): void {
    this.pageChange.emit(page);
  }
}
