import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

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

  clearSearch() {
    // Emit null to signal that search should be cleared
    // This will trigger recommended-songs to load all songs
    this.searchResultsSubject.next(null as any);
  }

  uploadSong(formData: FormData): Observable<any> {
    console.log("uploading song");
    console.log(formData);
    return this.http.post(`${this.baseUrl}/audio-posts`, formData);
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

  // Authentication methods
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  login(username: string, password: string): Observable<{ token: string }> {
    return this.post<{ token: string }>('auth/login', { username, password });
  }

  register(userData: any): Observable<any> {
    return this.post('auth/register', userData);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  setToken(token: string) {
    localStorage.setItem('jwt_token', token);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Observable<any> {
    return this.get('auth/me');
  }

  setCurrentUser(user: any) {
    this.currentUserSubject.next(user);
  }
}
