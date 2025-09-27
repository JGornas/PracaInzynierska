import { Routes } from "@angular/router";
import { LandingPages } from "./landing-pages";
import { LangingPagesEdit } from "./langing-pages-edit/langing-pages-edit";

export const landingPagesRoutes: Routes = [
  {
    path: 'landing-pages',
    children: [
      { path: '', component: LandingPages },
      { path: 'create', component: LangingPagesEdit },
      { path: ':id/edit', component: LangingPagesEdit },
    ]
  }
];