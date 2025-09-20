import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TemplateEditorComponent } from '../../../core/components/template-editor-component/template-editor-component';
import { ButtonComponent } from '../../../core/components/button-component/button-component';

@Component({
  selector: 'app-templates-edit',
  imports: [TemplateEditorComponent, ButtonComponent],
  templateUrl: './templates-edit.html',
  styleUrls: ['./templates-edit.scss']
})
export class TemplatesEdit implements OnInit {

  isEditMode: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (this.isEditMode) {
      this.loadTemplate(id);
    }
    else{
      //ustawiam this.Template na pusty obiekt
    }
  }

  private loadTemplate(id: string | null) {
    if (!id) return;
    console.log('Pobieram szablon o id:', id);
  }
}
