// src/app/pages/landingpage/landingpage.component.ts

import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CurrentUserService } from '../../services/current-user.service';

// Import all possible role-based dashboard components
import { AdminComponent } from '../users/admin/admin.component';
import { PrincipalComponent } from '../users/principal/principal.component';
import { RectorComponent } from '../users/rector/rector.component';
import { SecurityComponent } from '../users/security/security.component';
import { StudentComponent } from '../users/student/student.component';
import { TeacherComponent } from '../users/teacher/teacher.component';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [
    CommonModule,
    AdminComponent,
    PrincipalComponent,
    RectorComponent,
    SecurityComponent,
    StudentComponent,
    TeacherComponent,
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.scss',
})
export class LandingpageComponent {
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  currentUser = this.currentUserService.currentUserSig;

  constructor() {
    // This effect ensures that only verified users can access this page.
    // If the user's state changes to unverified while they are on this page,
    // they will be automatically redirected.
    effect(() => {
      const user = this.currentUser();
      if (user && (!user.role || !user.roleVerified)) {
        console.log('LandingPage Effect: User is not verified. Redirecting to /roles.');
        this.router.navigate(['/roles']);
      }
    });
  }
}