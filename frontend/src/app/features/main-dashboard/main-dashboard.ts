import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '../header/header';
import { MediaPlayer } from '../media-player/media-player';

@Component({
  selector: 'main-dashboard',
  standalone: true,
  imports: [Header, MediaPlayer, RouterModule],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.scss',
})
export class MainDashboard {

}
