import { inject, Injectable } from '@angular/core';
import {
  Auth,
  user,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { from, Observable, tap, map, switchMap, of, take } from 'rxjs';
import { Router } from '@angular/router';
import { ProfilesFirebaseService } from '../pages/profiles/services/profilesFirebase.service';
import { ProfileInterface } from '../pages/profiles/types/profile.interface';
import { CurrentUserService } from './current-user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  private router = inject(Router);
  private profilesFirebaseService = inject(ProfilesFirebaseService);
  private currentUserService = inject(CurrentUserService);

  // Expose the raw Firebase user state
  user$ = user(this.firebaseAuth);

  // Expose the current user profile signal from the dedicated service
  currentUserSig = this.currentUserService.currentUserSig;

  // Handles standard email/password registration in Firebase Auth
  register(email: string, password: string, username: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      switchMap((response) =>
        from(updateProfile(response.user, { displayName: username })).pipe(map(() => response))
      ),
      tap((response) => this.sendEmailForVerification(response.user))
    );
  }

  // Handles standard email/password login
  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      switchMap((response: UserCredential) => {
        if (response.user.emailVerified) {
          // Fetch the full profile from Firestore to get role information
          return this.profilesFirebaseService.getProfileByEmail(response.user.email!);
        } else {
          alert('Please verify your email address before logging in.');
          signOut(this.firebaseAuth);
          this.router.navigate(['/varify-email']);
          return of(null); // Stop the observable chain
        }
      }),
      tap((profile: ProfileInterface | null) => {
        if (profile) {
          this.handleLoginRedirection(profile);
        } else {
          // This case might happen if a user exists in Auth but not in Firestore.
          // Log out and redirect to prevent being in a broken state.
          console.error('Login failed: User profile not found in database.');
          alert('Login failed: Your user profile could not be found. Please contact support.');
          this.logout();
          this.router.navigateByUrl('/login');
        }
      }),
      map(() => void 0) // Map to void
    );
  }

  // Handles Google Sign-In flow
  async googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.firebaseAuth, provider);
      const user = result.user;

      if (!user?.email) {
        alert('Sign-in failed: Google account did not provide an email address.');
        return;
      }

      // Check if a profile already exists for this email
      const existingProfile = await this.profilesFirebaseService.getProfileByEmail(user.email).pipe(take(1)).toPromise();

      if (existingProfile) {
        console.log('Google user already exists:', existingProfile);
        this.handleLoginRedirection(existingProfile);
      } else {
        // If profile doesn't exist, create a new one
        const username = user.displayName ?? 'Google User';
        console.log('Registering new Google user:', { username, email: user.email });
        
        const newProfile = await this.profilesFirebaseService.addProfileregister(username, user.email).pipe(take(1)).toPromise();

        if (newProfile) {
          this.handleLoginRedirection(newProfile);
        } else {
          throw new Error("Failed to create user profile after Google Sign-In.");
        }
      }
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      alert(`Sign-in failed: ${error.message}`);
    }
  }

  // Centralized logic for navigating after a successful login
  private handleLoginRedirection(profile: ProfileInterface): void {
    // Set the current user in the dedicated service
    this.currentUserService.setCurrentUser(profile);

    // Decide where to navigate based on role
    if (profile.role && profile.roleVerified) {
      console.log('Role verified. Navigating to landing page.');
      this.router.navigateByUrl('/landingpage');
    } else {
      console.log('Role not set or not verified. Navigating to roles page.');
      this.router.navigateByUrl('/roles');
    }
  }

  // Logs the user out
  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth)).pipe(
      tap(() => {
        this.currentUserService.clearCurrentUser();
        this.router.navigate(['/login']);
      })
    );
  }

  // Sends a password reset email
  forgotPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.firebaseAuth, email)).pipe(
      tap(() => {
        alert('Password reset link sent! Please check your email.');
        this.router.navigate(['/login']);
      })
    );
  }

  // Sends a verification email to the user
  sendEmailForVerification(user: User): void {
    sendEmailVerification(user)
      .then(() => console.log('Verification email sent.'))
      .catch((err: Error) => console.error('Failed to send verification email:', err));
  }
}