import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../product.model';
import { ProductServices } from '../../../shared/services/product/product-services';

@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {


  product = signal<Product | null>(null)

  activRoute = inject(ActivatedRoute)
  router = inject(Router)
  productService = inject(ProductServices)

ngOnInit(): void {
    const productId = +this.activRoute.snapshot.params['id'];
    this.productService.getById(productId).subscribe({
      next : (res) => {
        this.product.set(res)
      }
    })
  }

  navigateToUpdate(id : number){
    if(id){
      this.router.navigate(['/product/update',id])
    }
  }

}
