import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventosService } from 'src/app/services/eventos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import { ConfirmarActualizacionModalComponent } from 'src/app/modals/confirmar-actualizacion-modal/confirmar-actualizacion-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-evento-form',
  templateUrl: './evento-form.component.html',
  styleUrls: ['./evento-form.component.scss']
})
export class EventoFormComponent implements OnInit {

  eventoForm: FormGroup;
  editar: boolean = false;
  idEvento: number | null = null;
  responsables: any[] = [];
  programasEducativos: string[] = [
    'Ingeniería en Ciencias de la Computación',
    'Licenciatura en Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información'
  ];
  tiposEvento: string[] = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  publicoOpciones: string[] = ['Estudiantes', 'Profesores', 'Público general'];
  minDate: Date = new Date();
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventosService: EventosService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private dialog: MatDialog
  ) {
    this.initForm();
    this.minDate.setHours(0, 0, 0, 0);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editar = true;
      this.idEvento = parseInt(id);
      if (this.idEvento) {
        this.cargarResponsablesYEvento();
      }
    } else {
      this.cargarResponsables();
    }
  }

  initForm(): void {
    this.eventoForm = this.fb.group({
      nombre_evento: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9\s]+$/)
      ]],
      tipo_evento: ['', [Validators.required]],
      fecha_realizacion: ['', [Validators.required]],
      hora_inicio: ['', [Validators.required]],
      hora_fin: ['', [Validators.required]],
      lugar: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9\s]+$/)
      ]],
      publico_objetivo: this.fb.array([], Validators.required),
      programa_educativo: ['', [Validators.required]],
      responsable: ['', [Validators.required]],
      descripcion: ['', [
        Validators.required,
        Validators.maxLength(300),
        Validators.pattern(/^[a-zA-Z0-9\s.,;:!?¡¿\-()]+$/)
      ]],
      cupo_maximo: ['', [
        Validators.required,
        Validators.pattern(/^[1-9]\d{0,2}$/),
        Validators.min(1),
        Validators.max(999)
      ]]
    }, { validators: [this.horaValidator, this.fechaValidator] });
  }

  horaValidator(control: AbstractControl): ValidationErrors | null {
    const horaInicio = control.get('hora_inicio')?.value;
    const horaFin = control.get('hora_fin')?.value;

    if (horaInicio && horaFin) {
      if (horaInicio >= horaFin) {
        return { horaInvalida: true };
      }
    }
    return null;
  }

  fechaValidator(control: AbstractControl): ValidationErrors | null {
    const fecha = control.get('fecha_realizacion')?.value;
    if (fecha) {
      const fechaSeleccionada = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        return { fechaInvalida: true };
      }
    }
    return null;
  }

  get publicoObjetivoArray(): FormArray {
    return this.eventoForm.get('publico_objetivo') as FormArray;
  }

  togglePublico(publico: string): void {
    const publicoArray = this.publicoObjetivoArray;
    const index = publicoArray.value.indexOf(publico);

    if (index >= 0) {
      publicoArray.removeAt(index);
    } else {
      publicoArray.push(this.fb.control(publico));
    }
  }

  isPublicoChecked(publico: string): boolean {
    return this.publicoObjetivoArray.value.includes(publico);
  }

  cargarResponsables(): void {
    this.responsables = [];
    
    this.maestrosService.obtenerListaMaestros().subscribe(
      (maestros) => {
        const maestrosList = maestros.map((maestro: any) => {
          const id = maestro.user?.id || maestro.id;
          return {
            id: id,
            user_id: maestro.user?.id,
            nombre: `${maestro.user?.first_name || ''} ${maestro.user?.last_name || ''}`.trim(),
            rfc: maestro.rfc || '',
            tipo: 'maestro'
          };
        });
        this.responsables = [...this.responsables, ...maestrosList];
      },
      (error) => {
      }
    );

    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {
        const adminsList = admins.map((admin: any) => {
          const id = admin.user?.id || admin.id;
          return {
            id: id,
            user_id: admin.user?.id,
            nombre: `${admin.user?.first_name || ''} ${admin.user?.last_name || ''}`.trim(),
            rfc: admin.rfc || '',
            tipo: 'administrador'
          };
        });
        this.responsables = [...this.responsables, ...adminsList];
      },
      (error) => {
      }
    );
  }

  cargarResponsablesYEvento(): void {
    this.responsables = [];
    
    forkJoin({
      maestros: this.maestrosService.obtenerListaMaestros(),
      admins: this.administradoresService.obtenerListaAdmins()
    }).subscribe({
      next: (resultados) => {
        const maestrosList = resultados.maestros.map((maestro: any) => {
          const id = maestro.user?.id || maestro.id;
          return {
            id: id,
            user_id: maestro.user?.id,
            nombre: `${maestro.user?.first_name || ''} ${maestro.user?.last_name || ''}`.trim(),
            rfc: maestro.rfc || '',
            tipo: 'maestro'
          };
        });
        
        const adminsList = resultados.admins.map((admin: any) => {
          const id = admin.user?.id || admin.id;
          return {
            id: id,
            user_id: admin.user?.id,
            nombre: `${admin.user?.first_name || ''} ${admin.user?.last_name || ''}`.trim(),
            rfc: admin.rfc || '',
            tipo: 'administrador'
          };
        });
        
        this.responsables = [...maestrosList, ...adminsList];
        
        if (this.idEvento) {
          this.cargarEvento(this.idEvento);
        }
      },
      error: (error) => {
        if (this.idEvento) {
          this.cargarEvento(this.idEvento);
        }
      }
    });
  }

  cargarEvento(id: number): void {
    this.loading = true;
    this.eventosService.getEventoById(id).subscribe(
      (evento) => {
        this.loading = false;
        
        if (evento.publico_objetivo) {
          const publicoArray = this.publicoObjetivoArray;
          publicoArray.clear();
          const publicoList = typeof evento.publico_objetivo === 'string'
            ? [evento.publico_objetivo]
            : (Array.isArray(evento.publico_objetivo) ? evento.publico_objetivo : []);
          
          publicoList.forEach((publico: string) => {
            publicoArray.push(this.fb.control(publico));
          });
        }

        let fechaDate: Date | null = null;
        if (evento.fecha_realizacion) {
          fechaDate = new Date(evento.fecha_realizacion);
        }

        let responsableId = null;
        if (evento.responsable_id) {
          const responsableEncontrado = this.responsables.find(r => r.id === evento.responsable_id);
          if (responsableEncontrado) {
            responsableId = evento.responsable_id;
          } else {
            responsableId = evento.responsable_id;
          }
        } else if (evento.responsable) {
          const responsableEncontrado = this.responsables.find(r => r.rfc === evento.responsable);
          responsableId = responsableEncontrado?.id || null;
        }

        this.eventoForm.patchValue({
          nombre_evento: evento.nombre_evento || '',
          tipo_evento: evento.tipo_evento || '',
          fecha_realizacion: fechaDate,
          hora_inicio: evento.hora_inicio || '',
          hora_fin: evento.hora_fin || '',
          lugar: evento.lugar || '',
          programa_educativo: evento.programa_educativo || '',
          responsable: responsableId,
          descripcion: evento.descripcion_breve || evento.descripcion || '',
          cupo_maximo: evento.cupo_maximo ? evento.cupo_maximo.toString() : ''
        });
      },
      (error) => {
        this.loading = false;
        alert("No se pudo cargar el evento. Por favor, intenta de nuevo.");
        this.router.navigate(['/eventos']);
      }
    );
  }

  guardar(): void {
    if (this.eventoForm.invalid) {
      Object.keys(this.eventoForm.controls).forEach(key => {
        this.eventoForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.editar) {
      this.confirmarYActualizar();
    } else {
      this.crearEvento();
    }
  }

  confirmarYActualizar(): void {
    const dialogRef = this.dialog.open(ConfirmarActualizacionModalComponent, {
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmado) {
        this.actualizarEvento();
      }
    });
  }

  crearEvento(): void {
    this.loading = true;
    const formValue = this.eventoForm.value;

    const fechaFormateada = formValue.fecha_realizacion 
      ? this.formatearFecha(formValue.fecha_realizacion) 
      : '';

    const publicoObjetivo = Array.isArray(formValue.publico_objetivo) && formValue.publico_objetivo.length > 0
      ? formValue.publico_objetivo[0]
      : '';

    const responsableSeleccionado = this.responsables.find(r => r.id === formValue.responsable);
    const rfcResponsable = responsableSeleccionado?.rfc || '';

    const payload = {
      nombre_evento: formValue.nombre_evento,
      tipo_evento: formValue.tipo_evento,
      fecha_realizacion: fechaFormateada,
      hora_inicio: formValue.hora_inicio,
      hora_fin: formValue.hora_fin,
      lugar: formValue.lugar,
      publico_objetivo: publicoObjetivo,
      programa_educativo: formValue.programa_educativo,
      responsable: rfcResponsable,
      descripcion_breve: formValue.descripcion,
      cupo_maximo: parseInt(formValue.cupo_maximo)
    };

    this.eventosService.createEvento(payload).subscribe(
      (response) => {
        this.loading = false;
        alert("Evento creado exitosamente.");
        this.router.navigate(['/eventos']);
      },
      (error) => {
        this.loading = false;
        alert("Error al crear el evento. Por favor, intenta de nuevo.");
      }
    );
  }

  actualizarEvento(): void {
    if (!this.idEvento) return;

    this.loading = true;
    const formValue = this.eventoForm.value;

    const fechaFormateada = formValue.fecha_realizacion 
      ? this.formatearFecha(formValue.fecha_realizacion) 
      : '';

    const publicoObjetivo = Array.isArray(formValue.publico_objetivo) && formValue.publico_objetivo.length > 0
      ? formValue.publico_objetivo[0]
      : '';

    const responsableSeleccionado = this.responsables.find(r => r.id === formValue.responsable);
    const rfcResponsable = responsableSeleccionado?.rfc || '';

    const payload = {
      id: this.idEvento,
      nombre_evento: formValue.nombre_evento,
      tipo_evento: formValue.tipo_evento,
      fecha_realizacion: fechaFormateada,
      hora_inicio: formValue.hora_inicio,
      hora_fin: formValue.hora_fin,
      lugar: formValue.lugar,
      publico_objetivo: publicoObjetivo,
      programa_educativo: formValue.programa_educativo,
      responsable: rfcResponsable,
      descripcion_breve: formValue.descripcion,
      cupo_maximo: parseInt(formValue.cupo_maximo)
    };

    this.eventosService.updateEvento(this.idEvento, payload).subscribe(
      (response) => {
        this.loading = false;
        alert("Evento actualizado exitosamente.");
        this.router.navigate(['/eventos']);
      },
      (error) => {
        this.loading = false;
        alert("Error al actualizar el evento. Por favor, intenta de nuevo.");
      }
    );
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  regresar(): void {
    this.router.navigate(['/eventos']);
  }

  getError(controlName: string): string {
    const control = this.eventoForm.get(controlName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return 'Este campo es requerido';
      }
      if (control.errors['pattern']) {
        if (controlName === 'nombre_evento' || controlName === 'lugar') {
          return 'Solo se permiten letras, números y espacios';
        }
        if (controlName === 'descripcion') {
          return 'Solo se permiten letras, números y signos de puntuación básicos';
        }
        if (controlName === 'cupo_maximo') {
          return 'Solo se permiten números enteros positivos (1-999)';
        }
        return 'Formato inválido';
      }
      if (control.errors['maxlength']) {
        return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      }
      if (control.errors['min']) {
        return `El valor mínimo es ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `El valor máximo es ${control.errors['max'].max}`;
      }
    }
    return '';
  }

  getFormError(): string {
    const errors = this.eventoForm.errors;
    if (errors) {
      if (errors['horaInvalida']) {
        return 'La hora de inicio debe ser menor que la hora de fin';
      }
      if (errors['fechaInvalida']) {
        return 'La fecha no puede ser anterior al día actual';
      }
    }
    return '';
  }
}