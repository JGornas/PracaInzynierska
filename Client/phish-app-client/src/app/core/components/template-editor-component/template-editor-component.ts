import { AfterViewInit, Component, Input } from '@angular/core';

declare var unlayer: any;

@Component({
  selector: 'app-template-editor-component',
  standalone: true,
  templateUrl: './template-editor-component.html',
  styleUrls: ['./template-editor-component.scss']
})
export class TemplateEditorComponent implements AfterViewInit {

  @Input() htmlContent: string | null = null;

  ngAfterViewInit() {
    setTimeout(() => {
      if (typeof unlayer !== 'undefined') {
        unlayer.init({
          id: 'editor',
          displayMode: 'email',
          projectId: 0
        });

        if (this.htmlContent) {
          // jeśli dostajesz gotowy HTML z backendu
          unlayer.loadDesign({
            body: { rows: [] },
            schemaVersion: 1
          });

          // 🔑 metoda do załadowania czystego HTML
          unlayer.loadHtml(this.htmlContent);
        } else {
          // pusty start
          unlayer.loadDesign({
            body: { rows: [] },
            options: { hideComments: true, hideImages: false },
            schemaVersion: 1
          });
        }

      } else {
        console.error('Unlayer script not loaded!');
      }
    }, 200);
  }
  // saveDesign() {
  //   unlayer.exportHtml((data: any) => {
  //     console.log('HTML:', data.html);
  //     console.log('JSON (design):', data.design);
  //   });
  // }
}
