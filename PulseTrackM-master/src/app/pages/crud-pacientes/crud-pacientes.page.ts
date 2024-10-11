import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pacientes } from '../services/pacientes';
import { ServiciobdService } from '../services/serviciobd.service';
import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-crud-pacientes',
  templateUrl: './crud-pacientes.page.html',
  styleUrls: ['./crud-pacientes.page.scss'],
})
export class CrudPacientesPage implements OnInit {
  pacientes: Pacientes[] = [];
  constructor(
    private router: Router,
    private baseDatos: ServiciobdService
   ) { }

  ngOnInit() {
    this.listarPacientes();
  }

  listarPacientes(){
    this.baseDatos.consultartablaPaciente()
      .then((res) => {        
        this.pacientes = res;
        alert(res[0].rut)
      })
      .catch( (error) => alert(`ERROR ${error}`));
  }
  // verPacientes(){
  //   this.router.navigate(['/ver-pacientes']); 
  // }
  agregarPacientes(){
    this.router.navigate(['/agregar-pacientes']); 
  }
  eliminarPacientes(rut: string){
    this.router.navigate(['/eliminar-pacientes',rut]); 
  }
  modificarPacientes(rut: string){
    this.router.navigate(['/modificar-pacientes',rut]); 
  }

  verReporte(){
    this.router.navigate(['/home']); 
  }

}
