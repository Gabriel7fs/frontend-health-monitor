import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditProfileComponent } from './edit-profile.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { of, throwError } from 'rxjs';

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(waitForAsync(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['updateUser']);

    TestBed.configureTestingModule({
      declarations: [ EditProfileComponent ],
      imports: [IonicModule.forRoot()],
      providers: [ provideHttpClient(),
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with user data from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({
      id: 1,
      name: 'Test User',
      emergencyContact: '1234567890',
      cpf: '123.456.789-00',
      birthDate: '1990-01-01',
      address: 'Test Address',
      type: 'PACIENT'
    }));

    component.ngOnInit();
    expect(component.userId).toBe(1);
    expect(component.username).toBe('Test User');
    expect(component.emergencyContact).toBe('(12) 3456-7890');
    expect(component.cpf).toBe('123.456.789-00');
    expect(component.birthDate).toBe('01/01/1990');
    expect(component.address).toBe('Test Address');
    expect(component.type).toBe('PACIENT');
  });

  it('should apply phone mask correctly', () => {
    const event = { target: { value: '1234567890' } };
    component.applyPhoneMask(event);
    const formattedValue = component.profileForm.get('emergencyContact')?.value;
    expect(formattedValue).toBe('(12) 3456-7890');
  });

  it('should update localStorage with new address and emergency contact', () => {
    spyOn(localStorage, 'setItem').and.callThrough();
    component.updateLocalStorage('New Address', '(12) 3456-7890');

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    expect(userData.address).toBe('New Address');
    expect(userData.emergencyContact).toBe('(12) 3456-7890');
  });


  it('should call userService.updateUser on valid form submit', () => {
    component.userId = '1';
    component.type = 'PACIENT';
    component.profileForm.setValue({
      userName: 'Test User',
      emergencyContact: '(12) 3456-7890',
      cpf: '123.456.789-00',
      birthDate: '01/01/1990',
      address: 'New Address'
    });
    userServiceSpy.updateUser.and.returnValue(of({}));

    component.onUpdateProfile();

    expect(userServiceSpy.updateUser).toHaveBeenCalledWith('1', {
      address: 'New Address',
      emergencyContact: 1234567890
    });
    expect(component.isToastOpen).toBeTrue();
  });

  it('should show error toast when updateUser fails', () => {
    spyOn(component, 'showErrorToast');
    userServiceSpy.updateUser.and.returnValue(throwError(() => new Error('Error updating user')));

    component.userId = 1;
    component.profileForm.setValue({
      userName: 'Test User',
      emergencyContact: '(12) 3456-7890',
      cpf: '123.456.789-00',
      birthDate: '01/01/1990',
      address: 'New Address'
    });

    component.onUpdateProfile();

    expect(component.showErrorToast).toHaveBeenCalledWith('Erro ao atualizar as informações');
  });
});
