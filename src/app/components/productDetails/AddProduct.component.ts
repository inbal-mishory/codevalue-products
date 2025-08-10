import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpService } from "../../services/http.service";

@Component({
  selector: 'store-product-add',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Add Product</h2>
    <form (ngSubmit)="addToList()" class="product-container">
      <label for="productName">Name *</label>
      <input type="text" id="productName" [(ngModel)]="productName" name="productName" required>

      <label for="productDescription">Description</label>
      <textarea id="productDescription" [(ngModel)]="productDescription" name="productDescription" rows="3"></textarea>

      <label for="price">Price *</label>
      <span><input type="number" id="price" [(ngModel)]="price" name="price" min="0" step="0.01" required> $</span>

      <div class="save">
        <button type="submit" [disabled]="!productName || !price || price <= 0">Save</button>
        <button type="button" (click)="cancel()">Cancel</button>
      </div>
    </form>
  `,
  styleUrl: './productDetails.component.scss'
})
export class AddProductComponent {
  private router = inject(Router);
  private httpService = inject(HttpService);

  productName: string = '';
  productDescription: string = '';
  price: number = 0;

  addToList() {
    if (this.productName && this.price > 0) {
      const newProduct = {
        name: this.productName,
        description: this.productDescription,
        price: this.price,
        id: (Math.random() * 10),
        creationDate: new Date(),
        image: ''
      };

      this.httpService.addProduct(newProduct);
      this.router.navigateByUrl('/products');
    }
  }

  cancel() {
    this.router.navigateByUrl('/products');
  }
}
