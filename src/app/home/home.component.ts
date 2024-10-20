import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public dashboardData: any[] = [];
  private messageSubscription!: Subscription;

  username: any;
  userId: any;
  usertype: any;
  pacientName: any;

  constructor(
    private websocketService: WebsocketService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.websocketService.connect();

    this.messageSubscription = this.websocketService.messages$.subscribe((data: string) => {
      const parsedData = JSON.parse(data);
      this.dashboardData = parsedData;
    });

    console.log(this.dashboardData);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = userData.username;
    this.usertype = userData.type;
    this.userId = userData.id;

    if (this.usertype === 'MONITOR') {
      this.userService.getPacientsByMonitorId(this.userId).subscribe(pacients => {
        if (pacients.length > 0) {
          this.pacientName = pacients[0].username;
        }
      }, error => {
        console.error('Erro ao buscar pacientes', error);
      });
    }
    console.log(this.pacientName);
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  sendHeartbeat(pacientId: any, heartbeat: any, oxygenQuantity: any) {
    const dto = {
      pacientId: pacientId,
      heartbeat: heartbeat,
      oxygenQuantity: oxygenQuantity
    };

    this.websocketService.sendMessage(JSON.stringify(dto));
  }

}
