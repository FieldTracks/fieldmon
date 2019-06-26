import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './names-dialog.html'
})
export class NamesDialogComponent implements OnInit {

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<NamesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public  data: any
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: this.data.name ? this.data.name : ''
    });
  }

  submit() {
    this.dialogRef.close(`${this.form.value.name}`);
  }

  cancle() {
    this.dialogRef.close(null);
  }
}
