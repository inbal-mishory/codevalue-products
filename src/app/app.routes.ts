import { Routes } from '@angular/router';
import { ProductsListComponent } from './components/productList/productsList.component';
import { ProductDetailsComponent } from './components/productDetails/productDetails.component';
import { AddProductComponent } from './components/productDetails/AddProduct.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    component: ProductsListComponent,
    children: [
      {
        path: 'addProduct',
        component: AddProductComponent
      },
      {
        path: ':productId',
        component: ProductDetailsComponent
      },
    ]
  }
];
