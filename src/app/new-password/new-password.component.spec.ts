import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewPasswordComponent } from './new-password.component';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { of, throwError } from 'rxjs';

describe('NewPasswordComponent', () => {
  let component: NewPasswordComponent;
  let fixture: ComponentFixture<NewPasswordComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(waitForAsync(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['updatePassword']);

    TestBed.configureTestingModule({
      declarations: [ NewPasswordComponent ],
      imports: [IonicModule.forRoot() ],
      providers: [ provideHttpClient(),
        { provide: UserService, useValue: userServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.newPasswordForm).toBeDefined();
    expect(component.newPasswordForm.controls['cpf']).toBeDefined();
    expect(component.newPasswordForm.controls['password']).toBeDefined();
    expect(component.newPasswordForm.controls['confirmPassword']).toBeDefined();
  });

  it('should show error toast if form is invalid on submit', () => {
    spyOn(component, 'showErrorToast');
    component.newPasswordForm.get('cpf')?.setValue('');
    component.newPasswordForm.get('password')?.setValue('');
    component.newPasswordForm.get('confirmPassword')?.setValue('');

    component.onSubmit();

    expect(component.showErrorToast).toHaveBeenCalledWith('Por favor, preencha os campos corretamente.');
  });

  it('should show error toast if passwords do not match', () => {
    spyOn(component, 'showErrorToast');
    component.newPasswordForm.get('cpf')?.setValue('123.456.789-01');
    component.newPasswordForm.get('password')?.setValue('password123');
    component.newPasswordForm.get('confirmPassword')?.setValue('differentPassword');

    component.onSubmit();

    expect(component.showErrorToast).toHaveBeenCalledWith('As senhas não correspondem.');
  });

  it('should call userService.updatePassword if form is valid and passwords match', () => {
    userServiceSpy.updatePassword.and.returnValue(of({}));

    component.newPasswordForm.get('cpf')?.setValue('123.456.789-01');
    component.newPasswordForm.get('password')?.setValue('password123');
    component.newPasswordForm.get('confirmPassword')?.setValue('password123');

    component.onSubmit();

    expect(userServiceSpy.updatePassword).toHaveBeenCalledWith({
      cpf: '123.456.789-01',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(component.isToastOpen).toBeTrue();
  });

  it('should show error toast on update password failure', () => {
    spyOn(component, 'showErrorToast');
    userServiceSpy.updatePassword.and.returnValue(throwError(() => new Error('Update failed')));

    component.newPasswordForm.get('cpf')?.setValue('123.456.789-01');
    component.newPasswordForm.get('password')?.setValue('password123');
    component.newPasswordForm.get('confirmPassword')?.setValue('password123');

    component.onSubmit();

    expect(userServiceSpy.updatePassword).toHaveBeenCalled();
    expect(component.showErrorToast).toHaveBeenCalledWith('Erro ao atualizar a senha.');
  });

  it('should apply CPF mask correctly', () => {
    const event = { target: { value: '12345678901' } };
    component.applyCPFMask(event);
    expect(event.target.value).toBe('123.456.789-01');
  });
});
