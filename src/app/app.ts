import { Component, ElementRef, HostListener, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScIconButton } from './components/sc-icon-button/sc-icon-button';
import {
  iconoirArrowLeftCircle,
  iconoirArrowUpCircle,
  iconoirEditPencil,
  iconoirEye,
  iconoirInfoCircle,
  iconoirMinus,
  iconoirPause,
  iconoirPlay,
  iconoirPlusCircle,
  iconoirSortDown,
  iconoirSortUp,
} from '@ng-icons/iconoir';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-root',
  imports: [NgIcon, RouterOutlet, ScIconButton],
  providers: [
    provideIcons({
      iconoirArrowLeftCircle,
      iconoirArrowUpCircle,
      iconoirEditPencil,
      iconoirEye,
      iconoirInfoCircle,
      iconoirMinus,
      iconoirPause,
      iconoirPlay,
      iconoirPlusCircle,
      iconoirSortDown,
      iconoirSortUp,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected footer = viewChild<ElementRef>('footer');

  // signal that tracks whether the header is currently sticky
  protected isHeaderSticky = signal(false);

  @HostListener('window:scroll', [])
  onScroll = () => {
    const stuck = window.scrollY >= 64;
    this.isHeaderSticky.set(stuck);
  };

  constructor() {
    // run an initial check and attach a scroll listener
    setTimeout(() => this.onScroll(), 0);
  }

  protected scrollToFooter() {
    this.footer()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  protected scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
