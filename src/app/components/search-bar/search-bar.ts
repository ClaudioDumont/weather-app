import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBarComponent {
  public searchQuery = '';

  public onSearch() {
    console.log('Searching:', this.searchQuery);
  }
}
