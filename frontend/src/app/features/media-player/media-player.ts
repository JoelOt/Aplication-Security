import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/api.service'; // Importa tu servicio central

@Component({
  selector: 'media-player',
  imports: [CommonModule],
  templateUrl: './media-player.html',
  styleUrl: './media-player.scss',
})

export class MediaPlayer implements OnInit, OnDestroy {
  trackImage = '/assets/album-placeholder.png';
  trackName = 'Song Title';
  artistName = 'Artist Name';
  currentTime = '0:00';
  totalTime = '0:00';
  progress = 0;
  volume = 70;
  isPlaying = false;

  private audio: HTMLAudioElement | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private api: ApiService // inyecta el servicio
  ) {}

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Pedimos la info de la canción al backend
      this.api.get<{ trackName: string; artistName: string; trackImage: string; audioUrl: string; duration: number }>('track/current')
        .subscribe(track => {
          this.trackName = track.trackName;
          this.artistName = track.artistName;
          this.trackImage = track.trackImage;

          // Crear elemento de audio
          this.audio = new Audio(track.audioUrl);
          this.audio.volume = this.volume / 100;

          // Si el backend no devuelve duración exacta, usar evento loadedmetadata
          if (track.duration) {
            this.totalTime = this.formatTime(track.duration);
          } else {
            this.audio.addEventListener('loadedmetadata', () => {
              this.totalTime = this.formatTime(this.audio!.duration);
            });
          }

          this.audio.addEventListener('timeupdate', () => this.updateProgress());
          this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.progress = 0;
          });
        });
    }
  }

  ngOnDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  setVolume(event: MouseEvent) {
    const volumeBar = event.currentTarget as HTMLElement;
    const rect = volumeBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    this.volume = Math.round((x / width) * 100);
    
    if (this.audio) {
      this.audio.volume = this.volume / 100;
    }
  }

  seekTrack(event: MouseEvent) {
    if (!this.audio) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;

    this.audio.currentTime = (percentage / 100) * this.audio.duration;
    this.progress = percentage;
  }

  togglePlay() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  skipNext() {
    console.log('Next track');
  }

  skipPrevious() {
    console.log('Previous track');
  }

  private updateProgress() {
    if (!this.audio) return;

    this.currentTime = this.formatTime(this.audio.currentTime);
    this.progress = (this.audio.currentTime / this.audio.duration) * 100;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
