import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([
        {
            path: '',
            component: HomeComponent
        }
    ])
],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule {}
