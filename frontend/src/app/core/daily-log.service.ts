import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FoodEntry {
  _id: string;
  name: string;
  calories: number;
  addedAt: string;
}

export interface DailyLog {
  userEmail: string;
  date: string;
  foodEntries: FoodEntry[];
  totalCalories: number;
  dailyCalorieTarget: number | null;
  goalStatus: 'met' | 'not_met' | 'pending';
}

export interface HistorySummary {
  date: string;
  totalCalories: number;
  dailyCalorieTarget: number | null;
  goalStatus: 'met' | 'not_met' | 'pending';
}

@Injectable({ providedIn: 'root' })
export class DailyLogService {
  private readonly baseUrl = environment.dailyLogServiceUrl;

  constructor(private http: HttpClient) {}

  addFood(email: string, name: string, calories: number): Observable<{ log: DailyLog }> {
    return this.http.post<{ log: DailyLog }>(
      `${this.baseUrl}/logs/${encodeURIComponent(email)}/food`,
      { name, calories }
    );
  }

  deleteFood(email: string, entryId: string): Observable<{ log: DailyLog }> {
    const today = new Date().toISOString().slice(0, 10);
    return this.http.delete<{ log: DailyLog }>(
      `${this.baseUrl}/logs/${encodeURIComponent(email)}/food/${entryId}?date=${today}`
    );
  }

  getToday(email: string): Observable<{ log: DailyLog } | DailyLog> {
    return this.http.get<any>(`${this.baseUrl}/logs/${encodeURIComponent(email)}/today`);
  }

  getHistory(email: string, limit = 30): Observable<{ logs: HistorySummary[]; count: number }> {
    return this.http.get<{ logs: HistorySummary[]; count: number }>(
      `${this.baseUrl}/logs/${encodeURIComponent(email)}/history?limit=${limit}`
    );
  }

  getFullHistory(email: string, page = 1, limit = 10): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/logs/${encodeURIComponent(email)}/history/full?page=${page}&limit=${limit}`
    );
  }
}
