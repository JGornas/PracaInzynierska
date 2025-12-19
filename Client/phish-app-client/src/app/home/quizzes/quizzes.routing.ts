import { Routes } from "@angular/router";
import { Quizzes } from "./quizzes";
import { QuizzesEdit } from "./quizzes-edit/quizzes-edit";
import { QuizzesSend } from "./quizzes-send/quizzes-send";
import { QuizzesSendRecipientGroups } from "./quizzes-send/quizzes-send-recipient-groups/quizzes-send-recipient-groups";

export const quizesRoutes: Routes = [
  {
    path: 'quizzes',
    children: [
      { path: '', component: Quizzes },
    { path: 'create', component: QuizzesEdit },
    { path: ':id/edit', component: QuizzesEdit },
    { path: 'send', component: QuizzesSend },
    { path: 'send/addReciepientGroup', component: QuizzesSendRecipientGroups },
    ]
  }
];