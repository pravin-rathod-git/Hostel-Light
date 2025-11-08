import { Component, HostBinding, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./loader.component.html`,
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnDestroy {
  @HostBinding('class.overlay') overlayClass = true;

  constructor() {
    // Prevent scrolling on the body when the loader is active
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Re-enable scrolling when the loader is destroyed
    document.body.style.overflow = '';
  }

}