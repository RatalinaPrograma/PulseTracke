import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pacientes } from './pacientes';
import { Trabajador } from './trabajador';
import { Rol } from './rol';
import { AlertasService } from './alertas.service';

@Injectable({
  providedIn: 'root'
})
export class ServiciobdService {
  public database!: SQLiteObject;
  isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private dbIsCreated: boolean = false;
  
  // Sentencias SQL de creación de tablas
  tablaAmbulancia: string = "CREATE TABLE IF NOT EXISTS ambulancia(idambulancia INTEGER PRIMARY KEY AUTOINCREMENT, patente VARCHAR(100) NOT NULL, equipada BOOLEAN NOT NULL, fec_mant DATE NOT NULL, idestado INTEGER NOT NULL, FOREIGN KEY (idestado) REFERENCES estado(idestado));";

  tablaEstado: string = "CREATE TABLE IF NOT EXISTS estado(idestado INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100) NOT NULL);";
  
  tablaHospital: string = "CREATE TABLE IF NOT EXISTS hospital(idHospital INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100) NOT NULL, direccion VARCHAR(255) NOT NULL);";

  tablaSignosV: string = "CREATE TABLE IF NOT EXISTS signos_vitales(idSigno INTEGER PRIMARY KEY AUTOINCREMENT, freq_cardiaca INTEGER, presion_arterial VARCHAR(10), temp_corporal INTEGER, sat_oxigeno INTEGER, freq_respiratoria INTEGER, condiciones TEXT, operaciones TEXT);";

  tablaDetalle: string = "CREATE TABLE IF NOT EXISTS detalle(idDetalle INTEGER PRIMARY KEY AUTOINCREMENT, idEmerg INTEGER, idPaciente INTEGER, FOREIGN KEY (idEmerg) REFERENCES emergencia(idEmerg), FOREIGN KEY (idPaciente) REFERENCES paciente(idPaciente));";

  tablaDetalle_S: string = "CREATE TABLE IF NOT EXISTS detalle_s(idDetalleS INTEGER PRIMARY KEY AUTOINCREMENT, idDetalle INTEGER, idSigno INTEGER, valor VARCHAR(100), unidad VARCHAR(50), FOREIGN KEY (idDetalle) REFERENCES detalle(idDetalle), FOREIGN KEY (idSigno) REFERENCES signos_vitales(idSigno));";
 
  tablaEmergencia: string = "CREATE TABLE IF NOT EXISTS emergencia(idEmerg INTEGER PRIMARY KEY AUTOINCREMENT, fecha_emer DATE NOT NULL, motivo VARCHAR(255), desc_motivo TEXT, observaciones TEXT, estado VARCHAR(50), f_recepcion DATE, idambulancia INTEGER, idTriage INTEGER, idHospital INTEGER, FOREIGN KEY (idambulancia) REFERENCES ambulancia(idambulancia), FOREIGN KEY (idTriage) REFERENCES triage(idTriage), FOREIGN KEY (idHospital) REFERENCES hospital(idHospital));";
  
  tablaTriage: string = "CREATE TABLE IF NOT EXISTS triage(idTriage INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100) NOT NULL);";

  tablaPaciente: string = "CREATE TABLE IF NOT EXISTS paciente(idPaciente INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100) NOT NULL, f_nacimiento DATE NOT NULL, idGenero INTEGER, rut VARCHAR(50) NOT NULL UNIQUE, telefono_contacto VARCHAR(15), FOREIGN KEY (idGenero) REFERENCES genero(idgenero));";

  tablaPersona: string = "CREATE TABLE IF NOT EXISTS persona(idPersona INTEGER PRIMARY KEY AUTOINCREMENT, nombres VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, rut VARCHAR(50) NOT NULL UNIQUE, correo VARCHAR(100) NOT NULL UNIQUE, clave VARCHAR(100) NOT NULL, telefono VARCHAR(15), foto BLOB, idRol INTEGER, FOREIGN KEY (idRol) REFERENCES rol(idrol));";
  
  tablaRol: string = "CREATE TABLE IF NOT EXISTS rol(idrol INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100) NOT NULL);";

  tablaTrabajador: string = "CREATE TABLE IF NOT EXISTS trabajador(idTrab INTEGER PRIMARY KEY AUTOINCREMENT, idambulancia INTEGER, idPersona INTEGER, FOREIGN KEY (idambulancia) REFERENCES ambulancia(idambulancia), FOREIGN KEY (idPersona) REFERENCES persona(idPersona));";
  
  tablaGenero: string = "CREATE TABLE IF NOT EXISTS genero(idgenero INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(100) NOT NULL);";
  
