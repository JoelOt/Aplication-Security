import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  public searchQuery: string = '';

  constructor(private api: ApiService) { }

  onSearch() {
    this.api.searchTracks(this.searchQuery);
  }
}
