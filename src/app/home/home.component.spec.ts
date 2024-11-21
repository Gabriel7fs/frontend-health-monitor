import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeComponent } from './home.component';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
import { UserService } from '../services/user.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['connect', 'disconnect', 'sendMessage'], {
      messages$: of(JSON.stringify([{ bpm: 80, spo2: 95 }]))
    });
    userServiceSpy = jasmine.createSpyObj('UserService', ['getPacientsByMonitorId']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [IonicModule.forRoot()],
      providers: [ provideHttpClient(),
        { provide: WebsocketService, useValue: websocketServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize username, usertype, and userId from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ name: 'Monitor A', type: 'MONITOR', id: 1 }));

    userServiceSpy.getPacientsByMonitorId.and.returnValue(of([{ user: { name: 'Pacient A' } }]));

    component.ngOnInit();

    expect(component.username).toBe('Monitor A');
    expect(component.usertype).toBe('MONITOR');
    expect(component.userId).toBe(1);
  });


  it('should connect to websocket service on initialization', () => {
    component.ngOnInit();
    expect(websocketServiceSpy.connect).toHaveBeenCalled();
  });

  it('should set dashboard data when message is received from websocket', () => {
    component.ngOnInit();
    expect(component.dashboardData).toEqual([{ bpm: 80, spo2: 95 }]);
  });

  it('should unsubscribe from messageSubscription and disconnect websocket on destroy', () => {
    spyOn(component.messageSubscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(component.messageSubscription.unsubscribe).toHaveBeenCalled();
    expect(websocketServiceSpy.disconnect).toHaveBeenCalled();
  });

  it('should fetch pacient name if usertype is MONITOR', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ name: 'Monitor A', type: 'MONITOR', id: '1' }));

    userServiceSpy.getPacientsByMonitorId.and.returnValue(of([{ user: { name: 'Pacient A' } }]));

    component.ngOnInit();

    expect(userServiceSpy.getPacientsByMonitorId).toHaveBeenCalledWith('1');
    expect(component.pacientName).toBe('Pacient A');
  });

  it('should log an error if fetching pacient name fails', () => {
    spyOn(console, 'error');
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ name: 'Monitor A', type: 'MONITOR', id: 1 }));
    userServiceSpy.getPacientsByMonitorId.and.returnValue(throwError(() => new Error('Error fetching patients')));

    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Erro ao buscar pacientes', jasmine.any(Error));
  });

  it('should send heartbeat data through websocket service', () => {
    component.sendHeartbeat(1, 72, 98);
    expect(websocketServiceSpy.sendMessage).toHaveBeenCalledWith(JSON.stringify({
      pacientId: 1,
      heartbeat: 72,
      oxygenQuantity: 98
    }));
  });
});
