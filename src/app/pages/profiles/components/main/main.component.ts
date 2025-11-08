import { Component, computed, inject } from '@angular/core';
import { ProfilesService } from '../../services/profiles.service';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../profile/profile.component';
import { ProfilesFirebaseService } from '../../services/profilesFirebase.service';

@Component({
  selector: 'app-profiles-main',
  templateUrl: './main.component.html',
  standalone: true,
  imports: [CommonModule, ProfileComponent],
})
export class MainComponent {
  profilesService = inject(ProfilesService);
  profilesFirebaseService = inject(ProfilesFirebaseService);
  editingId: string | null = null;
  

  visibleProfiles = computed(() => {
    const profiles = this.profilesService.profilesSig();
    return profiles;
  });
  noProfilesClass = computed(() => this.profilesService.profilesSig().length === 0);

}
