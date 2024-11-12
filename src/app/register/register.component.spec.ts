import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { RegisterService } from '../services/register.service';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let registerServiceSpy: jasmine.SpyObj<RegisterService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  const MOCK_PASSWORD = 'test1234';

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    registerServiceSpy = jasmine.createSpyObj('RegisterService', ['register']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [IonicModule.forRoot()],
      providers: [ provideHttpClient(),
        { provide: Router, useValue: routerSpy },
        { provide: RegisterService, useValue: registerServiceSpy },
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.controls['username']).toBeDefined();
    expect(component.registerForm.controls['cpf']).toBeDefined();
    expect(component.registerForm.controls['password']).toBeDefined();
    expect(component.registerForm.get('type')?.value).toBe('paciente');
  });

  it('should apply CPF mask correctly', () => {
    const event = { target: { value: '12345678901' } };
    component.applyCPFMask(event);
    expect(event.target.value).toBe('123.456.789-01');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should show error toast when form is invalid', () => {
    spyOn(component, 'showErrorToast');
    component.registerForm.get('username')?.setValue('');
    component.onRegister();
    expect(component.showErrorToast).toHaveBeenCalledWith('Preencha todos os campos obrigatórios.');
  });

  it('should show error toast when CPF is invalid', () => {
    spyOn(component, 'showErrorToast');
    component.registerForm.setValue({
      username: 'Paciente teste',
      cpf: '11111111111',
      birthdate: '01/01/1990',
      emergencyContact: '(12) 3456-7890',
      cpfAssociateds: '',
      password: MOCK_PASSWORD,
      type: 'paciente'
    });
    component.onRegister();
    expect(component.showErrorToast).toHaveBeenCalledWith('CPF inválido!');
  });

  it('should call register service and navigate to /login on successful registration', () => {
    component.registerForm.setValue({
      username: 'Paciente teste',
      cpf: '123.456.789-09',
      birthdate: '01/01/1990',
      emergencyContact: '(12) 3456-7890',
      cpfAssociateds: '',
      password: MOCK_PASSWORD,
      type: 'paciente'
    });
    spyOn(component, 'validateCPF').and.returnValue(true);
    registerServiceSpy.register.and.returnValue(of({}));

    component.onRegister();

    expect(registerServiceSpy.register).toHaveBeenCalledWith(jasmine.objectContaining({ username: 'Paciente teste' }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error toast on registration failure', () => {
    spyOn(component, 'showErrorToast');

    component.registerForm.setValue({
      username: 'Paciente teste',
      cpf: '123.456.789-09',
      birthdate: '01/01/1990',
      emergencyContact: '(12) 3456-7890',
      cpfAssociateds: '',
      password: MOCK_PASSWORD,
      type: 'paciente'
    });
    spyOn(component, 'validateCPF').and.returnValue(true);
    registerServiceSpy.register.and.returnValue(throwError(() => new Error('Registration failed')));

    component.onRegister();

    expect(component.showErrorToast).toHaveBeenCalledWith('Erro ao registrar o usuário. Tente novamente.');
  });

  it('should update form validators when segment is changed to monitor', () => {
    component.selectedSegment = 'monitor';
    component.adjustValidators();
    fixture.detectChanges();

    expect(component.registerForm.get('birthdate')?.validator).toBeNull();
    expect(component.registerForm.get('emergencyContact')?.validator).toBeNull();
    expect(component.registerForm.get('cpfAssociateds')?.validator).toBeDefined();
  });

  it('should update form validators when segment is changed to paciente', () => {
    component.selectedSegment = 'paciente';
    component.adjustValidators();
    fixture.detectChanges();

    expect(component.registerForm.get('birthdate')?.validator).toBeDefined();
    expect(component.registerForm.get('emergencyContact')?.validator).toBeDefined();
    expect(component.registerForm.get('cpfAssociateds')?.validator).toBeNull();
  });

  it('should change segment and update form validators accordingly', () => {
    component.selectedSegment = 'monitor';
    component.onSegmentChange({ detail: { value: 'monitor' } } as any);
    expect(component.selectedSegment).toBe('monitor');
    expect(component.registerForm.get('cpfAssociateds')?.validator).toBeDefined();

    component.onSegmentChange({ detail: { value: 'paciente' } } as any);
    expect(component.selectedSegment).toBe('paciente');
    expect(component.registerForm.get('birthdate')?.validator).toBeDefined();
    expect(component.registerForm.get('cpfAssociateds')?.validator).toBeNull();
  });

  it('should apply phone mask correctly', () => {
    const event = { target: { value: '1234567890' } };
    component.applyPhoneMask(event);

    const formattedValue = component.registerForm.get('emergencyContact')?.value;
    expect(formattedValue).toBe('(12) 3456-7890');
  });

  it('should apply birthdate mask correctly', () => {
    const event = { target: { value: '01011990' } };
    component.applyBirthdateMask(event);

    const formattedValue = component.registerForm.get('birthdate')?.value;
    expect(formattedValue).toBe('01/01/1990');
  });

  it('should show a toast when an invalid form is submitted', () => {
    spyOn(component, 'showErrorToast');
    component.registerForm.get('username')?.setValue('');
    component.onRegister();
    expect(component.showErrorToast).toHaveBeenCalledWith('Preencha todos os campos obrigatórios.');
  });

  it('should dismiss the toast when didDismiss event is triggered', () => {
    component.isToastOpen = true;
    component.onToastDismiss();
    expect(component.isToastOpen).toBeFalse();
  });
});
