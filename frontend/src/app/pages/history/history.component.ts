import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DailyLogService, HistorySummary } from '../../core/daily-log.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  user = this.authService.currentUser;
  logs = signal<HistorySummary[]>([]);
  loading = signal(true);
  error = signal('');

  // Quick stats computed from logs
  totalDays = signal(0);
  metCount  = signal(0);
  avgCalories = signal(0);

  constructor(
    private authService: AuthService,
    private dailyLogService: DailyLogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.user();
    if (!user) { this.router.navigate(['/auth']); return; }
    this.loadHistory(user.email);
  }

  loadHistory(email: string): void {
    this.loading.set(true);
    this.dailyLogService.getHistory(email, 60).subscribe({
      next: (res) => {
        this.logs.set(res.logs);
        this.totalDays.set(res.count);
        this.metCount.set(res.logs.filter(l => l.goalStatus === 'met').length);
        const sum = res.logs.reduce((acc, l) => acc + l.totalCalories, 0);
        this.avgCalories.set(res.logs.length ? Math.round(sum / res.logs.length) : 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load history.');
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'met')     return 'status-met';
    if (status === 'not_met') return 'status-not-met';
    return 'status-pending';
  }

  getStatusLabel(status: string): string {
    if (status === 'met')     return '✓ Met';
    if (status === 'not_met') return '✗ Not met';
    return '—';
  }

  getProgressWidth(log: HistorySummary): number {
    if (!log.dailyCalorieTarget) return 0;
    return Math.min(100, Math.round((log.totalCalories / log.dailyCalorieTarget) * 100));
  }

  getBarColor(log: HistorySummary): string {
    if (log.goalStatus === 'met')     return '#5f8263';
    if (log.goalStatus === 'not_met') return '#a85f5f';
    return '#b89c85';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}
