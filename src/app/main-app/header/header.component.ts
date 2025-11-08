// src/app/components/header/header.component.ts
import { Component, inject, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavbarStateService } from '../../services/navbar-state.service';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfilesComponent } from '../../pages/profiles/profiles.component';
import { Subject } from 'rxjs';
import { takeUntil, tap, distinctUntilChanged } from 'rxjs/operators';
import { CurrentUserService } from '../../services/current-user.service';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { User as FirebaseUser } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  // REMOVED: HistorysComponent from imports
  imports: [NgClass, RouterLink, ProfilesComponent, FormsModule, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  router = inject(Router);
  authService = inject(AuthService);
  currentUserService = inject(CurrentUserService);
  themeService = inject(ThemeService);
  changeDetectorRef = inject(ChangeDetectorRef);
  zone = inject(NgZone);

  // REMOVED: Injections for GeminiService, ToggleService, PromodetoggleService, GeminiSettingsService

  isNavbarExpanded: boolean = false;
  userEmail: string | null = null;
  private destroy$ = new Subject<void>();
  isDarkMode: boolean = false;

  // REMOVED: Properties related to toggles, settings, and saving state
  // (e.g., isToggleActive, ispromodetoggleActive, isSettingsPopupOpen, userSystemInstructions, saveButtonState, etc.)

  constructor(private navbarStateService: NavbarStateService) { }

  ngOnInit(): void {
    this.authService.user$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev: FirebaseUser | null, curr: FirebaseUser | null) => prev?.email === curr?.email),
      tap((user: FirebaseUser | null) => {
        if (user && user.email) {
          const userEmailStr = user.email;
          this.userEmail = userEmailStr;
          this.currentUserService.loadCurrentUser(userEmailStr);

          // Fetch theme
          this.themeService.getTheme(userEmailStr).pipe(takeUntil(this.destroy$)).subscribe(theme => {
            this.zone.run(() => {
              this.isDarkMode = theme?.isDark || false;
              this.applyTheme();
              this.changeDetectorRef.detectChanges();
            });
          });

          // REMOVED: Subscriptions for toggleService, promodetoggleService, geminiService, and geminiSettingsService

        } else {
          // Logic for logged-out user
          this.userEmail = null;
          this.zone.run(() => {
            this.isDarkMode = false;
            this.applyTheme();
            this.changeDetectorRef.detectChanges();
          });
        }
      })
    ).subscribe(); // Subscribing to activate the pipe
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // REMOVED: clearTimeout for postSavingTimeout
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleNavbar() {
    this.navbarStateService.toggleNavbar();
    this.isNavbarExpanded = !this.isNavbarExpanded;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('');
    });
  }

  // This method now only handles navigation. The service call has been removed.
  startNewChat(): void {
    if (this.router.url === '/about' || this.router.url.startsWith('/history/')) {
      this.router.navigate(['/']);
    }
    // You might want to add logic here to clear the current chat view if it's managed by a different service.
    if (this.isNavbarExpanded) {
      this.toggleNavbar();
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.userEmail) {
      this.themeService.updateTheme(this.userEmail, this.isDarkMode).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          console.log('[HeaderComponent] Theme updated.');
          this.zone.run(() => this.applyTheme());
        },
        error: (error) => {
          console.error('[HeaderComponent] Error updating theme:', error);
          this.isDarkMode = !this.isDarkMode; // Revert on error
          this.zone.run(() => this.applyTheme());
        },
      });
    } else {
      // For non-logged-in users, just toggle locally
      this.zone.run(() => this.applyTheme());
    }
  }

  // REMOVED: The following methods have been deleted entirely as they depended on the removed services:
  // - calltosave()
  // - onToggleChange()
  // - onPromodetoggleChange()
  // - settingtoggle()
  // - saveSettings()
}