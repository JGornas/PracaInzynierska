import { AfterViewInit, Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

declare var unlayer: any;

@Component({
  selector: 'app-template-editor-component',
  standalone: true,
  templateUrl: './template-editor-component.html',
  styleUrls: ['./template-editor-component.scss']
})
export class TemplateEditorComponent implements AfterViewInit {

  @Input() htmlContent: string | null = null;
  @Output() contentChange = new EventEmitter<string>();

  private editorInitialized = false;

  ngAfterViewInit() {
    if (typeof unlayer !== 'undefined') {
      unlayer.init({
        id: 'editor',
        displayMode: 'email',
        projectId: 0
      });

      this.editorInitialized = true;

      this.loadHtmlContent();

      unlayer.addEventListener('design:updated', () => {
        unlayer.exportHtml((data: any) => {
          this.contentChange.emit(data.html);
        });
      });
    } else {
      console.error('Unlayer script not loaded!');
    }
  }

  private loadHtmlContent() {
    if (this.editorInitialized && this.htmlContent) {
      unlayer.loadDesign({ body: { rows: [] }, schemaVersion: 1 });
      unlayer.loadHtml(this.htmlContent);
    }
  }
}
