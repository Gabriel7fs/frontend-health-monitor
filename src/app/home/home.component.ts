import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
import { UserService } from '../services/user.service';
import { BluetoothData, BluetoothDataService } from '../services/bluetooth-data-service.service';
import { ConnectionStatus, Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnDestroy {
  public dashboardData: any[] = [];
  public messageSubscription!: Subscription;

  username: any;
  userId: any;
  usertype: any;
  pacientName: any;
  userCpf: any;

  public bluetoothData: BluetoothData[] = [];

  currentBpm: any;
  currentSpo2: any;

  isConnected = true;

  constructor(
    private websocketService: WebsocketService,
    private userService: UserService,
    private bluetoothDataService: BluetoothDataService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ionViewWillEnter() {
    this.loadUserData();
    this.initializeDataSource();
  }

  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = userData.name;
    this.usertype = userData.type;
    this.userId = userData.id;
    this.userCpf = userData.cpf;
  }

  initializeDataSource() {
    if (this.usertype === 'MONITOR') {
      this.loadPatients();
    }

    Network.getStatus().then((status: ConnectionStatus) => {
      this.isConnected = status.connected;
      this.cdr.detectChanges();
      this.setupConnection();
    });

    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.isConnected = status.connected;
      this.cdr.detectChanges();
      this.setupConnection();
    });
  }

  setupConnection() {
    if (this.isConnected) {
      console.log('Conectado à internet.');
      this.initializeWebsocket();
    } else {
      console.log('Sem conexão com a internet.');
      this.showToast('Sem conexão com a internet.', 'warning');
      this.initializeBluetooth();
    }
  }

  loadPatients() {
    this.userService.getPacientsByMonitorId(this.userCpf).subscribe({
      next: (patients) => {
        this.pacientName = patients[0].user.name;
      },
      error: (error) => {
        console.error('Erro ao buscar pacientes', error);
      }
    });
  }

  initializeWebsocket() {
    this.messageSubscription = this.websocketService.messages$.subscribe((data: any) => {
      if (data.length > 0 && data[0].heartbeats && data[0].heartbeats.length > 0) {
        const latest = data[0].heartbeats[data[0].heartbeats.length - 1];

        this.currentBpm = latest.heartbeat?.toFixed(1) || '00.0';
        this.currentSpo2 = latest.oxygenQuantity?.toFixed(1) || '00.0';
        this.cdr.detectChanges();
        this.sendAlert();
      } else {
        console.warn('Dados incompletos ou ausentes.');
      }
    });
  }

  initializeBluetooth() {
    this.bluetoothDataService.latestData$.subscribe({
      next: (data) => {
        if (data) {
          this.currentBpm = data.bpm || '00.0';
          this.currentSpo2 = data.spo2 || '00.0';

          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Erro ao receber dados Bluetooth (Home):', err),
    });
  }

  sendAlert() {
    const bpm = parseFloat(this.currentBpm);
    const spo2 = parseFloat(this.currentSpo2);

    switch (true) {
      case bpm < 60:
        this.showToast(
          'Paciente está apresentando frequência cardíaca irregular (bradicardia), abaixo de 60 bpm',
          'danger'
        );
        break;
      case bpm > 100:
        this.showToast(
          'Paciente está apresentando frequência cardíaca irregular (taquicardia), acima de 100 bpm',
          'danger'
        );
        break;
      case spo2 < 90:
        this.showToast(
          'Paciente está com baixa saturação de oxigênio no sangue (hipoxemia), abaixo de 90%',
          'danger'
        );
        break;
      default:
        console.log('Todos os sinais vitais estão dentro do intervalo normal.');
    }
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color,
      buttons: ['Fechar'],
    });
    toast.present();
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
