import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

import { LoginComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  beforeEach(waitForAsync(() => {

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['login']);

    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [IonicModule.forRoot()],
      providers: [ provideHttpClient(),
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: LoginService, useValue: loginServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on ngOnInit', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.controls['cpf']).toBeDefined();
    expect(component.loginForm.controls['password']).toBeDefined();
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
    component.onLogin();
    expect(component.showErrorToast).toHaveBeenCalledWith('Por favor, preencha todos os campos corretamente.');
  });

  it('should call login service and navigate to /home on successful login', () => {
    component.loginForm.setValue({ cpf: '12345678901', password: 'password' });
    loginServiceSpy.login.and.returnValue(of({ success: true }));

    component.onLogin();

    expect(loginServiceSpy.login).toHaveBeenCalledWith({ cpf: '12345678901', password: 'password' });
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/home');
  });

  it('should show error toast on login failure', () => {
    component.loginForm.setValue({ cpf: '12345678901', password: 'password' });
    loginServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    spyOn(component, 'showErrorToast');

    component.onLogin();

    expect(component.showErrorToast).toHaveBeenCalledWith('Usuário ou senha incorretos');
  });

  it('should navigate to /new-password when forgotPassword is called', () => {
    component.forgotPassword();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/new-password']);
  });
});
