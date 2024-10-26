import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
})
export class StartScreenComponent {

  public logoApp = '../../assets/img/logo.png';

  constructor(
    readonly router: Router
  ) { }

  onClickLogin(): void {
    this.router.navigateByUrl('/login');
  }

  onClickRegister(): void {
    this.router.navigateByUrl('/register');
  }

}
