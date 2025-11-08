// src/app/pages/login/login.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LandingpageComponent } from '../landingpage/landingpage.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LandingpageComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  ngOnInit(): void {
    // If a user is already logged in and navigates to the login page,
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
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }
    const rawForm = this.form.getRawValue();
    this.errorMessage = null; // Clear previous errors

    this.authService.login(rawForm.email, rawForm.password).subscribe({
      next: () => {
        // Navigation is handled by the service.
        console.log('Login successful, service is redirecting...');
      },
      error: (err) => {
        console.error('Login component error:', err);
        this.errorMessage = 'Invalid email or password. Please try again.';
      },
    });
  }

  signInWithGoogle(): void {
    this.authService.googleSignIn();
  }
}