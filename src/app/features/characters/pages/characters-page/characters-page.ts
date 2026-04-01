import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CharactersService } from '../../services/characters.service';
import { Character} from '../../interfaces/character.interface';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/ui/components/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/ui/components/loader/loader';
import { SearchBarComponent } from '../../../../shared/ui/components/search-bar/search-bar';
import { PaginationControlsComponent } from '../../../../shared/ui/components/pagination-controls/pagination-controls';
import { createListPagination } from '../../../../shared/utils/list-pagination';

@Component({
  selector: 'app-characters-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent, SearchBarComponent, PaginationControlsComponent],
  templateUrl: './characters-page.html',
  styleUrl: './characters-page.css',
})
export class CharactersPage implements OnInit {

  private charactersService = inject(CharactersService);

  characters = signal<Character[]>([]);

  // Solo los 10 personajes correctos para la página local
  visibleCharacters = computed(() => {
    const localPage = this.currentPage();
    const start = ((localPage - 1) % 2) * 10;
    return this.characters().slice(start, start + 10);
  });
  isLoading = signal(true);
  hasError = signal(false);

  private pagination = createListPagination();

  currentPage = this.pagination.currentPage;
  totalPages = this.pagination.totalPages; // total de páginas locales
  pages = this.pagination.pages;
  apiPage = signal(1); // página real de la API
  searchTerm = this.pagination.searchTerm;

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters() {
    this.isLoading.set(true);
    this.hasError.set(false);

    // Calcular la página de la API
    const localPage = this.currentPage();
    const apiPage = Math.ceil(localPage / 2);
    this.apiPage.set(apiPage);

    this.charactersService
      .getCharacters(apiPage, this.searchTerm())
      .subscribe({
        next: (response) => {
          this.characters.set(response.results);
          // Calcular el total de páginas locales
          const totalCharacters = response.info.count;
          this.totalPages.set(Math.ceil(totalCharacters / 10));
          this.isLoading.set(false);
        },
        error: () => {
          this.characters.set([]);
          this.totalPages.set(0);
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }

  goToPage(page: number): void {
    if (!this.pagination.setPage(page)) {
      return;
    }

    this.loadCharacters();
  }


  //Busqueda por nombre
  onSearch(term: string): void {
    this.pagination.setSearchTerm(term);
    this.loadCharacters();
  }
}
