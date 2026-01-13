import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';
import { API_BASE_URL } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${API_BASE_URL}/products`;

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  add(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: Product): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateProductsList(products: Product[]) {
    this.productsSubject.next(products);
  }
}