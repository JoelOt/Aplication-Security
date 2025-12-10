import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Subscription } from 'rxjs';

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
  private trackSubscription?: Subscription;
  private progressInterval?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Listen for track changes from the shared service
      this.trackSubscription = this.api.currentTrack$.subscribe(track => {
        if (track) {
          this.loadTrack(track);
        } else {
          // If no track is set, load the default current track
          // If no track is set, load the default current track (first recommended)
          this.api.get<any[]>('tracks/recommended')
            .subscribe(tracks => {
              if (tracks && tracks.length > 0) {
                const first = tracks[0];
                this.loadTrack({
                  trackName: first.title,
                  artistName: first.artist,
                  trackImage: first.coverImage,
                  audioUrl: first.audioUrl,
                  duration: 0
                });
              }
            });
        }
      });
    }
  }

  private loadTrack(track: { trackName: string; artistName: string; trackImage: string; audioUrl: string; duration?: number }) {
    console.log('Loading track:', track);

    // Update track info
    this.trackName = track.trackName;
    this.artistName = track.artistName;
    this.trackImage = track.trackImage;

    // Clean up previous audio if exists
    this.cleanupAudio();

    // Reset state
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = '0:00';

    // Create new audio element
    this.audio = new Audio(track.audioUrl);
    this.audio.volume = this.volume / 100;

    // Handle duration
    if (track.duration) {
      this.totalTime = this.formatTime(track.duration);
    } else {
      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          this.totalTime = this.formatTime(this.audio.duration);
          this.cdr.detectChanges();
        }
      });
    }

    // Add event listeners
    this.audio.addEventListener('ended', () => {
      this.ngZone.run(() => {
        this.isPlaying = false;
        this.progress = 0;
        this.currentTime = '0:00';
        this.stopProgressUpdate();
        this.cdr.detectChanges();
      });
    });

    // Auto-play the new track
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.startProgressUpdate();
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
  }

  private cleanupAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;

      // Remove all event listeners by replacing the audio element
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }

    this.stopProgressUpdate();
  }

  private startProgressUpdate() {
    this.stopProgressUpdate();

    // Update progress every second
    this.progressInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.updateProgress();
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  private stopProgressUpdate() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  ngOnDestroy() {
    this.cleanupAudio();

    if (this.trackSubscription) {
      this.trackSubscription.unsubscribe();
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
    this.updateProgress();
  }

  togglePlay() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.stopProgressUpdate();
      this.isPlaying = false;
    } else {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.startProgressUpdate();
      }).catch(error => {
        console.error('Error playing audio:', error);
        this.isPlaying = false;
      });
    }

    this.cdr.detectChanges();
  }

  skipNext() {
    console.log('Next track');
    // TODO: Implement next track logic
  }

  skipPrevious() {
    console.log('Previous track');
    // TODO: Implement previous track logic
  }

  private updateProgress() {
    if (!this.audio) return;

    this.currentTime = this.formatTime(this.audio.currentTime);
    this.progress = (this.audio.currentTime / this.audio.duration) * 100;
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
