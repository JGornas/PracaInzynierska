import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPage } from '../landing-pages.models';
import { LandingPagesService } from '../landing-pages.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-langing-pages-edit',
  imports: [],
  templateUrl: './langing-pages-edit.html',
  styleUrl: './langing-pages-edit.scss'
})
export class LangingPagesEdit implements OnInit {
  
  isEditMode: boolean = false;
  landingPage: LandingPage = new LandingPage();

  constructor(private route: ActivatedRoute, private router: Router, private landingPagesService: LandingPagesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (this.isEditMode) {
      this.loadLandingPage(id);
    }
  }

  private async loadLandingPage(id: string | null) {
    if (!id) return;

    try {
      const landingPageId = Number(id);
      if (isNaN(landingPageId)) throw new Error('Nieprawidłowe ID strony docelowej');

      this.landingPage = await firstValueFrom(
        this.landingPagesService.getLandingPage(landingPageId)
      );

      console.log('Pobrana strona docelowa:', this.landingPage);
      // if (this.editor && this.landingPage.content) {
      //   this.editor.setDesign(this.landingPage.content);
      // }
    } catch (error) {
      console.error('Błąd pobierania strony docelowej:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie istnieje strona docelowa o podanym ID.'
      });

      await this.router.navigate(['home/landing-pages']);
    }
  }


}
