import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap, map, take } from 'rxjs';
import { ProfileInterface } from '../types/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfilesFirebaseService {
  private firestore = inject(Firestore);
  private profilesCollection = collection(this.firestore, 'profile');

  // Gets all profiles from Firestore. Useful for admin views.
  getProfiles(): Observable<ProfileInterface[]> {
    return collectionData(this.profilesCollection, { idField: 'id' }) as Observable<ProfileInterface[]>;
  }

  // Adds a complete profile.
  addProfile(profileimage: string, bio: string, username: string, email: string): Observable<ProfileInterface> {
    const profileToCreate: Omit<ProfileInterface, 'id'> = {
      profileimage,
      bio,
      username,
      email,
      role: null, // Default role
      roleVerified: false, // Default verification status
    };
    return from(addDoc(this.profilesCollection, profileToCreate)).pipe(
      map((response) => ({ id: response.id, ...profileToCreate }))
    );
  }

  // Adds a profile during user registration with default values.
  addProfileregister(username: string, email: string): Observable<ProfileInterface> {
    const profileToCreate: Omit<ProfileInterface, 'id'> = {
      username,
      email,
      profileimage: '', // Default value
      bio: '', // Default value
      role: null,
      roleVerified: false,
    };
    return from(addDoc(this.profilesCollection, profileToCreate)).pipe(
      map((response) => ({ id: response.id, ...profileToCreate }))
    );
  }

  // Gets a single profile document by email address.
  getProfileByEmail(email: string): Observable<ProfileInterface | null> {
    const q = query(this.profilesCollection, where('email', '==', email));
    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          return {
            id: docData.id,
            ...docData.data(),
          } as ProfileInterface;
        }
        return null;
      }),
      take(1) // Ensure the observable completes after one emission.
    );
  }

  // Updates a profile document found by email.
  updateProfileByEmail(email: string, updatedData: Partial<ProfileInterface>): Observable<void> {
    return this.getProfileByEmail(email).pipe(
      switchMap((profile) => {
        if (profile) {
          const docRef = doc(this.firestore, `profile/${profile.id}`);
          return from(updateDoc(docRef, updatedData));
        }
        return of(undefined); // No profile found to update
      })
    );
  }

  // Removes a profile document by its ID.
  removeProfile(profileId: string): Observable<void> {
    const docRef = doc(this.firestore, `profile/${profileId}`);
    return from(deleteDoc(docRef));
  }
}