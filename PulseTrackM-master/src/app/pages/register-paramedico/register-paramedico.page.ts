import { Component } from '@angular/core';
import { AlertasService } from '../services/alertas.service';
import { ServiciobdService } from '../services/serviciobd.service';
@Component({
  selector: 'app-register-paramedico',
  templateUrl: './register-paramedico.page.html',
  styleUrls: ['./register-paramedico.page.scss'],
})
export class RegisterParamedicoPage {
  // Variables para almacenar los valores de los campos del formulario
  persona = {
    nombres: '',
    apellidos: '',
    rut: '',
    correo: '',
    clave: '',
    telefono: '',
    foto: '',
    idRol: 2, // Cliente por defecto
  };

  constructor(
    private serviciobd: ServiciobdService, 
    private alertasService: AlertasService // Inyecta correctamente el servicio de alertas
  ) {}

  // Asegúrate de que la función esté marcada como `async`
  async onRegister() {
    const registrado = await this.serviciobd.register(this.persona);
    if (registrado) {
      this.alertasService.presentAlert('Registro exitoso', 'Usuario registrado correctamente');
    } else {
      this.alertasService.presentAlert('Error en registro', 'Hubo un error en el registro.');
    }
  }
}
