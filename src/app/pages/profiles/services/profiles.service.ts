import { Injectable, signal } from '@angular/core';
import { ProfileInterface } from '../types/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  profilesSig = signal<ProfileInterface[]>(this.loadProfilesFromLocalStorage());
  localStorageKey = 'profiles';

  constructor() {
    this.loadProfilesFromLocalStorage();
  }

  private loadProfilesFromLocalStorage(): ProfileInterface[] {
    const storedProfiles = localStorage.getItem(this.localStorageKey);
    if (storedProfiles) {
      try {
        return JSON.parse(storedProfiles);
      } catch (e) {
        console.error('Error parsing profiles from local storage', e);
        localStorage.removeItem(this.localStorageKey);
        return [];
      }
    }
    return [];
  }

  private setCachedProfiles(profiles: ProfileInterface[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(profiles));
  }

  private updateCachedProfile(updatedProfile: ProfileInterface): void {
    this.profilesSig.update((profiles) =>
      profiles.map((profile) =>
        profile.id === updatedProfile.id ? updatedProfile : profile
      )
    );
    this.setCachedProfiles(this.profilesSig());
  }

  private addCachedProfile(newProfile: ProfileInterface): void {
    this.profilesSig.update((profiles) => [...profiles, newProfile]);
    this.setCachedProfiles(this.profilesSig());
  }

  private removeCachedProfile(profileId: string): void {
    this.profilesSig.update((profiles) => profiles.filter((profile) => profile.id !== profileId));
    this.setCachedProfiles(this.profilesSig());
  }

  addProfile(id: string, profileimage: string, bio: string, username: string, email: string): void {
    // CORRECTED: Added missing properties to match the interface
    const newProfile: ProfileInterface = {
      id,
      profileimage,
      bio,
      username,
      email,
      role: null,
      roleVerified: false,
    };
    this.addCachedProfile(newProfile);
  }

  addProfileregister(id: string, username: string, email: string): void {
    // CORRECTED: Added missing properties to match the interface
    const newProfile: ProfileInterface = {
      id,
      profileimage: '',
      bio: '',
      username,
      email,
      role: null,
      roleVerified: false,
    };
    this.addCachedProfile(newProfile);
  }

  getProfileByEmail(email: string): ProfileInterface | undefined {
    return this.profilesSig().find((profile) => profile.email === email);
  }

  updateProfileByEmail(email: string, updatedData: Partial<ProfileInterface>): void {
    this.profilesSig.update((profiles) =>
      profiles.map((profile) => (profile.email === email ? { ...profile, ...updatedData } : profile))
    );
    this.setCachedProfiles(this.profilesSig());
  }

  removeProfile(id: string): void {
    this.removeCachedProfile(id);
  }
}