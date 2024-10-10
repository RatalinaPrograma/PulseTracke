import { Component, OnInit } from '@angular/core';
import { ServiciobdService } from '../services/serviciobd.service';

import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-ajustes-perfil-paramedico',
  templateUrl: './ajustes-perfil-paramedico.page.html',
  styleUrls: ['./ajustes-perfil-paramedico.page.scss'],
})
export class AjustesPerfilParamedicoPage implements OnInit {
  persona = {
    idPersona: 1,  // Por defecto el ID del usuario a editar
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    clave: '',
    telefono: '',
    foto: ''
  };

  constructor(private serviciobd: ServiciobdService, private alertasService: AlertasService) {
    this.cargarDatosUsuario();
  }
  
  ngOnInit() {
  }

  // Cargar los datos del usuario desde la base de datos
  cargarDatosUsuario() {
    this.serviciobd.obtenerUsuario(this.persona.idPersona).then(usuario => {
      if (usuario) {
        this.persona = usuario;  // Asigna los datos obtenidos al objeto persona
      } else {
        this.alertasService.presentAlert('Error', 'No se pudo cargar la información del usuario');
      }
    }).catch(error => {
      console.error('Error al cargar los datos del usuario', error);
      this.alertasService.presentAlert('Error', 'Error al cargar los datos del usuario');
    });
  }
  // Guardar los cambios en los datos del usuario
  guardarCambios() {
    this.serviciobd.actualizarUsuario(this.persona).then(() => {
      this.alertasService.presentAlert('Éxito', 'Los cambios se han guardado correctamente');
    }).catch(error => {
      console.error('Error al guardar los cambios', error);
      this.alertasService.presentAlert('Error', 'No se pudieron guardar los cambios');
    });
  }

}
