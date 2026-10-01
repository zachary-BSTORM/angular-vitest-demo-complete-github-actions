import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProduct, Product, UpdateProduct } from '../../../features/product/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductServices {
  API_URL = "http://localhost:3000"

  httpClient = inject(HttpClient)

  getProducts() : Observable<Product[]>{
    return this.httpClient.get<Product[]>(`${this.API_URL}/product`)
  }
  
  getById(id : number) : Observable<Product>{
    return this.httpClient.get<Product>(`${this.API_URL}/product/${id}`)
  }
  
  
  create(newProduct : CreateProduct) : Observable<Product>{
    return this.httpClient.post<Product>(`${this.API_URL}/product`,newProduct)

  }

  update(updatedProduct : UpdateProduct , id : number) : Observable<Product>{
    return this.httpClient.put<Product>(`${this.API_URL}/product/${id}`,updatedProduct)
  }

  delete(id : number){
    return this.httpClient.delete<Product>(`${this.API_URL}/product/${id}`)
  }

}
