import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserEditorComponent } from './user-editor/user-editor.component';



@NgModule({
  declarations: [UserListComponent, UserDetailComponent, UserEditorComponent],
  imports: [
    CommonModule
  ]
})
export class UserModule { }
