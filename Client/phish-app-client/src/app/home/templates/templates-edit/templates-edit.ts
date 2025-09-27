import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateEditorComponent } from '../../../core/components/template-editor-component/template-editor-component';
import { ButtonComponent } from '../../../core/components/button-component/button-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Template } from '../templates.models';
import Swal from 'sweetalert2';
import { TemplatesService } from '../templates.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-templates-edit',
  standalone: true,
  imports: [TemplateEditorComponent, ButtonComponent, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './templates-edit.html',
  styleUrls: ['./templates-edit.scss']
})
export class TemplatesEdit implements OnInit {

  isEditMode: boolean = false;
  template: Template = new Template(); 

  @ViewChild(TemplateEditorComponent) editor!: TemplateEditorComponent;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private templateService: TemplatesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    if (this.isEditMode) {
      this.loadTemplate(id);
    }
  }

  async save(): Promise<void> {
    const result = await Swal.fire({
      title: 'Zapisz zmiany?',
      text: 'Czy na pewno chcesz zapisać zmiany w szablonie?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tak, zapisz',
      cancelButtonText: 'Nie, anuluj'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      if (this.editor) {
        const content = await this.editor.getContent();
        this.template.content = content.html;
        this.template.designObject = content.design;
      }

      const updatedTemplate = await firstValueFrom(this.templateService.saveTemplate(this.template));
      this.template = updatedTemplate;

      await Swal.fire({
        icon: 'success',
        title: 'Zapisano',
        text: 'Szablon został zapisany pomyślnie.'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Błąd zapisu',
        text: error?.message || 'Nie udało się zapisać szablonu.'
      });
    }
  }

  async cancel(): Promise<void> {
    if (!this.isEditMode) {
      await this.router.navigate(['home/templates']);
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
      await this.router.navigate(['home/templates']);
    }
  }

  private async loadTemplate(id: string | null) {
    if (!id) return;

    try {
      const templateId = Number(id);
      if (isNaN(templateId)) throw new Error('Nieprawidłowe ID szablonu');

      this.template = await firstValueFrom(this.templateService.getTemplate(templateId));

      if (this.editor && this.template.designObject) {
        this.editor.setDesign(this.template.designObject);
      }
    } catch (error) {
      console.error('Błąd pobierania szablonu:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie istnieje szablon o podanym ID.'
      });

      await this.router.navigate(['home/templates']);
    }
  }
}
