import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../apiService';
import { WebSocketService } from '../../../websocketService';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Message {
  phone: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-messages',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
  messageForm: FormGroup;
  messages: Message[] = [];
  private statusSubscription: Subscription | undefined;
  lastDeliveredIndex: number | null = null;
  deliveredStatus: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private webSocketService: WebSocketService) {
    this.messageForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.getMessages({}).subscribe({
      next: (response) => {
        const newMessages = response.map((msg: any) => ({
          phone: msg.to,
          message: msg.body,
          timestamp: new Date(msg.created_at)
        }));
        this.messages = [
          ...newMessages.filter(
            (newMsg: any) =>
              !this.messages.some(
                (existingMsg) =>
                  existingMsg.phone === newMsg.phone &&
                  existingMsg.message === newMsg.message &&
                  existingMsg.timestamp.getTime() === newMsg.timestamp.getTime()
              )
          ),
          ...this.messages
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
    this.statusSubscription = this.webSocketService
      .connectAndSubscribe('https://mysms-api-7064b9d8fda0.herokuapp.com/cable', 'MessageStatusChannel')
      .subscribe((message: any) => {
        if(message.identifier === "{\"channel\":\"MessageStatusChannel\"}"){
          console.log('Received WebSocket message:', JSON.parse(message.message));
          this.deliveredStatus = true;
        }
      });
  }

  onSubmit() {
    if (this.messageForm.valid) {
      const user_id = sessionStorage.getItem('sender');
      this.apiService.createMessage({
        to: this.messageForm.value.phone,
        body: this.messageForm.value.message,
        user_id: user_id
      }).subscribe({
        next: (response: any) => {
          const newMsg: Message = {
            phone: this.messageForm.value.phone,
            message: this.messageForm.value.message,
            timestamp: new Date()
          };
          this.messages.unshift(newMsg);
          this.deliveredStatus = false;
          this.lastDeliveredIndex = 0;
          this.messageForm.reset();
        },
        error: (error: any) => {
          console.error('Error sending message:', error);
        }
      });
    }
  }

  onClear() {
    this.messageForm.reset();
  }

  onLogout() {
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('sender');
    this.apiService.logout().subscribe({
      next: (data: any) => {
        console.log(data)
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.router.navigate(['/login']);
        console.log("Login failed", err);
      }
    });
  }
}