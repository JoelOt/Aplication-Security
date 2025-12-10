import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

interface SongDetails {
    id: number;
    title: string;
    artist: string;
    coverImage: string;
    audioUrl?: string;
    description?: string;
    genre?: string;
}

@Component({
    selector: 'song-details-popup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './song-details-popup.html',
    styleUrl: './song-details-popup.scss',
})
export class SongDetailsPopup {
    @Input() song: SongDetails | null = null;
    @Output() closePopup = new EventEmitter<void>();
    @Output() playSong = new EventEmitter<SongDetails>();

    constructor(private api: ApiService) { }

    onClose() {
        this.closePopup.emit();
    }

    onPlay() {
        if (this.song) {
            this.playSong.emit(this.song);
            this.closePopup.emit();
        }
    }
}
