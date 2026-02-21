import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { GoalService, GoalPayload } from '../../core/goal.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
  step = signal(1);

  form: GoalPayload = {
    userEmail: '',
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'sedentary',
    goalType: 'maintain',
  };

  loading = signal(false);
  error = signal('');
  result = signal<{ bmr: number; tdee: number; target: number } | null>(null);

  activityOptions = [
    { value: 'sedentary',   label: 'Sedentary',    desc: 'Little or no exercise' },
    { value: 'light',       label: 'Lightly active', desc: '1–3 days/week' },
    { value: 'moderate',    label: 'Moderately active', desc: '3–5 days/week' },
    { value: 'active',      label: 'Very active',   desc: '6–7 days/week' },
    { value: 'very_active', label: 'Extra active',  desc: 'Hard training + physical job' },
  ];

  goalOptions = [
    { value: 'maintain', label: 'Maintain weight', emoji: '⚖️', desc: 'Eat at your TDEE' },
    { value: 'lose',     label: 'Lose fat',        emoji: '🍃', desc: '~500 kcal deficit/day' },
    { value: 'gain',     label: 'Gain weight',     emoji: '💪', desc: '~300 kcal surplus/day' },
  ];

  constructor(
    private authService: AuthService,
    private goalService: GoalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }
    this.form.userEmail = user.email;
  }

  nextStep(): void {
    this.error.set('');
    if (this.step() === 1) {
      if (!this.form.weight || !this.form.height || !this.form.age) {
        this.error.set('Please fill in all fields.');
        return;
      }
    }
    this.step.update(s => s + 1);
  }

  prevStep(): void {
    this.step.update(s => s - 1);
  }

  onSubmit(): void {
    this.error.set('');
    this.loading.set(true);

    this.goalService.saveGoal(this.form).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.result.set({
          bmr: res.goal.bmr,
          tdee: res.goal.tdee,
          target: res.goal.dailyCalorieTarget,
        });
        this.step.set(3);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Failed to save your goal. Please try again.');
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
