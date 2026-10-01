import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginForm, LoginResponse, RegisterForm } from '../../../core/auth/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {

  API_URL = "http://localhost:3000"

  httpClient = inject(HttpClient)

 isLogged = signal(false)
  isAdmin = signal(false)



  constructor(){
   const token = localStorage.getItem('token')

   if(token){
    this.isLogged.set(true)
   }

   const role = localStorage.getItem('role')

   if(role == 'admin'){
    this.isAdmin.set(true)
   }
  }

login(loginForm: LoginForm): Observable<LoginResponse> {
  return this.httpClient.post<LoginResponse>(`${this.API_URL}/login`, loginForm).pipe(
    tap((res) => {
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('role',res.user.role);
      this.isLogged.set(true)
      if(res.user.role == 'admin'){
        this.isAdmin.set(true);
      }
    })
  );
}

register(registerForm : RegisterForm) : Observable<LoginResponse>{
  registerForm.role = 'user'
  return this.httpClient.post<LoginResponse>(`${this.API_URL}/register`,registerForm).pipe(
    tap((res) => {
      localStorage.setItem('token',res.accessToken);
      localStorage.setItem('role',res.user.role);

      this.isLogged.set(true)
      if(res.user.role == 'admin'){
        this.isAdmin.set(true);
      }
    })
  )
  }

  logout(){
    this.isAdmin.set(false);
    this.isLogged.set(false);

    localStorage.clear()
  }
}
