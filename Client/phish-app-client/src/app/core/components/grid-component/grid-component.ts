import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf } from '@angular/common';
import { merge, of as observableOf, Subject } from 'rxjs';
import { catchError, startWith, switchMap, debounceTime } from 'rxjs/operators';
import { GridData, GridElement, GridRequest } from './grid-component.models';
import { GridService } from './grid-component.service';

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
  constructor(private gridService: GridService, private cdr: ChangeDetectorRef) {}

  @Input() localData: GridElement[] | null = null;
  @Input() apiUrl: string | null = null;
  @Input() columnsToDisplay: string[] = [];
  @Input() filterable: boolean = true;

  tableDataSource = new MatTableDataSource<GridElement>([]);
  resultsLength = 0;
  isLoadingResults = false;
  isError = false;

  currentSortColumn: string = '';
  currentSortDirection: 'asc' | 'desc' | '' = '';
  currentFilter: string = '';

  private filterChange = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['localData'] && this.localData && !this.apiUrl) {
      this.tableDataSource = new MatTableDataSource(this.localData);
      this.resultsLength = this.localData.length;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }
  }

  ngAfterViewInit() {
    // 1. Podłącz paginator i sort do datasource raz
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;

    // 2. Debounce dla filtra
    this.filterChange.pipe(debounceTime(500)).subscribe(() => {
      if (this.apiUrl) {
        // filter triggeruje fetch danych z API
        this.loadRemoteData();
      } else if (this.localData) {
        // filter dla localData
        this.tableDataSource.filter = this.currentFilter;
        this.paginator.firstPage();
      }
    });

    // 3. Jeśli jest API, merge obserwabli: sortChange, paginator.page, filterChange
    if (this.apiUrl) {
      merge(
        this.sort.sortChange,
        this.paginator.page,
        this.filterChange
      )
      .pipe(
        startWith({}), // od razu fetch przy inicjalizacji
        switchMap(() => this.fetchData())
      )
      .subscribe(data => this.updateTable(data));
    }

    // 4. Aktualizacja aktualnego sortu przy zmianie kolumny
    this.sort.sortChange.subscribe(() => {
      this.currentSortColumn = this.sort.active;
      this.currentSortDirection = this.sort.direction;
    });
  }



  /** Obsługa filtra */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.currentFilter = filterValue;
    this.filterChange.next(filterValue);

    if (!this.apiUrl && this.localData) {
      this.tableDataSource.filter = filterValue;
      this.paginator.firstPage();
    }
  }

  /** Pobieranie danych z API */
  private fetchData() {
    if (!this.apiUrl) {
      return observableOf({
        items: this.localData || [],
        pageInfo: {
          totalCount: this.localData?.length ?? 0,
          pageIndex: 0,
          pageSize: 10
        }
      } as GridData);
    }

    // Odłóż zmianę isLoadingResults do następnego cyklu
    setTimeout(() => {
      this.isLoadingResults = true;
      this.isError = false;
      this.cdr.detectChanges();
    });

    const request: GridRequest = {
      sort: this.sort.active || '',
      order: this.sort.direction || 'asc',
      pageInfo: {
        pageIndex: this.paginator?.pageIndex ?? 0,
        pageSize: this.paginator?.pageSize ?? 10,
        totalCount: 0
      },
      filter: this.currentFilter,
      selectedItemId: null
    };

    return this.gridService.loadData<GridData>(this.apiUrl, request)
      .pipe(
        catchError(() => {
          this.isLoadingResults = false;
          this.isError = true;
          return observableOf({
            items: [],
            pageInfo: { totalCount: 0, pageIndex: 0, pageSize: 10 }
          } as GridData);
        })
      );
  }


  /** Aktualizacja tabeli po otrzymaniu danych z API */
  private updateTable(data: GridData) {
    if (!this.tableDataSource) return;

    // 1. Ustaw paginację przed aktualizacją danych
    if (this.paginator) {
      this.paginator.pageIndex = data.pageInfo.pageIndex ?? 0;
      this.paginator.length = data.pageInfo.totalCount ?? 0;
      this.paginator.pageSize = data.pageInfo.pageSize ?? 10;
    }

    // 2. Zaktualizuj dane w istniejącym datasource
    this.tableDataSource.data = data.items;

    // 3. Powiadom MatTable o zmianie danych
    this.tableDataSource._updateChangeSubscription();

    // 4. Odśwież widok i loader
    this.isLoadingResults = false;
    this.isError = false;
    this.resultsLength = this.paginator?.length ?? 0;
    this.cdr.detectChanges();
  }





  /** Publiczna metoda do wywołania ręcznego reloadu */
  public loadRemoteData(initialLoad = false) {
    if (initialLoad) {
      this.fetchData().subscribe(data => this.updateTable(data));
    }
  }
}
