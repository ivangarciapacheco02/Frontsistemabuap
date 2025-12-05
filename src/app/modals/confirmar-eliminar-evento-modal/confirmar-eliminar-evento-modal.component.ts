import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-confirmar-eliminar-evento-modal',
  templateUrl: './confirmar-eliminar-evento-modal.component.html',
  styleUrls: ['./confirmar-eliminar-evento-modal.component.scss']
})
export class ConfirmarEliminarEventoModalComponent {
  
  constructor(
    private eventosService: EventosService,
    private dialogRef: MatDialogRef<ConfirmarEliminarEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  public cerrarModal() {
    this.dialogRef.close({isDelete: false});
  }

  public eliminarEvento() {
    this.eventosService.deleteEvento(this.data.id).subscribe(
      (response) => {
        console.log("Evento eliminado:", response);
        this.dialogRef.close({isDelete: true});
      },
      (error) => {
        console.error("Error al eliminar evento:", error);
        alert("No se pudo eliminar el evento. Por favor, intenta de nuevo.");
        this.dialogRef.close({isDelete: false});
      }
    );
  }
}