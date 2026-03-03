import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8081/api/v1';

  send(serviceId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.api}/messages/send`, { serviceId, content });
  }
  conversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/conversations`);
  }
  messages(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/conversations/${conversationId}/messages`);
  }
}
