/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

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
            MatSidenavModule,
            MatIconModule,
            MatListModule,
            MatTabsModule,
            MatPaginatorModule,
            MatSortModule,
            MatDialogModule,
            MatButtonToggleModule,
            MatTooltipModule,
            MatMenuModule,
            MatBottomSheetModule,
//            MatFileUploadModule,
            MatSnackBarModule,
            MatCheckboxModule,
            MatProgressBarModule,
            MatExpansionModule],
  exports: [MatTableModule,
            CommonModule,
            MatToolbarModule,
            MatButtonModule,
            MatCardModule,
            MatInputModule,
            MatProgressSpinnerModule,
            MatGridListModule,
            FlexLayoutModule,
            MatSidenavModule,
            MatIconModule,
            MatListModule,
            MatTabsModule,
            MatPaginatorModule,
            MatSortModule,
            MatDialogModule,
            MatButtonToggleModule,
            MatTooltipModule,
            MatMenuModule,
            MatBottomSheetModule,
            MatExpansionModule,
//            MatFileUploadModule,
    MatCheckboxModule,

    MatSnackBarModule,
            MatProgressBarModule],
  declarations: []
})
export class MaterialModule { }
