import { AfterViewInit, Component } from '@angular/core';
import { TemplateEditorChange } from './template-editor-component.models';

declare var unlayer: any;

@Component({
  selector: 'app-template-editor-component',
  standalone: true,
  templateUrl: './template-editor-component.html',
  styleUrls: ['./template-editor-component.scss']
})
export class TemplateEditorComponent implements AfterViewInit {

  private editorInitialized = false;

  ngAfterViewInit() {
    if (typeof unlayer !== 'undefined') {
      unlayer.init({
        id: 'editor',
        displayMode: 'email',
        projectId: 0
      });

      this.editorInitialized = true;
    }
  }

  public getContent(): Promise<TemplateEditorChange> {
    return new Promise((resolve, reject) => {
      if (!this.editorInitialized) {
        reject(new Error('Editor not initialized'));
        return;
      }

      unlayer.exportHtml((data: any) => {
        resolve({
          html: data.html,
          design: data.design
        });
      });
    });
  }

  public setDesign(design: any) {
    if (!this.editorInitialized) {
      return;
    }

    if (design) {
      unlayer.loadDesign(design);
    } else {
      unlayer.loadDesign({ body: { rows: [] }, schemaVersion: 1 });
    }
  }
}
