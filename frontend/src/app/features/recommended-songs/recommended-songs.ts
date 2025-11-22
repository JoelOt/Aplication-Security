import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/api.service';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl?: string;
}

@Component({
  selector: 'recommended-songs',
  imports: [CommonModule],
  templateUrl: './recommended-songs.html',
  styleUrl: './recommended-songs.scss',
})
export class RecommendedSongs implements OnInit {
  recommendedSongs: Song[] = [];

  constructor(
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Suscribirse a los resultados de búsqueda
      this.api.searchResults$.subscribe(results => {
        if (results.length > 0) {
          this.recommendedSongs = results;
        } else {
          // Si no hay búsqueda, cargar recomendados
          this.loadRecommendedSongs();
        }
      });
    }
  }

  loadRecommendedSongs() {
    this.api.get<Song[]>('tracks/recommended')
      .subscribe({
        next: (songs) => {
          this.recommendedSongs = songs;
        },
        error: (err) => {
          console.error('Error al cargar canciones recomendadas', err);
        }
      });
  }
}
