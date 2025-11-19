import {
  Component,
  Input,
  TemplateRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { merge, of as observableOf, Subject } from 'rxjs';
import { catchError, startWith, switchMap, debounceTime } from 'rxjs/operators';
import { GridColumn, GridData, GridElement, GridRequest } from './grid-component.models';
import { GridService } from './grid-component.service';
import { getPolishPaginatorIntl } from './paginator-intl';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getPolishPaginatorIntl() }
  ],
  templateUrl: './grid-component.html',
  styleUrl: './grid-component.scss',
})
export class GridComponent implements OnChanges, AfterViewInit {
  constructor(private gridService: GridService, private cdr: ChangeDetectorRef) {}

  @Input() localData: GridElement[] | null = null;
  @Input() apiUrl: string | null = null;
  @Input() columnsToDisplay: GridColumn[] = [];
  @Input() filterable: boolean = true;
  @Input() isSelectable: boolean = true;
  @Input() isRemovable: boolean = false;
  @Input() actionTemplate: TemplateRef<GridElement> | null = null;

  @Output() rowDoubleClicked = new EventEmitter<GridElement>();
  @Output() rowClicked = new EventEmitter<GridElement>();
  @Output() rowRemoved = new EventEmitter<GridElement>();

  dataSource: GridElement[] = [];
  tableDataSource = new MatTableDataSource<GridElement>([]);

  resultsLength = 0;
  isLoadingResults = false;
  isError = false;

  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  displayedColumns: string[] = [];

  get finalDisplayedColumns(): string[] {
    const columns = [...this.displayedColumns];
    if (this.actionTemplate) {
      columns.push('actions');
    }
    if (this.isRemovable) {
      columns.push('remove');
    }
    return columns;
  }

  currentSortColumn = '';
  currentSortDirection: 'asc' | 'desc' | '' = '';
  currentFilter = '';
  selectedGridElement: GridElement | null = null;

  private filterChange = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columnsToDisplay'] && this.columnsToDisplay) {
      this.displayedColumns = this.columnsToDisplay.map(c => c.field);
    }

    if (changes['localData'] && this.localData && !this.apiUrl) {
      this.tableDataSource = new MatTableDataSource(this.localData);
      this.resultsLength = this.localData.length;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }
  }

  ngAfterViewInit() {
    this.filterChange.pipe(debounceTime(500)).subscribe(() => {
      if (this.apiUrl) {
        this.loadRemoteData();
      } else if (this.localData) {
        this.tableDataSource.filter = this.currentFilter;
        this.paginator.firstPage();
      }
    });

    if (this.apiUrl) {
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
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
    }

    this.sort.sortChange.subscribe(() => {
      this.currentSortColumn = this.sort.active;
      this.currentSortDirection = this.sort.direction;
    });
  }

  onRowClick(element: GridElement, event: MouseEvent) {
    if (this.isClickOnRemoveColumn(event)) {
      return;
    }

    if (!this.isSelectable) {
      return;
    }
    
    this.selectedGridElement = element;
    this.rowClicked.emit(element);  // dodane - emituj pojedyncze kliknięcie
  }

  onRowDoubleClick(element: GridElement, event: MouseEvent) {
    if (this.isClickOnRemoveColumn(event)) {
      return;
    }

    if (!this.isSelectable) {
      return;
    }
    this.rowDoubleClicked.emit(element);
  }

  onRemoveClick(element: GridElement, event: MouseEvent) {
    event.stopPropagation();
    this.rowRemoved.emit(element);
  }

  private isClickOnRemoveColumn(event: MouseEvent): boolean {
    return !!(event.target as HTMLElement).closest('.mat-column-remove');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.currentFilter = filterValue;
    this.filterChange.next(filterValue);

    if (!this.apiUrl && this.localData) {
      this.tableDataSource.filter = filterValue;
      this.paginator.firstPage();
    }
  }

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

    return this.gridService.loadData<GridData>(this.apiUrl, request).pipe(
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

  private updateTable(data: GridData) {
    if (!data) {
      return;
    }

    if (this.apiUrl) {
      this.dataSource = data.items;

      if (this.paginator) {
        this.paginator.pageIndex = data.pageInfo.pageIndex ?? 0;
        this.paginator.length = data.pageInfo.totalCount ?? 0;
        this.paginator.pageSize = data.pageInfo.pageSize ?? 10;
      }

      this.resultsLength = data.pageInfo.totalCount ?? 0;
    } else {
      this.tableDataSource.data = data.items;
      this.resultsLength = data.items.length;
    }

    this.isLoadingResults = false;
    this.isError = false;
    this.cdr.detectChanges();
  }

  public loadRemoteData(initialLoad = false) {
    if (initialLoad) {
      this.fetchData().subscribe(data => this.updateTable(data));
    }
  }
}
