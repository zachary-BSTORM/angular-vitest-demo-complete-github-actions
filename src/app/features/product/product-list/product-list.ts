import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../product.model';
import { ProductServices } from '../../../shared/services/product/product-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit{
  
  products = signal<Product[]>([])
  
  productService = inject(ProductServices)
  router = inject(Router)

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next : (res) => {
        this.products.set(res)
      },
      error : (err) => {
        console.log(err);
        
      }
    })
  }


  navigateToDetails(id:number){
    this.router.navigate(['/product/details',id])
  }
}
