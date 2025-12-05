import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  //Agregar chartjs-plugin-datalabels
  //Variables

  public total_user: any = {};

  //Histograma
  lineChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private estadisticasService: EstadisticasService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados desde /admins-edit/
  public obtenerTotalUsers(){
    this.estadisticasService.getDatosUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios desde /admins-edit/: ", this.total_user);
        
        // Actualizar datos de todas las gráficas dinámicamente
        if (this.total_user && typeof this.total_user === 'object') {
          // El backend devuelve 'admins' en lugar de 'administradores'
          const administradores = this.total_user.admins || this.total_user.administradores || 0;
          const maestros = this.total_user.maestros || 0;
          const alumnos = this.total_user.alumnos || 0;
          
          // Datos comunes para todas las gráficas
          const datosUsuarios = [administradores, maestros, alumnos];
          
          // Actualizar gráfica de histograma (line)
          this.lineChartData = {
            ...this.lineChartData,
            datasets: [{
              ...this.lineChartData.datasets[0],
              data: datosUsuarios
            }]
          };
          
          // Actualizar gráfica de barras (bar)
          this.barChartData = {
            ...this.barChartData,
            datasets: [{
              ...this.barChartData.datasets[0],
              data: datosUsuarios
            }]
          };
          
          // Actualizar gráfica circular (pie)
          this.pieChartData = {
            ...this.pieChartData,
            datasets: [{
              ...this.pieChartData.datasets[0],
              data: datosUsuarios
            }]
          };
          
          // Actualizar gráfica de dona (doughnut)
          this.doughnutChartData = {
            ...this.doughnutChartData,
            datasets: [{
              ...this.doughnutChartData.datasets[0],
              data: datosUsuarios
            }]
          };
        }
      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

}
