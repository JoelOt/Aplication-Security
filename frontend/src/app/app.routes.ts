import { Routes } from '@angular/router';
import { ProfileComponent } from './features/profile/profile';
import { RecommendedSongs } from './features/recommended-songs/recommended-songs';

export const routes: Routes = [
    { path: '', component: RecommendedSongs },
    { path: 'profile', component: ProfileComponent }
];
