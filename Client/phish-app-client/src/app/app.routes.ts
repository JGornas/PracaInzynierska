import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { SetPassword } from './auth/set-password/set-password';
import { authRoutes } from './auth/auth.routes';
import { homeRoutes } from './home/home.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', children: authRoutes },
  { path: 'home', children: homeRoutes },
  { path: '**', redirectTo: 'auth/login' }
];
