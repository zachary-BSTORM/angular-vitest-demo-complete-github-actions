import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServices } from '../../../../shared/services/auth/auth-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm : FormGroup;

  fb = inject(FormBuilder)
  authService = inject(AuthServices)
  router = inject(Router)

  errorMessage = signal('')

  constructor(){
    this.registerForm = this.fb.group({
      email : ['',[Validators.required,Validators.email]],
      password : ['',[Validators.required,Validators.minLength(8)]],
      name : ['',[Validators.required,Validators.minLength(2)]],
    })
  }

  onSubmit(){
    if(this.registerForm.valid){
      this.authService.register(this.registerForm.value).subscribe({
        next : (res) => {
          this.router.navigateByUrl('/product')
        },
        error : (err) => {
          this.errorMessage.set("informations incorrectes")
        }
      })
    }
  }
}
