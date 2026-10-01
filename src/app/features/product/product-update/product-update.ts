import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductServices } from '../../../shared/services/product/product-services';
import { Product } from '../product.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-update',
  imports: [ReactiveFormsModule],
  templateUrl: './product-update.html',
  styleUrl: './product-update.css',
})
export class ProductUpdate {
  product = signal<Product | null>(null)

  productForm : FormGroup;


  fb = inject(FormBuilder)
  activRoute = inject(ActivatedRoute)
  router = inject(Router)
  productService = inject(ProductServices)

  constructor(){
    this.productForm = this.fb.group({
      name : ['',[]],
      description : ['',[]],
      price : ['',[]],
      quantity : ['',[]],
      image : ['',[]],
    })
  }

ngOnInit(): void {
    const productId = +this.activRoute.snapshot.params['id'];
    this.productService.getById(productId).subscribe({
      next : (res) => {
        this.product.set(res)
        this.productForm.patchValue(res);
      }
    })
  }

  backToList(id : number){
    if(id){
      this.router.navigateByUrl('/product')
    }
  }

  onSubmit(){
if(this.productForm.valid){
  const product = this.product()
  if(product){
    this.productService.update(this.productForm.value,product.id).subscribe({
      next : (res) => {
        this.router.navigateByUrl('/product')
      },
      error : (err) => {
        console.log(err);
        
      }
    })
  }
}
}

delete(id:number){
  this.productService.delete(id).subscribe({
    next : () => {
      this.router.navigateByUrl('/product')
    }
  })
}
}
