import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { SetPassword } from "./set-password/set-password";

export const authRoutes: Routes = [
  { path: 'login', component: Login },
  { path: 'set-password', component: SetPassword }
];
