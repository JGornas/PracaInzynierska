import { Routes } from "@angular/router";
import { Quizzes } from "./quizzes";
import { QuizzesEdit } from "./quizzes-edit/quizzes-edit";

export const quizesRoutes: Routes = [
  {
    path: 'quizzes',
    children: [
      { path: '', component: Quizzes },
    { path: 'create', component: QuizzesEdit },
    { path: ':id/edit', component: QuizzesEdit },
    ]
  }
];