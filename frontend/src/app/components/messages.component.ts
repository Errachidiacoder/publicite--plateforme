import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../services/message.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-page">
      <div class="grid">
        <div class="left">
          <div class="header">Conversations</div>
          <div class="list">
            <div class="item" *ngFor="let c of conversations" [class.active]="c.id === activeId" (click)="open(c)">
              <div class="title">{{ c.service?.titreService || 'Conversation' }}</div>
              <div class="snippet">{{ c.lastMessage }}</div>
              <div class="date">{{ c.lastAt | date:'dd/MM HH:mm' }}</div>
            </div>
          </div>
        </div>
        <div class="right" *ngIf="activeId">
          <div class="thread">
            <div class="msg" *ngFor="let m of messages" [class.mine]="isMine(m.sender?.id)">
              <div class="bubble">{{ m.content }}</div>
              <div class="time">{{ m.createdAt | date:'HH:mm' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: 320px 1fr; gap: 14px; max-width: 1100px; margin: 0 auto; }
    .left { border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: white; }
    .header { padding: 12px 14px; font-weight: 900; border-bottom: 1px solid #e2e8f0; }
    .list { display: grid; }
    .item { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
    .item.active { background: #e0f7ff; }
    .title { font-weight: 800; color: #0f172a; }
    .snippet { color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .date { color: #94a3b8; font-size: 0.8rem; }
    .right { border: 1px solid #e2e8f0; border-radius: 16px; background: white; padding: 12px; }
    .thread { display: grid; gap: 10px; }
    .msg { display: grid; gap: 4px; }
    .msg.mine { justify-items: end; }
    .bubble { background: #f1f5f9; padding: 10px 12px; border-radius: 12px; max-width: 70%; }
    .msg.mine .bubble { background: #1aafa5; color: white; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class MessagesComponent {
  private api = inject(MessageService);
  conversations: any[] = [];
  messages: any[] = [];
  activeId: number | null = null;

  ngOnInit() {
    this.reloadConversations();
  }

  reloadConversations() {
    this.api.conversations().subscribe(list => {
      this.conversations = list;
      if (list.length && !this.activeId) this.open(list[0]);
    });
  }

  open(conv: any) {
    this.activeId = conv.id;
    this.api.messages(conv.id).subscribe(msgs => this.messages = msgs);
  }

  isMine(senderId?: number) {
    const s = localStorage.getItem('pub_auth');
    if (!s) return false;
    try { const p = JSON.parse(s); return p.userId === senderId; } catch { return false; }
  }
}
