import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute, private router: Router, private templateService: TemplatesService) {}

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
      return; // użytkownik anulował zapis
    }

    try {
      // Wywołanie metody REST, przesyłamy aktualny template
      const updatedTemplate = await firstValueFrom(this.templateService.saveTemplate(this.template));
      
      // Jeśli się udało, aktualizujemy lokalny obiekt template
      this.template = updatedTemplate;

      await Swal.fire({
        icon: 'success',
        title: 'Zapisano',
        text: 'Szablon został zapisany pomyślnie.'
      });
    } catch (error: any) {
      // Jeśli wystąpił błąd podczas zapisu
      await Swal.fire({
        icon: 'error',
        title: 'Błąd zapisu',
        text: error?.message || 'Nie udało się zapisać szablonu.'
      });

      // Następnie wykonujemy cancel, aby wrócić do listy szablonów
      // await this.cancel();
    }
  }


  async cancel(): Promise<void> {
    const result = await Swal.fire({
      title: 'Anulować zmiany?',
      text: 'Wszystkie niezapisane zmiany zostaną utracone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak, anuluj',
      cancelButtonText: 'Nie, zostań'
    });

    if (result.isConfirmed) {
      // Przejście bezwzględne do listy szablonów
      await this.router.navigate(['home/templates']);
    }
  }


  onTemplateChange(event: string){
    console.log('template change')
    this.template.content = event;
  }

  private async loadTemplate(id: string | null) {
    if (!id) return;

    console.log('Pobieram szablon o id:', id);

    try {
      const templateId = Number(id);
      if (isNaN(templateId)) throw new Error('Nieprawidłowe ID szablonu');

      // Pobranie szablonu z serwisu
      this.template = await firstValueFrom(this.templateService.getTemplate(templateId));

    } catch (error) {
      console.error('Błąd pobierania szablonu:', error);

      // Wyświetlenie komunikatu o błędzie
      await Swal.fire({
        icon: 'error',
        title: 'Błąd',
        text: 'Nie istnieje szablon o podanym ID.'
      });

      // Przekierowanie do listy szablonów
      await this.router.navigate(['home/templates']);
    }
  }

}
