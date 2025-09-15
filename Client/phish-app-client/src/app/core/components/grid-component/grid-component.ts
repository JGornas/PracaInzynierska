import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

export interface GridElement {
  [key: string]: any;
}

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [
    NgIf,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './grid-component.html',
  styleUrl: './grid-component.scss',
})
export class GridComponent implements OnChanges, AfterViewInit {
  constructor(private http: HttpClient) {}

  @Input() localData: GridElement[] | null = null;
  @Input() apiUrl: string | null = null;
  @Input() columnsToDisplay: string[] = [];

  tableDataSource = new MatTableDataSource<GridElement>([]);
  resultsLength = 0;
  isLoadingResults = false;
  isError = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['localData'] && this.localData && !this.apiUrl) {
      this.tableDataSource = new MatTableDataSource(this.localData);
      this.resultsLength = this.localData.length;
    }
  }

  ngAfterViewInit() {
    if (this.localData && !this.apiUrl) {
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }

    if (this.apiUrl) {
      this.loadRemoteData();
    }
  }

  /** Obsługa filtra (tylko localData) */
  applyFilter(event: Event) {
    if (!this.localData) return;
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Pobieranie danych z API */
  loadRemoteData() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.isError = false;
          return this.http.get<GridElement[]>(this.apiUrl!).pipe(
            catchError(() => {
              this.isError = true;
              return observableOf([]);
            })
          );
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.resultsLength = Array.isArray(data) ? data.length : 0;
          return Array.isArray(data) ? data : [];
        })
      )
      .subscribe((data) => {
        this.tableDataSource = new MatTableDataSource(data);
      });
  }
}
