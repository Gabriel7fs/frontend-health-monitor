import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ToastController } from '@ionic/angular';
import { HomeComponent } from './home.component';
import { WebsocketService } from '../services/websocket.service';
import { UserService } from '../services/user.service';
import { BluetoothDataService } from '../services/bluetooth-data-service.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const mockWebsocketService = {
    connect: jasmine.createSpy('connect'),
    disconnect: jasmine.createSpy('disconnect'),
    messages$: of([{ heartbeats: [{ heartbeat: 72, oxygenQuantity: 98 }] }]),
  };

  const mockUserService = {
    getPacientsByMonitorId: jasmine.createSpy('getPacientsByMonitorId').and.returnValue(
      of([{ user: { name: 'User test' } }])
    ),
  };

  const mockBluetoothDataService = {
    latestData$: of({ bpm: 75, spo2: 97 }),
  };

  const mockToastController = {
    create: jasmine.createSpy('create').and.callFake(() => {
      return {
        present: jasmine.createSpy('present'),
      };
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: WebsocketService, useValue: mockWebsocketService },
        { provide: UserService, useValue: mockUserService },
        { provide: BluetoothDataService, useValue: mockBluetoothDataService },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients for MONITOR user type', () => {
    component.usertype = 'MONITOR';
    component.userCpf = '123456789';
    component.loadPatients();

    expect(mockUserService.getPacientsByMonitorId).toHaveBeenCalledWith('123456789');
    expect(component.pacientName).toBe('User test');
  });

  it('should handle WebSocket data correctly', () => {
    component.initializeWebsocket();

    expect(component.currentBpm).toBe('72.0');
    expect(component.currentSpo2).toBe('98.0');
  });

  it('should handle Bluetooth data correctly', () => {
    component.initializeBluetooth();

    expect(component.currentBpm).toBe(75);
    expect(component.currentSpo2).toBe(97);
  });

  it('should show alert when BPM is below 60 (bradicardia)', async () => {
    component.currentBpm = '55';
    component.currentSpo2 = '95';

    await component.sendAlert();

    expect(mockToastController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: 'Paciente está apresentando frequência cardíaca irregular (bradicardia), abaixo de 60 bpm',
        color: 'danger',
      })
    );
  });

  it('should show alert when SpO2 is below 90 (hipoxemia)', async () => {
    component.currentBpm = '70';
    component.currentSpo2 = '88';

    await component.sendAlert();

    expect(mockToastController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: 'Paciente está com baixa saturação de oxigênio no sangue (hipoxemia), abaixo de 90%',
        color: 'danger',
      })
    );
  });

  it('should unsubscribe and disconnect WebSocket on ngOnDestroy', () => {
    component.messageSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);

    component.ngOnDestroy();

    expect(component.messageSubscription.unsubscribe).toHaveBeenCalled();
  });
});
