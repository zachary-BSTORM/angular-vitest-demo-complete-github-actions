import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServices } from '../../../../shared/services/auth/auth-services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm : FormGroup;

  fb = inject(FormBuilder)
  router = inject(Router)
  authService = inject(AuthServices)

  errorMsg = signal('');
  constructor(){
    this.loginForm = this.fb.group({
      email : ['admin@mail.com',[Validators.required,Validators.email]],
      password : ['admin1234',[Validators.required,Validators.minLength(8)]],
    })
  }

  onSubmit(){
    if(this.loginForm.valid){

      this.authService.login(this.loginForm.value).subscribe({
        next : (res) => {
          this.router.navigateByUrl('/product')
        },
        error: () => {
          this.errorMsg.set('Email ou mot de passe incorrect')
        }
      })
    }
  }
}
