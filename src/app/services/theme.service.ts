import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { Observable, from, of, BehaviorSubject, Subscription } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';
import { Theme } from '../interfaces/theme.interface';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private themeCollection = collection(this.firestore, 'themes');
  private localStorageKey = 'app_theme';
  private initialTheme: Theme = { email: '', isDark: false };
  private themeSubject: BehaviorSubject<Theme> = new BehaviorSubject<Theme>(
    this.getCachedTheme() || this.initialTheme
  );
  private themeListenerSubscription: Subscription | undefined;
  private currentEmail: string | undefined;


  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {}


  getTheme(email: string): Observable<Theme> {
    const cachedTheme = this.getCachedTheme();
    if (cachedTheme && cachedTheme.email === email) {
      this.setupThemeListener(email);
      this.themeSubject.next(cachedTheme);
      return of(cachedTheme)
  }
    
      const themeDocument = doc(this.themeCollection, email);
      return from(getDoc(themeDocument)).pipe(
        map(snapshot => {
            let theme: Theme;
            if(snapshot.exists()){
                 theme = snapshot.data() as Theme;
            }else{
                theme = this.initialTheme
            }
            this.cacheTheme(theme);
            this.themeSubject.next(theme);
            this.setupThemeListener(email);
             return theme;
        })
    )
  }

  updateTheme(email: string, isDark: boolean): Observable<void> {
    const themeDocument = doc(this.themeCollection, email);
    const themeData = { email, isDark };
    return from(setDoc(themeDocument, themeData)).pipe(
      tap(() => {
        // Update cache after successful firebase write
        this.cacheTheme(themeData as Theme);
        this.themeSubject.next(themeData as Theme);
      })
    );
  }

  private getCachedTheme(): Theme | undefined {
    const storedTheme = localStorage.getItem(this.localStorageKey);
    if (storedTheme) {
      try {
        return JSON.parse(storedTheme);
      } catch (e) {
        console.error('Error parsing cached theme', e);
        return undefined;
      }
    }
    return undefined;
  }

  private cacheTheme(theme: Theme): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(theme));
  }

  private setupThemeListener(email: string): void {
        if (this.themeListenerSubscription && this.currentEmail === email) {
            return;
        }
        this.currentEmail = email;
      if (this.themeListenerSubscription) {
        this.themeListenerSubscription.unsubscribe();
      }

      const themeDocument = doc(this.themeCollection, email);
      this.themeListenerSubscription = new Observable<DocumentSnapshot>(observer =>{
            return onSnapshot(themeDocument, observer);
          }).pipe(
              filter(snapshot => snapshot.exists()),
              map(snapshot => snapshot.data() as Theme)
          ).subscribe(theme => {
            this.cacheTheme(theme);
            this.themeSubject.next(theme);
      });

  }


  ngOnDestroy(): void {
      if(this.themeListenerSubscription){
          this.themeListenerSubscription.unsubscribe();
      }
  }
}