import { Component } from '@angular/core';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardprofileComponent } from "./components/dashboardprofile/dashboardprofile.component";

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [DashboardprofileComponent],
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
})
export class ProfilesComponent {
  // No ngOnInit or auth logic is needed here.
}