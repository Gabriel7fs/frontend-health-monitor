import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { StartScreenComponent } from './start-screen.component';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('StartScreenComponent', () => {
  let component: StartScreenComponent;
  let fixture: ComponentFixture<StartScreenComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      declarations: [StartScreenComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Adicionando CUSTOM_ELEMENTS_SCHEMA
    }).compileComponents();

    fixture = TestBed.createComponent(StartScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to "/login" when onClickLogin is called', () => {
    component.onClickLogin();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should navigate to "/register" when onClickRegister is called', () => {
    component.onClickRegister();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('should trigger onClickLogin when the login button is clicked', () => {
    spyOn(component, 'onClickLogin');
    const loginButton = fixture.debugElement.query(By.css('.login-button')).nativeElement;
    loginButton.click();
    expect(component.onClickLogin).toHaveBeenCalled();
  });

  it('should trigger onClickRegister when the register button is clicked', () => {
    spyOn(component, 'onClickRegister');
    const registerButton = fixture.debugElement.query(By.css('.register-button')).nativeElement;
    registerButton.click();
    expect(component.onClickRegister).toHaveBeenCalled();
  });
});
