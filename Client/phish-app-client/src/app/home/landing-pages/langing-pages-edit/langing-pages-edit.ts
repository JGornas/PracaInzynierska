import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPage } from '../landing-pages.models';
import { LandingPagesService } from '../landing-pages.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { HtmlEditorComponent } from '../../../core/components/html-editor-component/html-editor-component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-langing-pages-edit',
  imports: [HtmlEditorComponent, FormsModule],
  templateUrl: './langing-pages-edit.html',
  styleUrl: './langing-pages-edit.scss'
})
export class LangingPagesEdit implements OnInit, AfterViewInit {
  
  isEditMode: boolean = false;
  landingPage: LandingPage = new LandingPage();

  htmlCode: string = '<h1>Hello World!</h1>';

  @ViewChild('previewIframe', { static: true }) iframe!: ElementRef<HTMLIFrameElement>;

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
    // ustaw początkowy podgląd (jeśli masz już htmlCode)
    this.updatePreview(this.htmlCode);
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
