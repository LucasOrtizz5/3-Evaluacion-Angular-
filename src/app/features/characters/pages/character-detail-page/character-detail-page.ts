import {Component, inject, OnInit, signal, computed} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CharactersService } from '../../services/characters.service';
import { Character } from '../../interfaces/character.interface';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { StatusColorPipe } from '../../../../shared/pipes/status-color-pipe';
import { NgClass } from '@angular/common';
import { DetailLayoutComponent } from '../../../../shared/detail-layout/detail-layout';

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
  episodesPage = signal(1);

  episodesPerPage = 20; // valor fijo razonable

  visibleEpisodes = computed(() => {
    const page = this.episodesPage();
    const perPage = this.episodesPerPage;
    const start = (page - 1) * perPage;
    return this.episodes().slice(start, start + perPage);
  });

  hasMoreEpisodes = computed(() => {
    return this.episodesPage() * this.episodesPerPage < this.episodes().length;
  });

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
    this.episodesPage.set(this.episodesPage() + 1);
  }
}
