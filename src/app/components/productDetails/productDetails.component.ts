import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Product } from '../productList/productsList.component';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'store-product-details',
  imports: [],
  templateUrl: './productDetails.component.html',
  styleUrl: './productDetails.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  #service = inject(HttpService);
  #route = inject(ActivatedRoute);
  #destroyRef = inject(DestroyRef);
  #cdr = inject(ChangeDetectorRef);
  productDetails: Product = {name: '', description: '', image: '', id: -1, price: 0, creationDate: new Date()};
  productLoaded: boolean = false;
  productName: string = '';
  productDescription: string = '';
  price: number = 0;

  ngOnInit(): void {
    this.#route.paramMap.pipe(
      takeUntilDestroyed(this.#destroyRef),
      tap(params => {
        const productId = +params.get('productId')!;
        if (productId && productId > 0) {
          this.productLoaded = false;
          this.#cdr.markForCheck();
        }
      }),
      switchMap(params => {
        const productId = +params.get('productId')!;
        if (productId && productId > 0) {
          return this.#service.getProductById(productId);
        }
        throw new Error('Invalid product ID');
      })
    ).subscribe({
      next: (res) => {
        this.productDetails = res;
        this.productLoaded = true;
        this.#cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.productLoaded = false;
        this.#cdr.markForCheck();
      }
    });
  }
}
