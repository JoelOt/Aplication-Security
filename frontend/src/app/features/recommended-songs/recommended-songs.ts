import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { UploadSongPopup } from '../upload-song-popup/upload-song-popup';
import { SongDetailsPopup } from '../song-details-popup/song-details-popup';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl?: string;
  description?: string;
  genre?: string;
}

@Component({
  selector: 'recommended-songs',
  imports: [CommonModule, UploadSongPopup, SongDetailsPopup],
  templateUrl: './recommended-songs.html',
  styleUrl: './recommended-songs.scss',
})
export class RecommendedSongs implements OnInit {
  recommendedSongs: Song[] = [];
  showUploadPopup: boolean = false;
  isSearching: boolean = false;
  selectedSong: Song | null = null;
  isArtist: boolean = false;

  constructor(
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is an artist
      this.api.currentUser$.subscribe(user => {
        this.isArtist = user?.role === 'ROLE_ARTIST';
        this.cdr.detectChanges();
      });

      // Cargar canciones recomendadas inicialmente
      this.loadRecommendedSongs();

      // Suscribirse a los resultados de búsqueda
      this.api.searchResults$.subscribe(results => {
        if (results === null) {
          // null significa que se limpió la búsqueda, cargar todas las canciones
          this.isSearching = false;
          this.loadRecommendedSongs();
        } else if (results.length > 0) {
          // Hay resultados de búsqueda, mostrarlos
          this.isSearching = true;
          this.recommendedSongs = results;
          this.cdr.detectChanges();
        } else {
          // Array vacío significa que no hay resultados para la búsqueda
          this.isSearching = true;
          this.recommendedSongs = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadRecommendedSongs() {
    this.api.get<Song[]>('tracks/recommended')
      .subscribe({
        next: (songs) => {
          this.recommendedSongs = songs;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar canciones recomendadas', err);
          this.cdr.detectChanges();
        }
      });
  }

  playSong(song: Song) {
    // Set the current track in the shared service
    this.api.setCurrentTrack({
      trackName: song.title,
      artistName: song.artist,
      trackImage: song.coverImage,
      audioUrl: song.audioUrl || `/api/tracks/${song.id}/audio`
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

  showSongDetails(song: Song) {
    this.selectedSong = song;
  }

  closeSongDetails() {
    this.selectedSong = null;
  }

  playFromPopup(song: Song) {
    this.playSong(song);
  }
}
