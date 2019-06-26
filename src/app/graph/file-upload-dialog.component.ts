import {Component, Inject, Injectable, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {catchError, map, mergeMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {WebdavService} from '../webdav.service';
import {HttpEventType} from '@angular/common/http';

@Component({
  selector: 'app-file-upload-snack',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent implements OnInit, OnDestroy {

  form: FormGroup;
  error: Error;
  uploadResponse = {status: '', message: '', filePath: ''};

  file: any;
  imgURL: string | ArrayBuffer;
  progress = this.webdavService.progress;
  uploading = false;


  private httpSubscription: Subscription;
  private ngUnsubscribe = new Subject<any>();

  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<FileUploadDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public  data: any
    , private webdavService: WebdavService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      avatar: ['']
    });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

  canUpload(): boolean {
    return this.file && !this.uploading;
  }

  canSelect(): boolean {
    return !this.uploading;
  }

  upload() {
    this.error = null;
    const data = this.file;
    const fileName = this.file.name;
    this.httpSubscription = this.webdavService.put(fileName, data)
      .pipe( takeUntil(this.ngUnsubscribe))
      .subscribe( (next) => {
        if (next && HttpEventType.Response === next.type)  {
          this.dialogRef.close(next.webDavUrl);
        }
      }, (error) => {this.error = error; });
  }

  cancel() {
  //  this.dialogRef = null;
    if (this.httpSubscription) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  ngOnDestroy(): void {
    if (this.httpSubscription) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }
}




/*
@Injectable()
export class ProgressInterceptor implements HttpInterceptor {
  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    console.log('Intercepted Request');
    const token = `${sessionStorage.getItem('username')}:${sessionStorage.getItem('password')}`;
    request = request.clone({
      setHeaders: {
        Authorization: `Basic ${btoa(token)}`
      }
    });
    return next.handle(request).pipe(
      map((ev: HttpEvent<any>) => {
        if (ev.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * ev.loaded) / ev.total);
          console.log(`File is ${percentDone}% uploaded.`);
        }
        return ev;
      }));
  }
}
*/
