import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./score-card/score-card-editor.component').then((m) => m.ScoreCardEditor),
  },
  {
    path: 'games/:id',
    loadComponent: () =>
      import('./score-card/score-card-play.component').then((m) => m.ScoreCardPlay),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
