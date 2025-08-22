import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../apiService';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [CookieService]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private cookieService: CookieService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      this.apiService.login({"user": {email: this.loginForm.value.email, "password": this.loginForm.value.password}}).subscribe({
        next: (data: any) => {
          if (data && data.status.code === 200) {
            sessionStorage.setItem('current_user', data.jwt);
            this.router.navigate(['/messages']);
          }
        },
        error: (err) => {
          console.log("Login failed", err);
        }
      });
    }
  }
}