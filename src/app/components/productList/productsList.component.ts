import { Component, inject, OnInit } from '@angular/core';
import {  Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';

export interface Product {
  name: string;
  id: number;
  description?: string;
  price: number;
  creationDate: Date;
  image?: string;
}

@Component({
  selector: 'store-product-list',
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './productsList.component.html',
  styleUrl: './productsList.component.scss'
})
export class ProductsListComponent implements OnInit {
  #service = inject(HttpService);
  private searchSubject = new BehaviorSubject<string>('');
  private sortSubject = new BehaviorSubject<string>('');
  productsList: Observable<Product[]> = of([]);
  filteredProductsList: Observable<Product[]> = of([]);
  router = inject(Router);
  selectedItem: number = 0;
  searchTerm: string = '';
  sortBy: string = '';
  showDeleteModal: boolean = false;
  productToDelete: number | null = null;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedProducts: Observable<Product[]> = of([]);

  ngOnInit(): void {
    this.#service.getProductsList().subscribe();

    this.productsList = this.#service.getProducts();

    this.filteredProductsList = combineLatest([
      this.#service.getProducts(),
      this.searchSubject.asObservable(),
      this.sortSubject.asObservable()
    ]).pipe(
      map(([products, searchTerm, sortBy]) => {
        let filteredProducts = products;

        if (searchTerm.trim()) {
          filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        if (sortBy) {
          filteredProducts = [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
              case 'name':
                return a.name.localeCompare(b.name);
              case 'dateCreated':
                return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
              default:
                return 0;
            }
          });
        }

        // Update pagination info
        this.totalItems = filteredProducts.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

        // Reset to first page if current page exceeds available pages
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
        }

        return filteredProducts;
      })
    );

    // Create paginated products observable
    this.paginatedProducts = this.filteredProductsList.pipe(
      map(products => {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return products.slice(startIndex, endIndex);
      })
    );
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
    this.currentPage = 1; // Reset to first page when searching
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
    this.currentPage = 1; // Reset to first page when clearing search
  }

  onSortChange(): void {
    this.sortSubject.next(this.sortBy);
    this.currentPage = 1; // Reset to first page when sorting
  }

  showDetails(productId: number) {
    this.selectedItem = productId;
    this.router.navigateByUrl('products/' + productId);
  }

  addProduct() {
    this.router.navigateByUrl('products/addProduct')
  }

  deleteProduct(productId: number): void {
    this.productToDelete = productId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.productToDelete !== null) {
      this.#service.deleteProduct(this.productToDelete);

      if (this.selectedItem === this.productToDelete) {
        this.selectedItem = 0;
        this.router.navigateByUrl('products');
      }
    }
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  private updatePaginatedProducts(): void {
    this.paginatedProducts = this.filteredProductsList.pipe(
      map(products => {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return products.slice(startIndex, endIndex);
      })
    );
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndItemNumber(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
