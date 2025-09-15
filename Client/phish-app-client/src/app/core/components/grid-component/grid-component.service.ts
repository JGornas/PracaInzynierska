import { Injectable } from "@angular/core";
import { RestService } from "../../services/rest.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class GridService {
  constructor(private rest: RestService) {}

  public loadData<T>(route: string, params: any): Observable<T> {
    return this.rest.post<T>(route, params);
  }
}