import { Component } from '@angular/core';
import { Header } from '../header/header';
import { MediaPlayer } from '../media-player/media-player';

@Component({
  selector: 'main-dashboard',
  imports: [Header, MediaPlayer],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.scss',
})
export class MainDashboard {

}
