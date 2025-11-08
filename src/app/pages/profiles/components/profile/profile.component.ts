import { Component, inject } from '@angular/core';
import { CurrentUserService } from '../../../../services/current-user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./profile.component.html`,
  styleUrl: `./profile.component.scss`,
})
export class ProfileComponent {
  currentUserService = inject(CurrentUserService);
  currentUser = this.currentUserService.currentUserSig;
  
  // No ngOnInit needed here.
}