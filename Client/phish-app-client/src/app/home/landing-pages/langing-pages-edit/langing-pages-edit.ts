import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPage } from '../landing-pages.models';
import { LandingPagesService } from '../landing-pages.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { HtmlEditorComponent } from '../../../core/components/html-editor-component/html-editor-component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../../../core/components/button-component/button-component';

@Component({
  selector: 'app-langing-pages-edit',
  imports: [HtmlEditorComponent, FormsModule, CommonModule, MatFormFieldModule, MatInputModule, ButtonComponent],
  templateUrl: './langing-pages-edit.html',
  styleUrl: './langing-pages-edit.scss'
})
export class LangingPagesEdit implements OnInit, AfterViewInit {
  
  isEditMode: boolean = false;
  isVertical: boolean = false;
  landingPage: LandingPage = new LandingPage();

  htmlCode: string = '<h1>Hello World!</h1>';

  @ViewChild('previewIframe', { static: true }) iframe!: ElementRef<HTMLIFrameElement>;
  @ViewChild(HtmlEditorComponent) htmlEditor?: HtmlEditorComponent;

  constructor(private route: ActivatedRoute, private router: Router, private landingPagesService: LandingPagesService) {}

  updatePreview(html: string) {
    const el = this.iframe.nativeElement;
    const doc = el.contentDocument || el.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (this.isEditMode) {
      this.loadLandingPage(id);
    }
  }

  ngAfterViewInit(): void {
    this.updatePreview(this.htmlCode);
  }

  async save(): Promise<void> {
    const result = await Swal.fire({
      title: 'Zapisz zmiany?',
      text: 'Czy na pewno chcesz zapisać zmiany w stronie docelowej?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tak, zapisz',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      if (this.htmlCode) {
        this.landingPage.content = this.htmlCode;
      }
      const updatedLandingPage = await firstValueFrom(
        this.landingPagesService.saveLandingPage(this.landingPage)
      );
      this.landingPage = updatedLandingPage;

      await Swal.fire({
        icon: 'success',
        title: 'Zapisano',
        text: 'Strona docelowa została zapisana pomyślnie.'
      });

      await this.router.navigate(['home/landing-pages']);
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd zapisu',
        text: error?.message || 'Nie udało się zapisać strony docelowej.'
      });
    }
  }

  async cancel(): Promise<void> {
    if (!this.isEditMode) {
      await this.router.navigate(['home/landing-pages']);
      return;
    }

    const result = await Swal.fire({
      title: 'Anulować zmiany?',
      text: 'Wszystkie niezapisane zmiany zostaną utracone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, anuluj',
      cancelButtonText: 'Nie, zostań'
    });

    if (result.isConfirmed) {
      await this.router.navigate(['home/landing-pages']);
    }
  }


  onEditorChange(newHtml: string) {
    this.htmlCode = newHtml;
    this.updatePreview(newHtml);
  }

  private async loadLandingPage(id: string | null) {
    if (!id) return;

    try {
      const landingPageId = Number(id);
      if (isNaN(landingPageId)) throw new Error('Nieprawidłowe ID strony docelowej');

      this.landingPage = await firstValueFrom(
        this.landingPagesService.getLandingPage(landingPageId)
      );

      this.htmlCode = this.landingPage.content || '';

      if (this.iframe && this.iframe.nativeElement) {
        this.updatePreview(this.htmlCode);
      }
    } catch (error) {

      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie istnieje strona docelowa o podanym ID.'
      });

      await this.router.navigate(['home/landing-pages']);
    }
  }

  toggleLayout() {
    this.isVertical = !this.isVertical;

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));

      if (this.htmlEditor && typeof (this.htmlEditor as any).layout === 'function') {
        try { (this.htmlEditor as any).layout(); } catch { /* ignore */ }
      }
    }, 50);
  }


}

