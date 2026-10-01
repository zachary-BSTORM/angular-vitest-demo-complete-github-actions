import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthServices } from '../../services/auth/auth-services';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  
  authService = inject(AuthServices)
  isLogged = this.authService.isLogged

  logout(){
    this.authService.logout()
  }
}
