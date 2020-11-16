import {Component, OnInit} from '@angular/core';
import {login} from './auth/auth.actions';
import {AppState} from './reducers';
import {Store} from '@ngrx/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'taxi-web';

  constructor(private store: Store<AppState>) {
  }
  ngOnInit() {
    const userProfile = localStorage.getItem('user');
    if (userProfile) {
      this.store.dispatch(login({user: JSON.parse(userProfile)}));
    }
  }
}