  tablaPersonal: string = "CREATE TABLE IF NOT EXISTS personal(idpersonal INTEGER PRIMARY KEY AUTOINCREMENT, idHospital INTEGER, FOREIGN KEY (idHospital) REFERENCES hospital(idHospital), idPersona INTEGER, FOREIGN KEY (idPersona) REFERENCES persona(idPersona));";

  listadoPacientes: BehaviorSubject<Pacientes[]> = new BehaviorSubject<Pacientes[]>([]);
  listadoTrabajador: BehaviorSubject<Trabajador[]> = new BehaviorSubject<Trabajador[]>([]);
  listadoRol: BehaviorSubject<Rol[]> = new BehaviorSubject<Rol[]>([]);

  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController, private AlertasService: AlertasService) {
    this.crearBD();
  }

  crearBD() {
    if (this.dbIsCreated) return;

    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'pulseTrack.db',
        location: 'default'
     }).then((db: SQLiteObject) => {
        this.database = db;
        this.crearTablas();
        this.isDBReady.next(true);
        this.dbIsCreated = true;
     }).catch(e => {
        console.error('Error al crear la BD', e);
        this.presentAlert('Creación de BD', 'Error creando la BD: ' + JSON.stringify(e));
     });
    });
  }

  crearTablas() {
    let tablas = [
      this.tablaEstado,
      this.tablaRol,
      this.tablaGenero,
      this.tablaPersona,
      this.tablaAmbulancia,
      this.tablaTrabajador,
      this.tablaHospital,
      this.tablaSignosV,
      this.tablaDetalle,
      this.tablaDetalle_S,
      this.tablaEmergencia,
      this.tablaTriage,
      this.tablaPaciente
    ];

    tablas.forEach(tabla => {
      this.database.executeSql(tabla, [])
        .then(() => console.log('Tabla creada correctamente'))
        .catch(e => this.presentAlert('Error creando tablas', 'Error: ' + JSON.stringify(e)));
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  fetchPacientes(): Observable<Pacientes[]> {
    return this.listadoPacientes.asObservable();
  }

  fetchTrabajador(): Observable<Trabajador[]> {
    return this.listadoTrabajador.asObservable();
  }

  fetchRol(): Observable<Rol[]> {
    return this.listadoRol.asObservable();
  }

  // Agregar

  agregarPaciente(nombre: string, f_nacimiento: Date, idGenero: number, rut: string, telefono_contacto: string) {
    return this.database.executeSql('INSERT OR IGNORE INTO paciente (nombre, f_nacimiento, idGenero, rut, telefono_contacto) VALUES (?, ?, ?, ?, ?)', [nombre, f_nacimiento, idGenero, rut, telefono_contacto])
      .then(res => {
        this.AlertasService.presentAlert("Agregar paciente", "Paciente agregado correctamente.");
        this.consultartablaPaciente();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Agregar paciente", "Ocurrió un error: " + JSON.stringify(e));
      });
  }

  agregarTrabajador(idAmb: number, idPersona: number) {
    return this.database.executeSql('INSERT OR IGNORE INTO trabajador (idambulancia, idPersona) VALUES (?, ?)', [idAmb, idPersona])
      .then(res => {
        this.AlertasService.presentAlert("Agregar trabajador", "Trabajador agregado correctamente.");
        this.consultartablaTrabajador();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Agregar trabajador", "Ocurrió un error: " + JSON.stringify(e));
      });
  }

  agregarRol(nombre: string) {
    return this.database.executeSql('INSERT OR IGNORE INTO rol (nombre) VALUES (?)', [nombre])
      .then(res => {
        this.AlertasService.presentAlert("Agregar rol", "Rol agregado correctamente.");
        this.consultartablaRol();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Agregar rol", "Ocurrió un error: " + JSON.stringify(e));
      });
  }

    operaciones!: string; 

  agregarSignosV(freq_cardiaca:number,presion_arterial:string,temp_corporal:number,sat_oxigeno:number,freq_respiratoria:number,condiciones:string, operaciones:string) {
    return this.database.executeSql('INSERT OR IGNORE INTO SignosV (freq_cardiaca, presion_arterial, temp_corporal, sat_oxigeno, freq_respiratoria,condiciones,operaciones) VALUES (?, ?, ?, ?, ?,?,?)', [freq_cardiaca, presion_arterial, temp_corporal, sat_oxigeno, freq_respiratoria,condiciones,operaciones])
      .then(res => {
        this.AlertasService.presentAlert("Agregar signos vitales", "Signos vitales agregados correctamente.");
        this.consultartablaPaciente();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Agregar signos vitales", "Ocurrió un error: " + JSON.stringify(e));
      });
  }


  // Consultar

  consultartablaPaciente() {
    return this.database.executeSql('SELECT * FROM paciente', []).then(res => {
      let itemsR: Pacientes[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          itemsR.push({
            idPaciente: res.rows.item(i).idPaciente,
            nombre: res.rows.item(i).nombre,
            f_nacimiento: res.rows.item(i).f_nacimiento,
            idGenero: res.rows.item(i).idGenero,
            rut: res.rows.item(i).rut,
            telefono_contacto: res.rows.item(i).telefono_contacto,
          });
        }
      }
      this.listadoPacientes.next(itemsR);
    });
  }

  obtenerPaciente(rut: string) {
    return this.database.executeSql(`SELECT * FROM paciente where rut = ?`, [rut]).then(res => {
      let paciente: Pacientes = {
        nombre:'',
        f_nacimiento: new Date(), 
        idGenero: 0,
        rut: '',
        telefono_contacto: '',
      };
      
      if (res.rows.length > 0) {
        paciente = {
          idPaciente: res.rows.item(0).idPaciente,
          nombre: res.rows.item(0).nombre,
          f_nacimiento: res.rows.item(0).f_nacimiento,
          idGenero: res.rows.item(0).idGenero,
          rut: res.rows.item(0).rut,
          telefono_contacto: res.rows.item(0).telefono_contacto,
        }
      }
      return paciente;
    });
  }

  consultartablaTrabajador() {
    return this.database.executeSql('SELECT * FROM trabajador', []).then(res => {
      let itemsT: Trabajador[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          itemsT.push({
            idTrab: res.rows.item(i).idTrab,
            idAmb: res.rows.item(i).idAmb,
            idPersona: res.rows.item(i).idPersona
          });
        }
      }
      this.listadoTrabajador.next(itemsT);
    });
  }

  consultartablaRol() {
    return this.database.executeSql('SELECT * FROM rol', []).then(res => {
      let itemsR: Rol[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          itemsR.push({
            idrol: res.rows.item(i).idrol,
            nombre: res.rows.item(i).nombre
          });
        }
      }
      this.listadoRol.next(itemsR);
    });
  }

  // Modificar

  modificarPaciente(idPaciente: number, nombre: string, f_nacimiento: Date, idGenero: number, rut: string, telefono_contacto: string) {
    return this.database.executeSql('UPDATE paciente SET nombre = ?, f_nacimiento = ?, idGenero = ?, rut = ?, telefono_contacto = ? WHERE idPaciente = ?', [nombre, f_nacimiento, idGenero, rut, telefono_contacto, idPaciente])
      .then(res => {
        this.AlertasService.presentAlert("Modificar paciente", "Paciente modificado correctamente");
        this.consultartablaPaciente();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Modificar paciente", "Error: " + JSON.stringify(e));
      });
  }

  modificarTrabajador(idTrab: number, idAmb: number, idPersona: number) {
    return this.database.executeSql('UPDATE trabajador SET idambulancia = ?, idPersona = ? WHERE idTrab = ?', [idAmb, idPersona, idTrab])
      .then(res => {
        this.AlertasService.presentAlert("Modificar trabajador", "Trabajador modificado correctamente");
        this.consultartablaTrabajador();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Modificar trabajador", "Error: " + JSON.stringify(e));
      });
  }

  modificarRol(idrol: number, nombre: string) {
    return this.database.executeSql('UPDATE rol SET nombre = ? WHERE idrol = ?', [nombre, idrol])
      .then(res => {
        this.AlertasService.presentAlert("Modificar rol", "Rol modificado correctamente");
        this.consultartablaRol();
      })
      .catch(e => {
        this.AlertasService.presentAlert("Modificar rol", "Error: " + JSON.stringify(e));
      });
  }





  ///////////////////////////////////////////////////////////////////////////
// Función para registrar un usuario
async register(persona: any): Promise<boolean> {
  const query = `INSERT INTO persona (nombres, apellidos, rut, correo, clave, telefono, foto, idRol) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    persona.nombres,
    persona.apellidos,
    persona.rut,
    persona.correo,
    persona.clave,
    persona.telefono,
    persona.foto,
    persona.idRol,
  ];

  try {
    await this.database.executeSql(query, values);
    this.AlertasService.presentAlert('Registro exitoso', 'Usuario registrado correctamente');
    return true;
  } catch (error) {
    console.error('Error al registrar usuario', error);
    this.AlertasService.presentAlert('Error en registro', 'El registro falló');
    return false;
  }
}

// Función para iniciar sesión
async login(rut: string, password: string): Promise<any> {
  const query = `SELECT * FROM persona WHERE rut = ? AND clave = ?`;
  try {
    const res = await this.database.executeSql(query, [rut, password]);
    if (res.rows.length > 0) {
      return res.rows.item(0); // Retorna los datos del usuario si encuentra una coincidencia
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error durante el login', error);
    return null;
  }
}

}
