// src/app/services/notification.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket | undefined;
  private subject: Subject<any> = new Subject<any>();

  constructor(private ngZone: NgZone) {}

  // Modified to connect to a generic WebSocket server and subscribe to a channel
  connectAndSubscribe(wsUrl: string, channelName: string): Observable<any> {
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connection opened');
      this.ws?.send(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'MessageStatusChannel' })
      }));
    };

    this.ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      this.ngZone.run(() => {
        const data = JSON.parse(event.data);
        this.subject.next(data);
      });
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return this.subject.asObservable();
  }

  // Method to send an unsubscribe message
  unsubscribeFromChannel(channelName: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', channel: channelName }));
      this.ws.close(); // Close the WebSocket connection after unsubscribing
    }
  }
}
