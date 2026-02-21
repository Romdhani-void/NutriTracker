import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { GoalService } from '../../core/goal.service';

type Step = 'register' | 'verify';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  step = signal<Step>('register');

  email = '';
  displayName = '';
  token = '';

  loading = signal(false);
  error = signal('');
  successMsg = signal('');

  constructor(
    private authService: AuthService,
    private goalService: GoalService,
    private router: Router
  ) {}

  onRegister(): void {
    this.error.set('');
    if (!this.email || !this.displayName) {
      this.error.set('Please fill in both fields.');
      return;
    }

    this.loading.set(true);
    this.authService.register(this.email.trim(), this.displayName.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMsg.set(res.message);
        this.step.set('verify');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Something went wrong. Please try again.');
      },
    });
  }

  onVerify(): void {
    this.error.set('');
    if (!this.token || this.token.length !== 6) {
      this.error.set('Please enter the 6-digit token from your email.');
      return;
    }

    this.loading.set(true);
    this.authService.verifyToken(this.email.trim(), this.token.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        // Check if goal already exists, if so go to dashboard
        this.goalService.getGoal(this.email.trim()).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.router.navigate(['/onboarding']),
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Invalid or expired token.');
      },
    });
  }

  goBack(): void {
    this.step.set('register');
    this.token = '';
    this.error.set('');
    this.successMsg.set('');
  }
}
