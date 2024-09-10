export class LoginModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { StartScreenPage } from './start-screen.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: StartScreenPage
      }
    ])
  ],
  declarations: [StartScreenPage],
  exports: [StartScreenPage]
})
export class StartScreenModule {}
