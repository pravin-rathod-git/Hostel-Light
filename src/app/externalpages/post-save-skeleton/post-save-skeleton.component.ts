// src/app/externalpages/post-save-skeleton/post-save-skeleton.component.ts
import { Component, Input } from '@angular/core'; // Make sure Input is imported
import { NgIf } from '@angular/common'; // If you use *ngIf inside its template

@Component({
  selector: 'app-post-save-skeleton',
  standalone: true,
  imports: [NgIf], // Add NgIf if needed
  template: `
    <div *ngIf="show" class="post-save-message"> <!-- Or however you display it -->
      <!-- Your skeleton/message content here -->
      Conversation saved!
    </div>
  `,
  // styleUrls: ['./post-save-skeleton.component.scss']
})
export class PostSaveSkeletonComponent {
  @Input() show: boolean = false; // <--- ADD THIS INPUT PROPERTY

  constructor() {}
}