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
  ) { }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Listen for track changes from the shared service
      this.api.currentTrack$.subscribe(track => {
        if (track) {
          this.loadTrack(track);
        } else {
          // If no track is set, load the default current track
          this.api.get<{ trackName: string; artistName: string; trackImage: string; audioUrl: string; duration: number }>('track/current')
            .subscribe(defaultTrack => {
              this.loadTrack(defaultTrack);
            });
        }
      });
    }
  }

  private loadTrack(track: { trackName: string; artistName: string; trackImage: string; audioUrl: string; duration?: number }) {
    this.trackName = track.trackName;
    this.artistName = track.artistName;
    this.trackImage = track.trackImage;

    // Clean up previous audio if exists
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    // Create new audio element
    this.audio = new Audio(track.audioUrl);
    this.audio.volume = this.volume / 100;

    // Handle duration
    if (track.duration) {
      this.totalTime = this.formatTime(track.duration);
    } else {
      this.audio.addEventListener('loadedmetadata', () => {
        this.totalTime = this.formatTime(this.audio!.duration);
      });
    }

    // Add event listeners
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.progress = 0;
    });

    // Auto-play the new track
    this.audio.play();
    this.isPlaying = true;
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
