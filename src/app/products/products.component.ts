import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products$!: Observable<Product[]>;

  name = '';
  price: number | null = null;
  editingId: number | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.products$; 
    this.productService.loadProducts();
  }

  save() {
    if (!this.name || this.price === null) return;

    if (this.editingId) {
      this.productService.update(this.editingId, {
        id: this.editingId,
        name: this.name,
        price: this.price
      });
    } else {
      this.productService.add({
        id: 0,
        name: this.name,
        price: this.price
      });
    }

    this.reset();
  }

  edit(p: Product) {
    this.editingId = p.id;
    this.name = p.name;
    this.price = p.price;
  }

  delete(id: number) {
    this.productService.delete(id);
  }

  reset() {
    this.name = '';
    this.price = null;
    this.editingId = null;
  }
}
