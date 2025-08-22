import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../apiService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.apiService.signUp({"user": {email: this.signUpForm.value.email, "password": this.signUpForm.value.password}}).subscribe({
        next: (data: any) => {
          if (data && data.status.code === 200) {
            sessionStorage.setItem('current_user', data.jwt);
            this.router.navigate(['/messages']);
          }
        },
        error: (err) => {
          console.log("sign up failed", err);
        }
      });
    }
  }
}