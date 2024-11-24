import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { StartScreenComponent } from './start-screen.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: StartScreenComponent
      }
    ])
  ],
  declarations: [StartScreenComponent],
  exports: [StartScreenComponent]
})
export class StartScreenModule {}
