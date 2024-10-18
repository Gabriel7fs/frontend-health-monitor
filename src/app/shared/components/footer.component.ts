import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: `
    <ion-footer>
      <ion-tab-bar>
        <ion-tab-button (click)="navigateTo('home')" tab="home">
          <ion-icon name="pulse-outline"></ion-icon>
        </ion-tab-button>
        <ion-tab-button (click)="navigateTo('profile')" tab="profile">
          <ion-icon name="person-outline"></ion-icon>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-footer>
  `,
  styleUrls: ['../../home/home.component.scss'],
  selector: 'app-footer'
})
export class FooterComponent {

  constructor(private router: Router) {}

  navigateTo(tab: string) {
    this.router.navigate([`/${tab}`]);
  }

}
