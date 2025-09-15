export interface GridElement {
  [key: string]: any;
}

export interface GridData {
  items: GridElement[];   
  pageInfo: GridPageInfo;      
}

export interface GridPageInfo{

  totalCount: number;  
  pageIndex?: number;      
  pageSize?: number; 
}


export interface GridRequest {
  sort: string;           
    order: 'asc' | 'desc';
    pageInfo: GridPageInfo;
    filter: string;         
    selectedItemId: number | null; 
}
