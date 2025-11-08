import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone:true,
  imports:[FormsModule,RouterLink,CommonModule,ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  fb = inject(FormBuilder);
  authService = inject(AuthService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  message: string | null = null;
  isError = false;

  onSubmit(): void {
    if (this.form.invalid) return;

    this.authService.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.isError = false;
        this.message = 'Password reset link sent successfully! Please check your email.';
        this.form.reset();
      },
      error: (err) => {
        this.isError = true;
        this.message = 'Failed to send reset link. Please try again.';
        console.error(err);
      }
    });
  }

}
