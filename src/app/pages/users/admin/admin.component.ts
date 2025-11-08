import { Component, inject } from '@angular/core';
import { CurrentUserService } from '../../../services/current-user.service';
import { ProfilesComponent } from "../../profiles/profiles.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ProfilesComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  currentUserService = inject(CurrentUserService);
  currentUser = this.currentUserService.currentUserSig;
}
