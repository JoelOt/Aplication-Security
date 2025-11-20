import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  public searchQuery: string = '';

}
