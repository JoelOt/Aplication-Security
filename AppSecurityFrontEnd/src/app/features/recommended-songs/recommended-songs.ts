import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Song {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
}

@Component({
  selector: 'recommended-songs',
  imports: [CommonModule],
  templateUrl: './recommended-songs.html',
  styleUrl: './recommended-songs.scss',
})
export class RecommendedSongs {
  recommendedSongs: Song[] = [
    {
      id: 1,
      title: 'Song Name 1',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 2,
      title: 'Song Name 2',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 3,
      title: 'Song Name 3',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 4,
      title: 'Song Name 4',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 5,
      title: 'Song Name 5',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 6,
      title: 'Song Name 6',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 7,
      title: 'Song Name 7',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },
    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    },

    {
      id: 8,
      title: 'Song Name 8',
      artist: 'Artist Name',
      coverImage: '/song-cover.jpg'
    }
  ];
}
