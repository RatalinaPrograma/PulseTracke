
  import { Component } from '@angular/core';
  import { AlertController } from '@ionic/angular';
  import { Router } from '@angular/router';
  import { ServiciobdService } from '../services/serviciobd.service';
import { AlertasService } from '../services/alertas.service';
  
  
  @Component({ selector: 'app-login-paramedico',
    templateUrl: './login-paramedico.page.html',
     styleUrls: ['./login-paramedico.page.scss'],
    })
  export class LoginParamedicoPage  {
    rut: string = '';
    password: string = '';
  
  
    
  
    constructor(private alertController: AlertController, private router: Router,private servicebd: ServiciobdService,private alertasb: AlertasService) {}
  
    
    

    async login() {
      if (this.rut === '' || this.password === '') {
        this.alertasb.presentAlert('Error', 'Por favor ingrese su Rut y contraseña.');
        return;
      }
  
      const usuario = await this.servicebd.login(this.rut, this.password);
      if (usuario) {
        this.router.navigate(['/home']); // Redirige al dashboard o página principal si el login es exitoso
      } else {
        this.alertasb.presentAlert('Error de inicio de sesión', 'Rut o contraseña incorrectos.');
      }
    }
  }
  