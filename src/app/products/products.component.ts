import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {

  products$!: Observable<Product[]>;

  form: FormGroup;
  editingId: number | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService, 
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.products$ = this.productService.products$;
    this.loadProducts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  save() {
    if (this.form.valid) {
      const { name, price } = this.form.value;

      if (this.editingId) {
        this.subscriptions.push(
          this.productService.update(this.editingId, {
            id: this.editingId,
            name,
            price
          }).subscribe({
            next: () => {
              this.loadProducts();
              this.reset();
            },
            error: (err) => console.error('Error updating product:', err)
          })
        );
      } else {
        this.subscriptions.push(
          this.productService.add({
            id: 0,
            name,
            price
          }).subscribe({
            next: (created) => {
              this.loadProducts();
              this.reset();
            },
            error: (err) => console.error('Error adding product:', err)
          })
        );
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  edit(p: Product) {
    this.editingId = p.id;
    this.form.patchValue({
      name: p.name,
      price: p.price
    });
  }

  delete(id: number) {
    this.subscriptions.push(
      this.productService.delete(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('Error deleting product:', err)
      })
    );
  }

  reset() {
    this.form.reset();
    this.editingId = null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadProducts() {
    this.subscriptions.push(
      this.productService.loadProducts().subscribe({
        next: (products) => this.productService.updateProductsList(products),
        error: (err) => console.error('Error loading products:', err)
      })
    );
  }
}