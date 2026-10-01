import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guard/auth-guard';

export const routes: Routes = [
    {path : "" , loadComponent : () => import('../app/features/homepage/homepage').then(c => c.Homepage)},
    {path : "login" , loadComponent : () => import('./core/auth/pages/login/login').then(c => c.Login)},
    {path : "register" , loadComponent : () => import('./core//auth/pages/register/register').then(c => c.Register)},
    {
        path : "product" , 
        loadComponent : () => import('./features/product/product-routing/product-routing').then(c => c.ProductRouting),
        canActivate : [authGuard],
        canActivateChild : [authGuard],
        children : [
            {path : '' , loadComponent : () => import('./features/product/product-list/product-list').then(c => c.ProductList)},
            {path : 'details/:id' , loadComponent : () => import('./features/product/product-details/product-details').then(c => c.ProductDetails)},
            {path : 'add' , loadComponent : () => import('./features/product/product-add/product-add').then(c => c.ProductAdd)},
            {path : 'update/:id' , loadComponent : () => import('./features/product/product-update/product-update').then(c => c.ProductUpdate)},
        ]
    },
    {path : "**" , redirectTo : '' , pathMatch : 'full'},
];
