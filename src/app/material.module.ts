/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule, MatTableModule, MatToolbarModule} from '@angular/material';
import { MatCardModule, MatInputModule, MatSidenavModule} from '@angular/material';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatGridListModule} from '@angular/material/grid-list';
import {FlexLayoutModule} from '@angular/flex-layout';
import { MatIconModule, MatListModule} from '@angular/material';

@NgModule({
  imports: [MatTableModule,
            CommonModule,
            MatToolbarModule,
            MatButtonModule,
            MatCardModule,
            MatInputModule,
            MatProgressSpinnerModule,
            MatGridListModule,
            FlexLayoutModule,
            MatSidenavModule, MatIconModule, MatListModule],
  exports: [MatTableModule,
            CommonModule,
            MatToolbarModule,
            MatButtonModule,
            MatCardModule,
            MatInputModule,
            MatProgressSpinnerModule,
            MatGridListModule,
            FlexLayoutModule,
            MatSidenavModule, MatIconModule, MatListModule],
  declarations: []
})
export class MaterialModule { }
