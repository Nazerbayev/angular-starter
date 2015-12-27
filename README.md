# angular-starter
Gulp setup for AngularJS projects with bower and browserify

## Instalación

1. Clonar este repositorio
2. Instalar los paquetes de Node con el comando:

```javascript
npm install
```

El script de npm instalará todas las dependencias de node y después de finalizado instalará bower y sus dependencias automáticamente.

3. Existen dos entornos de desarrollo: **development** y **production**, para ejecutar el entorno de desarrollo:

```javascript
gulp watch
```

Para el entorno de producción:

```javascript
gulp watch --production
```

El *flag* `--production` le indica a *gulp* el tipo de entorno que ejecutará, por default *development*.  
El entorno de producción ejecuta pasos adicionales en el proceso de compilación, como minificación de los css y *uglyfying* de los javascript.

## Configuración

La mayor parte de la configuración que gulp usa se encuentra en el archivo build-config.json, por ahora solo contiene rutas de origen y destino para cada componente. A medida que vaya mejorando el script de gulp seguiré abstrayendo mas configuración a este archivo.

A diferencia de muchos scripts de gulp que he conseguido en internet, en este no repito tasks para cada ambiente (*watch-dev*, *watch-prod*, *build-dev*, *build-prod*, etc), para facilitar el mantenimiento del script y no repetir código utilizo plugins como **yargs** para determinar el entorno que se quiere trabajar y **gulp-if** para tomar los pasos adicionales que son necesarios para *producción* pero prescindibles para *development*.

El archivo `index.html` utiliza *gulp-inject* para inyectar automaticamente los archivos javascript y de estilos, pero a veces se necesita que estos archivos tengan un orden en especifico. Para solucionar eso agregué en el archivo de configuración `build-config.json` una forma de especificar el orden en que se inyectan dichos archivos:

```javascript
{
    ...
    "dev": {
        ...
        "vendor_order": ["jquery.js"],
        "styles_order": ["main.css", "another.css"],
        "js_order": []
        ...
    }
    ...
}
```

**vendor_order***: Orden de los archivos de bower.
**styles_order**: Orden de las hojas de estilos
**js_order**: Orden de los javascripts (adicionales al principal de angular)

**IMPORTANTE**: Este script utiliza **Browserify** para la construcción del javascript, por lo que la forma en que se programa angularjs cambia de forma notable, el repositorio incluye algunos archivos adicionales con la nueva sintaxis adicional que nos proporciona **CommonJS**. Cabe destacar que **browserify** nos dá una gran flexibilidad para la modularización de nuestro código.  

## Future/Missing Features

* Image sync
* Image processing for production environment
