import {Injectable, ɵinitServicesIfNeeded} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest} from '@angular/common/http';
import {environment} from '../environments/environment';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {catchError, last, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebdavService {

  progress = new Subject();

  constructor(private httpClient: HttpClient) { }

  put(filename: string, data: any): Observable<any> {
    const fn = filename;
    const webDavUrl = `https://${environment.mqtt_broker}/webdav/${Date.now()}-${fn}`;

   const req = new HttpRequest('PUT', webDavUrl, data, {
     reportProgress: true
    });
    return this.httpClient.request(req).pipe(
      tap( (event) => {
        if (HttpEventType.UploadProgress === event.type) {
          this.progress.next(Math.round(100 * event.loaded / event.total));
        }
      }),
      map( (event) => {
        if (HttpEventType.Response === event.type ) {
          return {
            type: HttpEventType.Response,
            webDavUrl: webDavUrl
          };
        }})
    );

  }

  getAsObjectUrl(filename: string): Observable<string> {
    return this.httpClient.get(filename, {responseType: 'blob'})
      .pipe(map(e => URL.createObjectURL(e)));
  }
}

