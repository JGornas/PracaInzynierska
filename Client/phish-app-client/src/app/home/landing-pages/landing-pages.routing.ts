import { Routes } from "@angular/router";
import { LandingPages } from "./landing-pages";

export const landingPagesRoutes: Routes = [
  {
    path: 'landing-pages',
    children: [
      { path: '', component: LandingPages },
    ]
  }
];