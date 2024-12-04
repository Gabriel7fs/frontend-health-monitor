import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { LoginService } from '../services/login.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { BluetoothDataService } from '../services/bluetooth-data-service.service';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  username!: string;

  devices: any[] = [];
  connectedDevice: any = null;
  isModalOpen = false;
  receivedDataList: string[] = [];

  currentBpm: any;
  currentSpo2: any;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private websocketService: WebsocketService,
    private actionSheetController: ActionSheetController,
    private bluetoothSerial: BluetoothSerial,
    private toastCtrl: ToastController,
    private bluetoothDataService: BluetoothDataService
  ) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = userData.username;
  }

  onClickEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  async presentLogoutActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sair',
      subHeader: 'Tem certeza que deseja sair?',
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Sair',
          role: 'destructive',
          icon: 'log-out-outline',
          handler: () => {
            this.logout();
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (isOpen) {
      this.scanForDevices();
    }
  }

  scanForDevices() {
    this.bluetoothSerial.list().then(
      (devices) => {
        this.devices = devices;
      },
      (error) => {
        this.showToast('Erro ao buscar dispositivos Bluetooth ou o Bluetooth está desativado', 'warning');
      }
    );
  }

  connectToDevice(device: any) {
    this.bluetoothSerial.connect(device.id).subscribe({
      next: () => {
        this.connectedDevice = device.id;
        this.showToast(`Conectado ao dispositivo: ${device.name}`, 'primary');
        this.startReadingData();
        this.setOpen(false);
      },
      error: (error) => {
        this.showToast(`Erro ao conectar ao dispositivo: ${error}`, 'danger');
      }
    });
  }

  startReadingData() {
    this.bluetoothSerial.subscribe('\n').subscribe({
      next: (data) => {
        console.log('Dados recebidos do Bluetooth:', data);

        const parsedData = this.parseBluetoothData(data);
        if (parsedData) {
          this.currentBpm = parsedData.bpm;
          this.currentSpo2 = parsedData.spo2;

          this.bluetoothDataService.updateData(parsedData);
        }
      },
      error: (error) => console.error('Erro ao ler dados Bluetooth:', error),
    });
  }

  parseBluetoothData(data: string): { bpm: string; spo2: string } | null {
    try {
      const parsed = JSON.parse(data);
      return {
        bpm: parsed.bpm || '00.0',
        spo2: parsed.spo2 || '00.0',
      };
    } catch (error) {
      console.error('Erro ao parsear dados do Bluetooth:', error);
      return null;
    }
  }

  disconnectDevice(device: any) {
    if (this.connectedDevice === device.id) {
      this.bluetoothSerial.disconnect().then(
        () => {
          this.connectedDevice = null;
          this.showToast('Desconectado do dispositivo com sucesso!', 'success');
        },
        (error) => console.error('Erro ao desconectar o dispositivo:', error)
      );
    }
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      buttons: ['Fechar'],
    });
    toast.present();
  }

  logout() {
    this.websocketService.disconnect();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
