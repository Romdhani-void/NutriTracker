import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GoalPayload {
  userEmail: string;
  weight: number;    // kg
  height: number;    // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalType: 'maintain' | 'lose' | 'gain';
}

export interface Goal extends GoalPayload {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly baseUrl = environment.goalServiceUrl;

  constructor(private http: HttpClient) {}

  saveGoal(payload: GoalPayload): Observable<{ goal: Goal }> {
    return this.http.post<{ goal: Goal }>(`${this.baseUrl}/goals`, payload);
  }

  getGoal(email: string): Observable<{ goal: Goal }> {
    return this.http.get<{ goal: Goal }>(`${this.baseUrl}/goals/${encodeURIComponent(email)}`);
  }
}
