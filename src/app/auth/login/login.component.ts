import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isLoading = true;

  constructor(public authService: AuthService,
              private router: Router,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    // this.getCSRFToken();
    this.defineForm();
    this.isLoading = false;
  }

  // private getCSRFToken() {
  //   this.authService.getCSRFCookie()
  //     .subscribe(
  //       response => {
  //       },
  //       error => console.log(error)
  //     );
  // }

  private defineForm(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  public login(form): void {
    this.isLoading = true;
    this.authService.login(form.value)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        result => {
          this.router.navigate(['/dashboard']);
        },
        error => {
          console.log(error);
        }
      );
  }
}
