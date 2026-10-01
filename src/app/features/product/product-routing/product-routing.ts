import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-product-routing',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './product-routing.html',
  styleUrl: './product-routing.css',
})
export class ProductRouting {}
