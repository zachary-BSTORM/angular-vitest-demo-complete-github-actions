import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductServices } from '../../../shared/services/product/product-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-add',
  imports: [ReactiveFormsModule],
  templateUrl: './product-add.html',
  styleUrl: './product-add.css',
})
export class ProductAdd {

productForm : FormGroup;
errorMessage = signal<string | null>(null)


fb = inject(FormBuilder)
productService = inject(ProductServices)
router = inject(Router)


constructor(){
  this.productForm = this.fb.group({
    name : ['',[Validators.required,Validators.minLength(2)]],
    description : ['',[Validators.required]],
    price : ['',[Validators.required,Validators.min(1)]],
    quantity : ['',[Validators.required,Validators.min(1)]],
    image : ['',[Validators.required,Validators.minLength(3)]],
  })
}

onSubmit(){
if(this.productForm.valid){
  this.productService.create(this.productForm.value).subscribe({
    next : (res) => {
      this.router.navigateByUrl('/product')
    },
    error : (err) => {
      this.errorMessage.set("L'ajout a échoué")
      
    }
  })
}
}
}
