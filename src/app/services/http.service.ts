import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { DummyProducts } from '../types/dummyProducts.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../components/productList/productsList.component';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  #destroyRef = inject(DestroyRef);
  private productsList: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  http = inject(HttpClient);


  getProductsList(): Observable<Product[]> {
    if (this.productsList.length > 0) {
      return this.productsSubject.asObservable();
    }

    return this.http.get<any>('https://dummyjson.com/products').pipe(
      takeUntilDestroyed(this.#destroyRef),
      map((res) => {
        return res.products
      }),
      map((products: DummyProducts[]) => {
        const mappedProducts = products.map((item) => ({
            id: item.id,
            name: item.title,
            description: item.description,
            price: item.price,
            creationDate: new Date(item.meta.createdAt),
            image: item.thumbnail ? item.thumbnail : ''
          })
        );
        this.productsList = mappedProducts;
        this.productsSubject.next(this.productsList);
        return mappedProducts;
      })
    );
  }

  addProduct(product: Product): void {
    this.productsList.unshift(product); // Add to the beginning of the array
    this.productsSubject.next([...this.productsList]); // Emit updated list
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<DummyProducts>(`https://dummyjson.com/products/${productId}`).pipe(
      map((res) => {
        return {
          id: res.id,
          name: res.title,
          description: res.description,
          price: res.price,
          creationDate: new Date(res.meta.createdAt),
          image: res.thumbnail ? res.thumbnail : ''
        }
      })
    );
  }

  deleteProduct(productId: number): void {
    this.productsList = this.productsList.filter(product => product.id !== productId);
    this.productsSubject.next([...this.productsList]);
  }
}
