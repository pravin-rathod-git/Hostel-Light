import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CurrentUserService } from './services/current-user.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { User } from '@angular/fire/auth'; // <-- IMPORT THIS TYPE
import { BufferComponent } from './externalpages/buffer/buffer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BufferComponent],
  template: `
    @if (isLoading()) {
      <app-buffer />
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  currentUserService = inject(CurrentUserService);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe((user: User | null) => { // <-- APPLY THE TYPE HERE
      if (user && user.email && user.emailVerified) {
        this.currentUserService.loadCurrentUser(user.email, () => {
          this.isLoading.set(false);
        });
      } else {
        this.currentUserService.clearCurrentUser();
        this.isLoading.set(false);
      }
    });
  }
}