import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-html-editor-component',
  imports: [NuMonacoEditorModule, FormsModule],
  templateUrl: './html-editor-component.html',
  styleUrl: './html-editor-component.scss'
})
export class HtmlEditorComponent {
  @Input() htmlCode: string = '';
  @Output() htmlCodeChange = new EventEmitter<string>();

  onCodeChange(value: string) {
    this.htmlCode = value;
    this.htmlCodeChange.emit(value);
  }
}
