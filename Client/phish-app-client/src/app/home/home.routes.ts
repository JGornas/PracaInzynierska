import { Routes } from "@angular/router";
import { Home } from "./home";
import { Dashboard } from "./dashboard/dashboard";
import { Campaigns } from "./campaigns/campaigns";
import { Recipients } from "./recipients/recipients";
import { Templates } from "./templates/templates";

export const homeRoutes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // domyślne wejście = dashboard
      { path: 'dashboard', component: Dashboard },
      { path: 'campaigns', component: Campaigns },
      { path: 'recipients', component: Recipients },
      { path: 'templates', component: Templates },
      { path: '**', redirectTo: 'dashboard' } // zły routing -> dashboard
    ]
  }
];
