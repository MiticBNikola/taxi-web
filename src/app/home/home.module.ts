import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomeComponent} from './home.component';
import {MatIconModule} from '@angular/material/icon';



@NgModule({
  declarations: [HomeComponent],
    imports: [
        CommonModule,
        MatIconModule
    ]
})
export class HomeModule { }
