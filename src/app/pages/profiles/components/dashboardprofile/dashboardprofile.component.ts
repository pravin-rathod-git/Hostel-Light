// src/app/pages/profiles/components/dashboardprofile/dashboardprofile.component.ts

import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrentUserService } from '../../../../services/current-user.service';
import { AuthService } from '../../../../services/auth.service';
import { ProfilesFirebaseService } from '../../services/profilesFirebase.service';
import { ProfileInterface } from '../../types/profile.interface';
import { take } from 'rxjs';

@Component({
  selector: 'app-dashboardprofile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Added ReactiveFormsModule
  templateUrl: './dashboardprofile.component.html',
  styleUrl: './dashboardprofile.component.scss'
})
export class DashboardprofileComponent {
  // --- Injected Services ---
  private currentUserService = inject(CurrentUserService);
  private authService = inject(AuthService);
  private profilesFirebaseService = inject(ProfilesFirebaseService);
  private fb = inject(FormBuilder);

  // --- Component State Signals ---
  currentUser = this.currentUserService.currentUserSig;
  isModalOpen = signal(false);
  isSubmitting = signal(false);
  imagePreviewUrl = signal<string | null>(null);

  profileForm: FormGroup;

  constructor() {
    // Initialize the form
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      bio: ['']
    });

    // Effect to automatically populate the form when the user data is available or changes
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          bio: user.bio,
        });
        // Also set the initial image for the preview
        this.imagePreviewUrl.set(user.profileimage || 'assets/darkdefault.png');
      }
    });
  }

  openModal(): void {
    const user = this.currentUser();
    if (user) {
      // Reset form to current user's state each time the modal is opened
      this.profileForm.patchValue({
        username: user.username,
        bio: user.bio
      });
      this.imagePreviewUrl.set(user.profileimage || 'assets/darkdefault.png');
      this.isModalOpen.set(true);
    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      console.log('User logged out.');
      this.closeModal(); // Close modal on logout
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        // Use FileReader to get a temporary URL for the preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl.set(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    }
  }

  async saveChanges(): Promise<void> {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }

    const currentUser = this.currentUser();
    if (!currentUser) {
      alert('Error: No user is logged in.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValues = this.profileForm.getRawValue();
      const updatedData: Partial<ProfileInterface> = {
        username: formValues.username,
        bio: formValues.bio,
        profileimage: this.imagePreviewUrl() || currentUser.profileimage,
      };

      await this.profilesFirebaseService
        .updateProfileByEmail(currentUser.email, updatedData)
        .pipe(take(1))
        .toPromise();

      // Refresh the global user state to reflect changes everywhere
      this.currentUserService.loadCurrentUser(currentUser.email);
      this.closeModal();

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}