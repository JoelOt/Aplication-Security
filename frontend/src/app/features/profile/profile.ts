import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.html',
    styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
    user: any = null;
    isLoading: boolean = true;

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() {
        this.api.getCurrentUser().subscribe({
            next: (data) => {
                this.user = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching profile:', err);
                this.isLoading = false;
                // If error (e.g. 403), maybe redirect to home or show error
            }
        });
    }
}
