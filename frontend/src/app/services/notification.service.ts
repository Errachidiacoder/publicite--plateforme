import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith, BehaviorSubject, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Notification {
    id: number;
    sujetNotification: string;
    corpsMessage: string;
    typeEvenement: string;
    notificationLue: boolean;
    dateEnvoi: string;
    produitSource?: any;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private apiUrl = 'http://localhost:8081/api/v1/notifications';

    private notificationsSub = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSub.asObservable();

    private unreadCountSub = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSub.asObservable();

    private audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    constructor() {
        // Start polling if user is logged in
        interval(30000).pipe(
            startWith(0),
            switchMap(() => {
                const userId = this.auth.getUserId();
                if (userId) {
                    return this.fetchNotifications(userId);
                }
                return [];
            })
        ).subscribe(notifs => {
            const current = this.notificationsSub.value;
            // Check if there are new ones to play sound
            if (notifs.length > current.length) {
                const hasNewUnread = notifs.some(n => !n.notificationLue && !current.find(c => c.id === n.id));
                if (hasNewUnread) {
                    this.playSound();
                }
            }
            this.notificationsSub.next(notifs);
            this.unreadCountSub.next(notifs.filter(n => !n.notificationLue).length);
        });
    }

    private fetchNotifications(userId: number): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
    }

    markAsRead(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
            tap(() => {
                const notifs = this.notificationsSub.value.map(n =>
                    n.id === id ? { ...n, notificationLue: true } : n
                );
                this.notificationsSub.next(notifs);
                this.unreadCountSub.next(notifs.filter(n => !n.notificationLue).length);
            })
        );
    }

    playSound() {
        this.audio.play().catch(err => console.log('Audio play failed', err));
    }
}
