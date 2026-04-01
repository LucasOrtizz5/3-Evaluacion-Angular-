import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Input() buttonLabel = 'Search';
  @Output() search = new EventEmitter<string>();

  onSearch(term: string): void {
    this.search.emit(term);
  }
}
