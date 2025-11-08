import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { ProfilesFirebaseService } from '../pages/profiles/services/profilesFirebase.service';
import { ProfileInterface } from '../pages/profiles/types/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private profilesFirebaseService = inject(ProfilesFirebaseService);
  private readonly localStorageKey = 'currentUserProfile';

  private currentUserSubject = new BehaviorSubject<ProfileInterface | null>(this.loadFromLocalStorage());
  currentUser$ = this.currentUserSubject.asObservable();
  currentUserSig = signal<ProfileInterface | null>(this.loadFromLocalStorage());

  constructor() {
    const initialUser = this.loadFromLocalStorage();
    this.currentUserSubject.next(initialUser);
    this.currentUserSig.set(initialUser);
  }

  private saveToLocalStorage(profile: ProfileInterface | null): void {
    if (profile) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(profile));
    } else {
      localStorage.removeItem(this.localStorageKey);
    }
  }

  private loadFromLocalStorage(): ProfileInterface | null {
    if (typeof window !== 'undefined' && localStorage) {
      const storedProfile = localStorage.getItem(this.localStorageKey);
      if (storedProfile) {
        try {
          return JSON.parse(storedProfile) as ProfileInterface;
        } catch (e) {
          console.error('Error parsing profile from localStorage:', e);
          localStorage.removeItem(this.localStorageKey);
          return null;
        }
      }
    }
    return null;
  }
  
  /**
   * Fetches a user's full profile from Firestore by email and updates the application state.
   * @param email The user's email.
   * @param onComplete Optional callback that runs after the operation finishes.
   */
  loadCurrentUser(email: string, onComplete?: () => void): void {
    this.profilesFirebaseService.getProfileByEmail(email).pipe(
      take(1) // Ensures the subscription automatically completes.
    ).subscribe({
      next: profile => {
        if (profile) {
          this.setCurrentUser(profile);
        } else {
          console.warn(`Attempted to load profile for ${email}, but none was found.`);
          this.clearCurrentUser();
        }
      },
      error: err => {
        console.error("Failed to load current user profile", err);
        this.clearCurrentUser();
        onComplete?.();
      },
      complete: () => {
        onComplete?.();
      }
    });
  }

  setCurrentUser(profile: ProfileInterface): void {
    const updatedProfile = {
      ...profile,
      profileimage: profile.profileimage || 'darkdefault.png',
    };

    this.currentUserSubject.next(updatedProfile);
    this.currentUserSig.set(updatedProfile);
    this.saveToLocalStorage(updatedProfile);
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    this.currentUserSig.set(null);
    this.saveToLocalStorage(null);
  }
}