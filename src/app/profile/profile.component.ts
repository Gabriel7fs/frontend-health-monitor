import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  username!: string;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController
  ) { }

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
          handler: () => { },
        },
      ],
    });
    await actionSheet.present();
  }

  logout() {
    this.loginService.logout();
    this.navCtrl.navigateRoot('/login');
  }
}
