import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { LandingpageComponent } from '../landingpage/landingpage.component';
import { CurrentUserService } from '../../services/current-user.service';
import { Subscription } from 'rxjs';
import { RolesComponent } from "../roles/roles.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LandingpageComponent, RolesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  authService = inject(AuthService);
  currentUserService = inject(CurrentUserService);
  userSubscription: Subscription | undefined;
  constructor() {}
  ngOnInit(): void {
    this.userSubscription=this.authService.user$.subscribe(
      (user: { email: string; displayName: string; emailVerified: boolean } | null) => {
        if (user && user.emailVerified) {
           this.currentUserService.loadCurrentUser(user.email);
        } else {
            this.currentUserService.clearCurrentUser();
        }
      }
    );
  }
  ngOnDestroy(): void {
    if(this.userSubscription){
      this.userSubscription.unsubscribe();
    }
  }

  signInWithGoogle() {
    this.authService.googleSignIn();
  }
}