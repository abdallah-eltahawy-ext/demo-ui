import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://localhost:44361/api/products';


  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  async loadProducts(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<Product[]>(this.apiUrl));
      this.productsSubject.next(res);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async add(product: Product): Promise<Product> {
    try {
      const created = await firstValueFrom(this.http.post<Product>(this.apiUrl, product));
      this.loadProducts();
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async update(id: number, product: Product): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`${this.apiUrl}/${id}`, product));
      this.loadProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.loadProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}