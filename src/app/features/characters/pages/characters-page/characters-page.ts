import { Component, inject, OnInit, signal } from '@angular/core';
import { CharactersService } from '../../services/characters.service';
import { Character} from '../../interfaces/character.interface';
import { computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/loader/loader';

@Component({
  selector: 'app-characters-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent],
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

  currentPage = signal(1);
  totalPages = signal(0); // total de páginas locales
  apiPage = signal(1); // página real de la API

  searchTerm = signal('');

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

  //Paginación
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const windowSize = 3;

    if (total === 0) return [];

    let start = current - 1;
    let end = current + 1;

    if (current <= 2) {
      start = 1;
      end = Math.min(windowSize, total);
    }

    if (current >= total - 1) {
      start = Math.max(total - 2, 1);
      end = total;
    }

    const pagesArray = [];
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }

    return pagesArray;
  });
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadCharacters();
  }


  //Busqueda por nombre
  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadCharacters();
  }
}
