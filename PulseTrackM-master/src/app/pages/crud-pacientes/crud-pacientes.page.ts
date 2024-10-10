import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crud-pacientes',
  templateUrl: './crud-pacientes.page.html',
  styleUrls: ['./crud-pacientes.page.scss'],
})
export class CrudPacientesPage implements OnInit {

  constructor(private router: Router ) { }

  ngOnInit() {
  }

  verPacientes(){
    this.router.navigate(['/ver-pacientes']); 
  }
  agregarPacientes(){
    this.router.navigate(['/agregar-pacientes']); 
  }
  eliminarPacientes(){
    this.router.navigate(['/eliminar-pacientes']); 
  }
  modificarPacientes(){
    this.router.navigate(['/modificar-pacientes']); 
  }

  verReporte(){
    this.router.navigate(['/home']); 
  }

}
