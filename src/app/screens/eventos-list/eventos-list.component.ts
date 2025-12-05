import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { ConfirmarEliminarEventoModalComponent } from 'src/app/modals/confirmar-eliminar-evento-modal/confirmar-eliminar-evento-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-eventos-list',
  templateUrl: './eventos-list.component.html',
  styleUrls: ['./eventos-list.component.scss']
})
export class EventosListComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public lista_eventos: any[] = [];

  displayedColumns: string[] = ['nombre_evento', 'tipo_evento', 'fecha_realizacion', 'horario', 'lugar', 'publico_objetivo', 'programa', 'responsable', 'cupo_maximo', 'acciones'];

  dataSource = new MatTableDataSource<DatosEvento>([]);

  private _paginator: MatPaginator;
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    if (this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  private _sort: MatSort;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this._sort = sort;
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    // Filtro por nombre de evento
    this.dataSource.filterPredicate = (data: DatosEvento, filter: string) => {
      const nombreEvento = (data.nombre_evento || '').toLowerCase();
      return nombreEvento.includes(filter);
    };

    // Ordenamiento personalizado
    this.dataSource.sortingDataAccessor = (data: DatosEvento, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'nombre_evento': return data.nombre_evento;
        case 'tipo_evento': return data.tipo_evento;
        case 'fecha_realizacion': return data.fecha_realizacion;
        default: return (data as any)[sortHeaderId];
      }
    };
  }

  constructor(
    public facadeService: FacadeService,
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Validar que haya inicio de sesión
    const token = this.facadeService.getSessionToken();
    if (!token || token.trim() === '') {
      this.router.navigate(['/login']);
      return;
    }

    // Llamar a la función de obtener eventos
    this.obtenerEventos();
  }

  // Función para obtener eventos
  public obtenerEventos() {
    this.eventosService.getEventos().subscribe(
      (response) => {
        let eventos = Array.isArray(response) ? response : [];
        console.log("Lista eventos original: ", eventos);

        // Si el usuario es alumno, filtrar solo eventos para estudiantes y público general
        if (this.rol === 'alumno') {
          eventos = eventos.filter(evento => {
            const publico = (evento.publico_objetivo || '').toLowerCase();
            return publico.includes('estudiante') || publico.includes('público general');
          });
          console.log("Lista eventos filtrada para alumno: ", eventos);
        }

        this.lista_eventos = eventos;
        console.log("Lista eventos final: ", this.lista_eventos);

        if (this.lista_eventos.length > 0) {
          // Formatear datos para la tabla
          this.lista_eventos = this.lista_eventos.map(evento => {
            // Formatear horario
            evento.horario_display = '';
            if (evento.hora_inicio && evento.hora_fin) {
              evento.horario_display = `${evento.hora_inicio} - ${evento.hora_fin}`;
            }

            // Formatear fecha
            if (evento.fecha_realizacion) {
              const fecha = new Date(evento.fecha_realizacion);
              evento.fecha_display = fecha.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            }

            return evento;
          });

          // Actualizar el dataSource
          this.dataSource.data = this.lista_eventos as DatosEvento[];

          if (this._sort) {
            this.dataSource.sort = this._sort;
          }
          if (this._paginator) {
            this.dataSource.paginator = this._paginator;
          }
        }
      },
      (error) => {
        console.error("Error al obtener la lista de eventos: ", error);
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  // Función para aplicar el filtro de búsqueda
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goRegistrar() {
    this.router.navigate(['/eventos/registrar']);
  }

  public goEditar(idEvento: number) {
    this.router.navigate([`/eventos/${idEvento}/editar`]);
  }

  public delete(idEvento: number) {
    if (this.rol !== 'administrador') {
      alert("No tienes permisos para eliminar eventos.");
      return;
    }

    const dialogRef = this.dialog.open(ConfirmarEliminarEventoModalComponent, {
      data: { id: idEvento },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isDelete) {
        alert("Evento eliminado correctamente.");
        // Recargar la lista
        this.obtenerEventos();
      }
    });
  }

  public isAdmin(): boolean {
    return this.rol === 'administrador';
  }

}

// Interface para los datos del evento
export interface DatosEvento {
  id: number;
  responsable_id: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha_realizacion: string;
  fecha_display?: string;
  hora_inicio: string;
  hora_fin: string;
  horario_display?: string;
  lugar: string;
  publico_objetivo: string;
  programa_educativo: string;
  descripcion_breve: string;
  cupo_maximo: number;
  creation?: string;
  update?: string;
}
