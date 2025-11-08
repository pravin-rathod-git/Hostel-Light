// src/app/pages/roles/roles.component.ts

import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilesFirebaseService } from '../profiles/services/profilesFirebase.service';
import { Router, RouterLink } from '@angular/router';
import { CurrentUserService } from '../../services/current-user.service';
import { ProfileInterface } from '../profiles/types/profile.interface';
import { take } from 'rxjs';

type Role = {
  name: string;
  emoji: string;
};

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  currentUserService = inject(CurrentUserService);
  profilesFirebaseService = inject(ProfilesFirebaseService);
  router = inject(Router);

  availableRoles: Role[] = [
    { name: 'Student', emoji: '🎓' },
    { name: 'Teacher', emoji: '👩‍🏫' },
    { name: 'Rector', emoji: '🏢' },
    { name: 'Principal', emoji: '👨‍💼' },
    { name: 'Security', emoji: '🪪' },
    { name: 'Admin', emoji: '🛠️' },
  ];

  selectedRole = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  currentUserProfile = this.currentUserService.currentUserSig;

  userRoleEmoji = computed(() => {
    const roleName = this.currentUserProfile()?.role;
    if (!roleName) return '❓';
    return this.availableRoles.find(r => r.name.toLowerCase() === roleName.toLowerCase())?.emoji || '❓';
  });

  canChangeRole = computed(() => {
    const profile = this.currentUserProfile();
    return profile ? !profile.roleVerified : true;
  });

  constructor() {
    // This effect automatically navigates the user to their dashboard
    // if their role becomes verified while they are on this page.
    effect(() => {
      const user = this.currentUserProfile();
      if (user?.roleVerified) {
        console.log('RolesComponent Effect: User is now verified. Redirecting to /landingpage.');
        this.router.navigateByUrl('/landingpage');
      }
    });
  }

  ngOnInit(): void {
    // This initial check handles the case where the user is already verified
    // when they first navigate to this page.
    if (this.currentUserProfile()?.roleVerified) {
      this.router.navigateByUrl('/landingpage');
    }
  }

  selectRole(role: string): void {
    if (this.canChangeRole()) {
      this.selectedRole.set(role);
    }
  }

  async onSubmit(): Promise<void> {
    const profile = this.currentUserProfile();
    const roleToSubmit = this.selectedRole();

    if (!roleToSubmit || !profile) {
      return;
    }

    this.isSubmitting.set(true);
    const roleData: Partial<ProfileInterface> = {
      role: roleToSubmit,
      roleVerified: false // Always reset to false on user submission
    };

    try {
      await this.profilesFirebaseService.updateProfileByEmail(profile.email, roleData).pipe(take(1)).toPromise();
      // After successfully updating, reload the user's profile to get the latest data.
      this.currentUserService.loadCurrentUser(profile.email);
      this.selectedRole.set(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('There was an error submitting your role. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}