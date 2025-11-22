import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8082';

  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  // Subject to manage the currently playing track
  private currentTrackSubject = new BehaviorSubject<any>(null);
  public currentTrack$ = this.currentTrackSubject.asObservable();

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string, options: any = {}): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options) as Observable<T>;
  }

  searchTracks(query: string) {
    if (!query.trim()) {
      this.searchResultsSubject.next([]);
      return;
    }
    this.get<any[]>(`tracks/search?query=${query}`).subscribe({
      next: (results) => this.searchResultsSubject.next(results),
      error: (err) => console.error('Search error', err)
    });
  }

  post<T>(endpoint: string, body: any, options: any = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options) as Observable<T>;
  }

  put<T>(endpoint: string, body: any, options: any = {}): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options) as Observable<T>;
  }

  delete<T>(endpoint: string, options: any = {}): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options) as Observable<T>;
  }

  setCurrentTrack(track: any) {
    this.currentTrackSubject.next(track);
  }
}
