import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:3000'; // Replace with your API base URL

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/data`);
  }

  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, payload);
  }

  signUp(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, payload);
  }

  getMessages(payload: any): Observable<any> {
    const id = sessionStorage.getItem('current_user');
    const headers = id ? { headers: { 'Authorization': `Bearer ${id}` } } : {};
    return this.http.post<any>(`${this.apiUrl}/messages`, payload, headers);
  }

  createMessage(payload: any): Observable<any> {
    const id = sessionStorage.getItem('current_user');
    const headers = id ? { headers: { 'Authorization': `Bearer ${id}` } } : {};
    return this.http.post<any>(`${this.apiUrl}/messages/create`, payload, headers);
  }

  logout() {
    return this.http.delete<any>(`${this.apiUrl}/logout`);
  }
}