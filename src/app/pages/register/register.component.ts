// src/app/pages/register/register.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LandingpageComponent } from '../landingpage/landingpage.component';
import { ProfilesFirebaseService } from '../profiles/services/profilesFirebase.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LandingpageComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  profilesFirebaseService = inject(ProfilesFirebaseService);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage: string | null = null;

  ngOnInit(): void {
    // If a user is already logged in and navigates to the register page,
    // redirect them to the appropriate dashboard or roles page.
    if (this.authService.currentUserSig()) {
      const profile = this.authService.currentUserSig()!;
      if (profile.role && profile.roleVerified) {
        this.router.navigateByUrl('/landingpage');
      } else {
        this.router.navigateByUrl('/roles');
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill out all fields correctly.';
      return;
    }
    const rawForm = this.form.getRawValue();
    this.errorMessage = null;

    // 1. Check if a profile with this email already exists in Firestore
    this.profilesFirebaseService.getProfileByEmail(rawForm.email)
      .pipe(take(1))
      .subscribe({
        next: (existingProfile) => {
          if (existingProfile) {
            this.errorMessage = 'An account with this email already exists. Please log in or use a different email.';
          } else {
            // 2. If no profile exists, proceed with Firebase Auth registration
            this.authService.register(rawForm.email, rawForm.password, rawForm.username)
              .subscribe({
                next: (userCredential) => {
                  console.log('Firebase Auth user created:', userCredential.user.uid);
                  // 3. After successful auth registration, create the profile in Firestore
                  this.profilesFirebaseService.addProfileregister(rawForm.username, rawForm.email)
                    .pipe(take(1))
                    .subscribe({
                      next: (newProfile) => {
                        console.log('Firestore profile created:', newProfile);
                        alert('Registration successful! A verification email has been sent. Please verify your email before logging in.');
                        this.router.navigateByUrl('/varify-email');
                      },
                      error: (profileError) => {
                        console.error('Error creating Firestore profile:', profileError);
                        this.errorMessage = 'Your account was created, but we failed to create your user profile. Please contact support.';
                      }
                    });
                },
                error: (authError) => {
                  console.error('Firebase Auth registration error:', authError);
                  if (authError.code === 'auth/email-already-in-use') {
                    this.errorMessage = 'This email address is already in use by another account.';
                  } else {
                    this.errorMessage = 'An unexpected error occurred during registration. Please try again.';
                  }
                },
              });
          }
        },
        error: (checkError) => {
          console.error('Error checking for existing profile:', checkError);
          this.errorMessage = 'Could not verify email. Please try again later.';
        },
      });
  }

  signInWithGoogle(): void {
    this.authService.googleSignIn();
  }
}