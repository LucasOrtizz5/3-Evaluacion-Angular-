import {Component, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CharactersService } from '../../services/characters.service';
import { Character } from '../../interfaces/character.interface';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { StatusColorPipe } from '../../../../shared/pipes/status-color-pipe';
import { NgClass } from '@angular/common';
import { DetailLayoutComponent } from '../../../../shared/detail-layout/detail-layout';
import { createDetailPagination } from '../../../../shared/utils/detail-pagination';

interface Episode {
  id: number;
  name: string;
  episode: string;
}

@Component({
  selector: 'app-character-detail-page',
  standalone: true,
  imports: [DetailLayoutComponent, TranslatePipe, StatusColorPipe, NgClass],
  templateUrl: './character-detail-page.html',
  styleUrl: './character-detail-page.css',
})
export class CharacterDetailPage implements OnInit {

  private route = inject(ActivatedRoute);
  private charactersService = inject(CharactersService);

  character = signal<Character | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  episodes = signal<Episode[]>([]);
  private episodesPagination = createDetailPagination(this.episodes, 20);
  visibleEpisodes = this.episodesPagination.visibleItems;
  hasMoreEpisodes = this.episodesPagination.hasMore;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.charactersService.getCharacterById(+id).subscribe({
      next: (character: Character) => {
        this.character.set(character);
        this.isLoading.set(false);

        if (character.episode?.length) {
          const episodeIds = character.episode
            .map(url => url.split('/').pop())
            .join(',');

          this.charactersService
            .getEpisodesByIds(episodeIds)
            .subscribe((episodes: any) => {
              this.episodes.set(
                Array.isArray(episodes) ? episodes : [episodes]
              );
              this.episodesPagination.reset();
            });
        }
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  showMoreEpisodes() {
    this.episodesPagination.showMore();
  }
}
