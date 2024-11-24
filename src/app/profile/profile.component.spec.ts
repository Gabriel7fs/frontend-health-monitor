import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ActionSheetController, NavController } from '@ionic/angular';

import { ProfileComponent } from './profile.component';
import { provideHttpClient } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['logout']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);

    TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
      imports: [IonicModule.forRoot()],
      providers: [ provideHttpClient(),
        { provide: Router, useValue: routerSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize username from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'TestUser' }));
    component.ngOnInit();
    expect(component.username).toBe('TestUser');
  });

  it('should navigate to edit profile page when onClickEditProfile is called', () => {
    component.onClickEditProfile();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/edit-profile']);
  });

  it('should present action sheet when presentLogoutActionSheet is called', async () => {
    const mockActionSheet = {
      present: jasmine.createSpy('present'),
    };
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(mockActionSheet as any));

    await component.presentLogoutActionSheet();
    expect(actionSheetControllerSpy.create).toHaveBeenCalledWith({
      header: 'Sair',
      subHeader: 'Tem certeza que deseja sair?',
      cssClass: 'my-custom-class',
      buttons: jasmine.arrayContaining([
        jasmine.objectContaining({
          text: 'Sair',
          role: 'destructive',
        }),
        jasmine.objectContaining({
          text: 'Cancelar',
        }),
      ]),
    });
    expect(mockActionSheet.present).toHaveBeenCalled();
  });

  it('should logout and navigate to login page when logout is called', () => {
    component.logout();
    expect(loginServiceSpy.logout).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });
});
