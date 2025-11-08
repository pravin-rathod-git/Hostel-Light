import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CurrentUserService } from '../../../../services/current-user.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-gray-800 text-white shadow-md">
      <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
        <a routerLink="/" class="text-xl font-bold text-white">HosteLight</a>
        <div>
          @if (currentUser(); as user) {
            <div class="flex items-center gap-4">
              <span class="font-semibold">Welcome, {{ user.username }}</span>
              <button (click)="logout()" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">
                Logout
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-4">
              <a routerLink="/login" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">Login</a>
              <a routerLink="/register" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold">Register</a>
            </div>
          }
        </div>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  currentUserService = inject(CurrentUserService);
  authService = inject(AuthService);
  router = inject(Router);

  currentUser = this.currentUserService.currentUserSig;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => console.log('Logged out successfully'),
      error: (err) => console.error('Logout failed', err)
    });
  }
}