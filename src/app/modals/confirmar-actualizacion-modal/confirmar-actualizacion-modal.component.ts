import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-actualizacion-modal',
  templateUrl: './confirmar-actualizacion-modal.component.html',
  styleUrls: ['./confirmar-actualizacion-modal.component.scss']
})
export class ConfirmarActualizacionModalComponent {
  
  constructor(
    private dialogRef: MatDialogRef<ConfirmarActualizacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public cerrarModal() {
    this.dialogRef.close({confirmado: false});
  }

  public confirmar() {
    this.dialogRef.close({confirmado: true});
  }
}