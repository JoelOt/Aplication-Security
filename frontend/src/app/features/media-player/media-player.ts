import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  private progressInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Crear elemento de audio
      this.audio = new Audio();
      this.audio.src = '/assets/your-song.mp3'; // Cambia por tu canción
      this.audio.volume = this.volume / 100;

      // Eventos del audio
      this.audio.addEventListener('loadedmetadata', () => {
        this.totalTime = this.formatTime(this.audio!.duration);
      });

      this.audio.addEventListener('timeupdate', () => {
        this.updateProgress();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.progress = 0;
      });
    }
  }

  ngOnDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  // Control de volumen
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

  // Control de progreso
  seekTrack(event: MouseEvent) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;
    
    if (this.audio) {
      this.audio.currentTime = (percentage / 100) * this.audio.duration;
      this.progress = percentage;
    }
  }

  // Reproducir/pausar
  togglePlay() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  // Siguiente/anterior
  skipNext() {
    // Implementa lógica de playlist
    console.log('Next track');
  }

  skipPrevious() {
    // Implementa lógica de playlist
    console.log('Previous track');
  }

  // Actualizar progreso
  private updateProgress() {
    if (!this.audio) return;
    
    this.currentTime = this.formatTime(this.audio.currentTime);
    this.progress = (this.audio.currentTime / this.audio.duration) * 100;
  }

  // Formatear tiempo
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
