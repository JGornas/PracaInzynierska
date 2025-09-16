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
import { NgIf } from '@angular/common';
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

  // tryb API
  dataSource: GridElement[] = [];

  // tryb local
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
      // local mode
      this.tableDataSource = new MatTableDataSource(this.localData);
      this.resultsLength = this.localData.length;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }
  }

  ngAfterViewInit() {
    // debounce filter
    this.filterChange.pipe(debounceTime(500)).subscribe(() => {
      if (this.apiUrl) {
        this.loadRemoteData();
      } else if (this.localData) {
        this.tableDataSource.filter = this.currentFilter;
        this.paginator.firstPage();
      }
    });

    if (this.apiUrl) {
      // API mode
      merge(
        this.sort.sortChange,
        this.paginator.page,
        this.filterChange
      )
      .pipe(
        startWith({}),
        switchMap(() => this.fetchData())
      )
      .subscribe(data => this.updateTable(data));
    } else if (this.localData) {
      // local mode
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }

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

  /** Aktualizacja tabeli po fetchu */
  private updateTable(data: GridData) {
    if (!data) return;

    if (this.apiUrl) {
      // API mode -> zwykła tablica
      this.dataSource = data.items;

      if (this.paginator) {
        this.paginator.pageIndex = data.pageInfo.pageIndex ?? 0;
        this.paginator.length = data.pageInfo.totalCount ?? 0;
        this.paginator.pageSize = data.pageInfo.pageSize ?? 10;
      }

      this.resultsLength = data.pageInfo.totalCount ?? 0;
    } else {
      // local mode -> MatTableDataSource
      this.tableDataSource.data = data.items;
      this.resultsLength = data.items.length;
    }

    this.isLoadingResults = false;
    this.isError = false;
    this.cdr.detectChanges();
  }

  /** Publiczna metoda do ręcznego reloadu */
  public loadRemoteData(initialLoad = false) {
    if (initialLoad) {
      this.fetchData().subscribe(data => this.updateTable(data));
    }
  }
}
