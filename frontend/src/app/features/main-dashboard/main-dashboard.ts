import { Component } from '@angular/core';
import { Header } from '../header/header';
import { MediaPlayer } from '../media-player/media-player';
import { RecommendedSongs } from '../recommended-songs/recommended-songs';

@Component({
  selector: 'main-dashboard',
  imports: [Header, MediaPlayer, RecommendedSongs],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.scss',
})
export class MainDashboard {

}
