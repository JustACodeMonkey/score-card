import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'score-cards', pathMatch: 'full' },
  {
    path: 'score-cards',
    loadComponent: () =>
      import('./score-card/score-card-editor.component').then((m) => m.ScoreCardEditor),
  },
  {
    path: 'score-cards/:id/play',
    loadComponent: () =>
      import('./score-card/score-card-play.component').then((m) => m.ScoreCardPlay),
  },
];
