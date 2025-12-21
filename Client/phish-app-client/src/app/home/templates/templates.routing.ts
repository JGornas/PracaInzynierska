import { Routes } from "@angular/router";
import { Templates } from "./templates";
import { TemplatesEdit } from "./templates-edit/templates-edit";

export const templatesRoutes: Routes = [
  {
    path: 'templates',
    children: [
      { path: '', component: Templates },
      { path: 'create', component: TemplatesEdit},
      { path: ':id/edit', component: TemplatesEdit },
    ]
  }
];
