import { Routes } from "@angular/router";
import { Home } from "./home";
import { Dashboard } from "./dashboard/dashboard";
import { Campaigns } from "./campaigns/campaigns";
import { Recipients } from "./recipients";
import { Templates } from "./templates/templates";
import { templatesRoutes } from "./templates/templates.routing";

export const homeRoutes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'campaigns', component: Campaigns },
      { path: 'recipients', component: Recipients },
      ...templatesRoutes,
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
