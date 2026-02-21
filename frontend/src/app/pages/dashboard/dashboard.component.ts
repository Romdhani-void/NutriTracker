import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DailyLogService, DailyLog, FoodEntry } from '../../core/daily-log.service';
import { GoalService, Goal } from '../../core/goal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  user = this.authService.currentUser;

  log = signal<DailyLog | null>(null);
  goal = signal<Goal | null>(null);

  loadingLog = signal(true);
  addingFood = signal(false);
  deletingId = signal<string | null>(null);
  error = signal('');

  // Food form
  foodName = '';
  foodCalories: number | null = null;
  formError = signal('');

  today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  progressPercent = computed(() => {
    const l = this.log();
    if (!l || !l.dailyCalorieTarget) return 0;
    return Math.min(100, Math.round((l.totalCalories / l.dailyCalorieTarget) * 100));
  });

  remainingCalories = computed(() => {
    const l = this.log();
    if (!l || !l.dailyCalorieTarget) return null;
    return l.dailyCalorieTarget - l.totalCalories;
  });

  constructor(
    private authService: AuthService,
    private dailyLogService: DailyLogService,
    private goalService: GoalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.user();
    if (!user) { this.router.navigate(['/auth']); return; }
    this.loadData(user.email);
  }

  loadData(email: string): void {
    this.loadingLog.set(true);

    // Load today's log
    this.dailyLogService.getToday(email).subscribe({
      next: (res: any) => {
        const log = res.log ?? res;
        this.log.set(log);
        this.loadingLog.set(false);
      },
      error: () => {
        this.loadingLog.set(false);
        this.error.set('Could not load today\'s log.');
      }
    });

    // Load goal details
    this.goalService.getGoal(email).subscribe({
      next: (res) => this.goal.set(res.goal),
      error: () => {} // Goal might not be set
    });
  }

  addFood(): void {
    this.formError.set('');
    if (!this.foodCalories || this.foodCalories <= 0) {
      this.formError.set('Please enter a calorie amount greater than 0.');
      return;
    }

    const email = this.user()?.email;
    if (!email) return;

    this.addingFood.set(true);
    this.dailyLogService.addFood(
      email,
      this.foodName.trim() || 'Unnamed food',
      Math.round(this.foodCalories)
    ).subscribe({
      next: (res) => {
        this.log.set(res.log);
        this.foodName = '';
        this.foodCalories = null;
        this.addingFood.set(false);
      },
      error: (err) => {
        this.addingFood.set(false);
        this.formError.set(err?.error?.error || 'Failed to add food.');
      }
    });
  }

  deleteFood(entry: FoodEntry): void {
    const email = this.user()?.email;
    if (!email) return;

    this.deletingId.set(entry._id);
    this.dailyLogService.deleteFood(email, entry._id).subscribe({
      next: (res) => {
        this.log.set(res.log);
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.error.set('Failed to remove food entry.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  getStatusClass(): string {
    const status = this.log()?.goalStatus;
    if (status === 'met')     return 'status-met';
    if (status === 'not_met') return 'status-not-met';
    return 'status-pending';
  }

  getStatusLabel(): string {
    const status = this.log()?.goalStatus;
    if (status === 'met')     return '✓ Goal met today!';
    if (status === 'not_met') return '· Goal not met yet';
    return '· No goal set';
  }

  getProgressColor(): string {
    const pct = this.progressPercent();
    if (pct >= 100) return '#5f8263';
    if (pct >= 75)  return '#c8925a';
    return '#b05c3a';
  }
}
