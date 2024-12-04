import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ActionSheetController, ToastController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { LoginService } from '../services/login.service';
import { BluetoothDataService } from '../services/bluetooth-data-service.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    navigateRoot: jasmine.createSpy('navigateRoot'),
  };

  const mockNavController = {
    navigateRoot: jasmine.createSpy('navigateRoot'),
  };

  const mockLoginService = {
    logout: jasmine.createSpy('logout'),
  };

  const mockBluetoothSerial = {
    list: jasmine.createSpy('list').and.returnValue(Promise.resolve([{ id: '1', name: 'Test Device' }])),
    connect: jasmine.createSpy('connect').and.returnValue(of({})),
    disconnect: jasmine.createSpy('disconnect').and.returnValue(Promise.resolve()),
    subscribe: jasmine.createSpy('subscribe').and.returnValue(of('{ "bpm": "75", "spo2": "97" }')),
  };

  const mockBluetoothDataService = {
    updateData: jasmine.createSpy('updateData'),
  };

  const mockActionSheetController = {
    create: jasmine.createSpy('create').and.callFake(() =>
      Promise.resolve({
        present: jasmine.createSpy('present'),
      })
    ),
  };

  const mockToastController = {
    create: jasmine.createSpy('create').and.callFake(() =>
      Promise.resolve({
        present: jasmine.createSpy('present'),
      })
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: LoginService, useValue: mockLoginService },
        { provide: BluetoothSerial, useValue: mockBluetoothSerial },
        { provide: BluetoothDataService, useValue: mockBluetoothDataService },
        { provide: ActionSheetController, useValue: mockActionSheetController },
        { provide: ToastController, useValue: mockToastController },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize username on ngOnInit', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'Test User' }));

    component.ngOnInit();

    expect(component.username).toBe('Test User');
  });

  it('should navigate to edit-profile on onClickEditProfile', () => {
    component.onClickEditProfile();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit-profile']);
  });

  it('should call logout and navigate to login on logout', () => {
    component.logout();
    expect(mockLoginService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should open modal and scan for devices on setOpen(true)', async () => {
    spyOn(component, 'scanForDevices');
    component.setOpen(true);

    expect(component.isModalOpen).toBeTrue();
    expect(component.scanForDevices).toHaveBeenCalled();
  });

  it('should close modal on setOpen(false)', () => {
    component.setOpen(false);
    expect(component.isModalOpen).toBeFalse();
  });

  it('should show toast on error during device scanning', async () => {
    mockBluetoothSerial.list.and.returnValue(Promise.reject('Error'));

    await component.scanForDevices();

    expect(mockToastController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: 'Erro ao buscar dispositivos Bluetooth ou o Bluetooth está desativado',
        color: 'warning',
      })
    );
  });

  it('should connect to a device and start reading data', () => {
    spyOn(component, 'startReadingData');
    const testDevice = { id: '1', name: 'Test Device' };

    component.connectToDevice(testDevice);

    expect(mockBluetoothSerial.connect).toHaveBeenCalledWith('1');
    expect(component.connectedDevice).toEqual('1');
    expect(component.startReadingData).toHaveBeenCalled();
  });

  it('should parse and update Bluetooth data on startReadingData', () => {
    component.startReadingData();

    expect(mockBluetoothSerial.subscribe).toHaveBeenCalledWith('\n');
    expect(component.currentBpm).toBe('75');
    expect(component.currentSpo2).toBe('97');
    expect(mockBluetoothDataService.updateData).toHaveBeenCalledWith({ bpm: '75', spo2: '97' });
  });

  it('should disconnect from a device', async () => {
    const testDevice = { id: '1', name: 'Test Device' };
    component.connectedDevice = '1';

    await component.disconnectDevice(testDevice);

    expect(mockBluetoothSerial.disconnect).toHaveBeenCalled();
    expect(component.connectedDevice).toBeNull();
    expect(mockToastController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: 'Desconectado do dispositivo com sucesso!',
        color: 'success',
      })
    );
  });
});
