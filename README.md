# LILA — Librería Laboral

## Integrantes

- Natalia Arze Torrez
- Susan Laime Lucero
- Sara Revollo Mérida
- Joaquin Peredo

## ¿Qué es LILA?

**LILA conecta, de forma ágil, simple y confiable, a personas que buscan trabajo con empleadores que necesitan talento en Bolivia.**

- Reúne en un solo lugar trabajos formales, informales, temporales, por proyecto o por servicio, que hoy están dispersos en grupos y canales informales.
- Una misma cuenta puede ser **trabajador**, **empleador** o ambos.
- Contraseñas cifradas, sesión segura y perfil propio para cada rol.
- Este incremento cubre: **registro → inicio de sesión → ver y editar el perfil**.

## Arquitectura

LILA combina cuatro ideas de arquitectura, y cada una responde a una pregunta distinta:

- **¿Cómo se despliega? Monolítica modular.** Todo el sistema funciona como una sola aplicación, con una sola base de datos. Es más simple de construir, probar y poner en marcha que varios servicios separados. Por dentro, el código está dividido en módulos con responsabilidades claras, lo que permite repartir el trabajo entre el equipo.
- **¿Cómo se comunican sus partes? Cliente-servidor con API REST.** El navegador (cliente) pide información y el servidor la procesa y responde. Cada recurso tiene una dirección, cada acción usa un método HTTP y los datos viajan en formato JSON. Toda la lógica sensible se ejecuta en el servidor, porque lo que envía el cliente no se considera confiable.
- **¿Cómo se ordena el código? Tres capas.** La **presentación** muestra la información y recibe las acciones del usuario. La **aplicación** contiene las reglas del negocio. Los **datos** guardan y recuperan la información. Cada capa solo conversa con la de al lado.
- **¿Cómo se separan responsabilidades? MVC.** La **Vista** es lo que el usuario ve, el **Controlador** recibe sus acciones y decide qué hacer, y el **Modelo** representa los datos y sus reglas. Así, cambiar el diseño de una pantalla no obliga a cambiar la lógica, y al revés.

Además, el sistema aplica **inversión de dependencias**: las reglas del negocio no dependen de herramientas concretas (la base de datos, la librería de cifrado o la de tokens), sino de **contratos** que esas herramientas cumplen. Si mañana se cambia una tecnología, las reglas no se tocan.

## Tech stack

- **Backend:** Node.js 22.13+ (ES Modules) con Express 5
- **Base de datos:** SQLite incorporado en Node (`node:sqlite`); no se instala ningún motor aparte
- **Seguridad:** bcryptjs (cifrado de contraseñas) y jsonwebtoken (sesión con JWT de 8 horas)
- **Frontend:** HTML, CSS y JavaScript sin frameworks, organizado en clases
- **Pruebas:** `node:test` (incluido en Node) y playwright-core para las pruebas en el navegador

## Getting started

### Prerrequisitos

- [Node.js](https://nodejs.org/) **22.13 o superior** (incluye `npm`)
- Git
- Chrome o Edge instalado (solo para `npm run test:e2e`)

### Instalación

```bash
git clone https://github.com/SusanLaime/LILA_Project.git
cd LILA_Project
npm install
```

Crea un archivo `.env` en la raíz del proyecto:

```
PORT=3000                   # puerto del servidor (opcional, por defecto 3000)
DB_PATH=database/lila.db    # archivo SQLite (opcional, se crea al arrancar)
JWT_SECRET=cambia-esta-clave  # obligatorio: sin esta clave el servidor no arranca
```

### Comandos

```bash
npm start          # Arranca el servidor con .env; abrir http://localhost:3000
npm run dev        # Igual que start, pero reinicia solo al guardar cambios
npm test           # Corre todas las pruebas automatizadas con una base en memoria
npm run test:e2e   # Abre las páginas reales en Chrome o Edge y prueba el recorrido
```

## Cómo está organizado

El proyecto tiene tres grandes partes: el **servidor**, las **páginas** que ve el usuario y la **base de datos**, acompañadas de pruebas automatizadas y documentación.

Dentro del servidor, el código sigue el mismo orden que las capas de la arquitectura, de afuera hacia adentro:

1. **Controladores:** reciben las peticiones del navegador y devuelven las respuestas.
2. **Servicios:** aplican las reglas de cada caso de uso, como registrarse, iniciar sesión o editar el perfil.
3. **Dominio:** representa los conceptos del negocio (el usuario y sus perfiles de trabajador y empleador) con sus propias reglas.
4. **Contratos:** describen qué se necesita (guardar usuarios, cifrar contraseñas, crear sesiones) sin decir cómo se hace.
5. **Infraestructura:** cumple esos contratos con herramientas reales (la base de datos, el cifrado y los tokens).

Un único punto de arranque crea todas estas piezas y las conecta entre sí.

## Diseño orientado a objetos

El sistema está modelado con **programación orientada a objetos**, siguiendo cuatro principios:

- **Una responsabilidad por clase:** cada clase tiene un solo motivo para cambiar. La que atiende peticiones no guarda datos, y la que guarda datos no decide reglas.
- **Herencia y polimorfismo:** los perfiles de trabajador y de empleador comparten una base común y cada uno agrega lo suyo. El resto del sistema los trata igual, sin preguntar de qué tipo son. Lo mismo ocurre con las páginas del navegador.
- **Composición:** un usuario está formado por uno o dos perfiles. Un perfil no existe sin su usuario.
- **Abstracción:** las partes del sistema se comunican mediante contratos (interfaces), no mediante detalles técnicos. Así, cada pieza puede cambiar o probarse por separado.

El diagrama de clases está en la documentación del proyecto. Las clases marcadas como «futuro» corresponden al siguiente incremento: la publicación de ofertas.

## Patrones de diseño

LILA aplica patrones de diseño conocidos para resolver problemas concretos:

- **Repository:** concentra todo el acceso a la base de datos en un solo lugar. El resto del sistema pide "busca" o "guarda" sin saber cómo se almacena la información.
- **Adapter:** envuelve herramientas externas (el cifrado, los tokens, el almacenamiento del navegador) para que encajen en una forma propia del sistema, sin reescribirlas.
- **Strategy:** permite intercambiar una tecnología por otra que cumpla el mismo contrato, sin modificar las reglas del negocio.
- **Inyección de dependencias:** cada pieza recibe lo que necesita desde afuera, en vez de crearlo ella misma. Esto reduce el acoplamiento y facilita las pruebas.
- **Template Method:** una clase base define los pasos comunes de un proceso, y cada variante completa solo su parte. Se usa para que todas las páginas arranquen igual.
- **Facade:** ofrece una puerta de entrada simple a algo complejo. Las páginas se comunican con el servidor sin ocuparse de los detalles de la conexión ni de la sesión.
- **Chain of Responsibility:** una petición pasa por una cadena de pasos, y cualquiera puede atenderla o detenerla. Así se revisa la sesión antes de dar acceso al perfil.
- **Observer:** las páginas se suscriben a las acciones del usuario (clics, envíos de formularios, cambios en los campos) y reaccionan cuando ocurren, mediante el modelo de eventos del navegador.
