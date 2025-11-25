import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { UploadSongPopup } from '../upload-song-popup/upload-song-popup';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl?: string;
}

@Component({
  selector: 'recommended-songs',
  imports: [CommonModule, UploadSongPopup],
  templateUrl: './recommended-songs.html',
  styleUrl: './recommended-songs.scss',
})
export class RecommendedSongs implements OnInit {
  recommendedSongs: Song[] = [];
  showUploadPopup: boolean = false;

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

  playSong(song: Song) {
    // Set the current track in the shared service
    this.api.setCurrentTrack({
      trackName: song.title,
      artistName: song.artist,
      trackImage: song.coverImage,
      audioUrl: song.audioUrl || `http://localhost:8082/tracks/${song.id}/audio`
    });
  }

  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onUploadSuccess() {
    // Refresh the recommended songs list after successful upload
    this.loadRecommendedSongs();
  }
}
