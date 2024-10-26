import { Injectable } from '@angular/core';
import { Message, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: any | null = null;
  private messageSubject = new Subject<string>();

  public messages$ = this.messageSubject.asObservable();

  constructor() {}

  connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected: ' + frame);

      this.stompClient?.subscribe('/topic/messages', (message: Message) => {
        if (message.body) {
          console.log(JSON.parse(message.body));
          this.messageSubject.next(message.body);
        }
      });
    }, (error: any) => {
      console.error('Error connecting to WebSocket:', error);
    });
  }

  sendMessage(message: string) {
    this.stompClient?.send('/app/generate', {}, message);
  }

  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected');
      });
    }
  }
}
