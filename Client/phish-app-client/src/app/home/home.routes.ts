import { Routes } from "@angular/router";
import { Home } from "./home";
import { Dashboard } from "./dashboard/dashboard";
import { Campaigns } from "./campaigns/campaigns";

export const homeRoutes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // domyślne wejście = dashboard
      { path: 'dashboard', component: Dashboard },
      { path: 'campaigns', component: Campaigns },
      { path: '**', redirectTo: 'dashboard' } // zły routing -> dashboard
    ]
  }
];
