import { Component } from '@angular/core';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.page.html',
  styleUrls: ['./start-screen.page.scss'],
})
export class StartScreenPage   {

  constructor() { }

  onClickLogin(): void {
    alert("Em desenvolvimento");
  }

  onClickRegister(): void {
    alert("Em desenvolvimento");
  }

}
