import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationDisplayComponent } from './components/notification-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationDisplayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
