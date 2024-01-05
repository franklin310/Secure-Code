# Secure-Coding-101
Repositorio con codigos vulnrables del OWASP top 10 del 2021 para aprender a identificar las vulnerabilidades a nivel de codigo

## **1.	SQL INJECTIONS**

   
### **1.1. getUserInfo.js**

**Accept** - La consulta SQL utiliza un marcador de posición (?) y pasa el valor del nombre de usuario como un parámetro en el array, lo cual es una buena práctica y ayuda a prevenir la inyección de SQL.

 
![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/322c7172-a70b-4097-8763-fd88fb106af3)

### **1.2. saveUser.js**

**Reject** - es vulnerable a la inyección de SQL, ya que está utilizando concatenación de cadenas para construir la consulta SQL en lugar de consultas parametrizadas. Esto puede permitir que un atacante realice inyecciones de SQL manipulando los valores de entrada.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/c22ccdaf-5780-4edf-85b9-2132bc9ce4b9)

 
### **1.3. Authenticate.js**

**Reject** - si un atacante proporciona un nombre de usuario malicioso, podría manipular la consulta de manera que comprometa la seguridad de la aplicación. Por ejemplo, podrían introducir un nombre de usuario como '; DROP TABLE users; --.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/3a51ef04-23f5-41cd-a077-8529c9dbad4e)

 
### **1.4. updateAnswer**

**Reject** -  El riesgo de inyección de SQL está presente en la construcción de las consultas mediante la concatenación de cadenas y el uso de la función replace. Aunque esta convirtiendo ans a un entero antes de usarlo, la forma en que se construye la consulta sigue siendo potencialmente vulnerable.

Supongamos que answer contiene datos no confiables y que un atacante proporciona un valor de answer malicioso. En ese caso, el valor malicioso podría influir en la consulta SQL resultante, y si el valor de ans es manipulado, podría generar una vulnerabilidad de inyección de SQL.

Por ejemplo, si answer es una cadena maliciosa como 1'; DROP TABLE quiz; --, la consulta resultante podría ser:

UPDATE quiz SET YesCount = YesCount + 1'; DROP TABLE quiz; -- WHERE _id = "quizId"

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/841836dc-d622-4577-91e7-d19af96f098a)

 
### **1.5. pollAnswer**

**Accept** – la respuesta esta explicitamente comparada en la entrada 1 o 0, contra las posibles respuestas lo que reduce el riesgo de inyeccion. Ademas cuando se realiza el query a la db, se esta parametrizando el query donde el pull ID no esta directamente concatenado con el query, reduciendo la posibilidad de inyeccion.

 ![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/c2bbd447-13cb-4893-a94b-fbdf265d1d2d)

## **2.	OS-COMAND INJECTIONS**

### **2.1. Router post**

**Reject** - El problema aquí es que los valores de req.body.reactorId y req.body.cmdId se concatenan directamente al comando sin una verificación adecuada. Esto podría permitir a un atacante realizar inyección de comandos y ejecutar comandos arbitrarios en el sistema.

execFile("cmd /c ../resources/reactorControl.bat -"+req.body.reactorId+" -"+ req.body.cmdId, function(err, stdout, stderr) {
  if (err !== null) {
    console.log(err);
  }
});

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/f0414c65-d636-4a5d-b8d6-a45f16be726d)

 
### **2.2. multer.diskStorage.js**

**Reject** - La ejecución de comandos mediante child_process.exec puede ser peligrosa si se utilizan datos no confiables sin una adecuada validación o sanitización. La función exec interpreta y ejecuta cualquier cadena que se le proporcione, lo que puede conducir a vulnerabilidades de inyección de comandos si no se manejan adecuadamente.

La variable fileDirPath se concatena directamente en el comando mkdir. Esto podría ser explotado por un atacante si fileDirPath contiene caracteres especiales u otros datos maliciosos.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/1a6296bd-36cd-4e3f-b0da-eaa96496ee10)

 
### **2.3. Create Invoice**

**Reject** - En este escenario el directorio de la factura es creado basado en la fecha selecctionada por el usuario en el lado del cliente cuando ingresa los detalles de la factura. El problema con este metodo es que utiliza el directorio desde un form oculto el cual puede ser facilmente tampereado po ru n atacante y reemplazarlo por comandos del systema.

En esta sección, se crea un directorio utilizando child_process.exec con la cadena directa proporcionada por req.body.dirName. Esto puede ser explotado por un atacante si dirName contiene caracteres especiales o comandos maliciosos. Dir name esta en la variable path.

 ![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/d1e92248-5cbb-443a-b12c-5f55d41a1562)


### **2.4. EnsureAuthenticated.js**

**Accept** – el parametro de la operación ha sido convertido a un index dentro del servidor definiendo el mapeo permitido de los strings de operación. En lugar de usar el parametro de operación directamente en el la llamada al exec, este esta ahora simplificado  para verse desde la string de operación permitida, el cual es usado. Esto previende que el input del usuario sea usado para ejecutar comandos y tambien actua como una lista blanca  de valores permitidos.

 ![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/2924885f-1996-4ac2-b98e-1787ec503702)



## **3.	User ENUMERATION**

### **3.1. Login.js**

**Reject** - LA APLICACIÓN no esta enviando correctamente los mensajes en caso de credenciales incorrentas cuando un usuario esta tratando de logearse. Mostrando informacion especifica acerca de las credenciales incorrectas lo que da una oportunidad al atacante de recolectar informacion sensible a cerca de los usuarios.

 ![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/781b1c51-b9b9-4874-87d7-a408dac97ebe)



### **3.2. Authenticate.js**

**Accept** - La mejor practica es utilizar un mensaje generico como usuario y contraseña son incorrectos para cubrir ambos casos. Esto previene ataques de adivinacion.

 
![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/cc6860f7-d6d6-46c8-9d49-15fe8390ffe3)


## **4.	Weak Algorithm Use**

### **4.1. createUser.js**
**Accept** - Argon 2 is el ganador del ultimo PHC ( password Hashing competition), por lo que es considerado el mejor algoritmo de hasheo de la actualidad. El codigo esta utilizando Argon 2, por lo que provee un nivel de seguridad alto.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/281d8bda-cd73-4604-ab92-928b0ced6366)


### **4.2. verifyUser.js**

**Accept** - La aplicación ahora esta utilizando argon 2, que es una solucion moderda y fuerte para hashar contraseñas.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/9bc35984-5460-4210-a282-8bda70d15627)


### **4.3. cryptPassword.js**
preguntar si hace 10 años esta seria una solucion valida.

**Reject** - La funcion esta traduciendo los carateres a una cadena de base64. Esto es encondear y no encriptar, y es facil de decodear. Contraseñas deben ser almacenadas como hashes que no pueden ser decodificados.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/fc8bd39f-da74-46ba-adc6-96579fcd7986)

### **4.4. CryptoManager.js**
**Accept** - AES es un mecanismo de encriptacion fuerte. Implementado en ambos software y hardware, es el protocolo mas robusto de seguridad. Para AES-245 bit, cerca de 2s de poder con 256 intentos son necesario para romperlo. Esto lo hace dificil de hackear. Como resultado es un protocolo seguro.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/933a95d4-2afe-4714-a7eb-08fb87756b18)

## **5.	XXE**

### **5.1. Show Feeds**
**Reject** - EL XML  es enviado por el usuario sin deshabilitar el inline Data Type Definition (DTD) processing y el no entity . Esto no es recomendado, este puede conducir a un XXE en el systema.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/69319da8-39c2-4527-bc16-3d960a191cb2)

## **5.2. Show Feedss**
**Accept** - La configuracion del analizador XML con la opcion noent esta configurada en false. Lo cual previende que se sustituyan identidades o se agreguen. Este es el camino recomendado para deshabilitar el inline Data Type Definition (DTD) processing y por consecuencia mantener el XXE fuera. 

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/cab796a4-11b6-4188-9f50-71e837c681fb)

### **5.3. parseXML**
**Accept** - La aplicación tiene un analisis fuerte de XML deshabilitando el DTD load y ademas removiendo el path del success message, lo que hace a la aplicación mas segura.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/fc746bc2-2602-4a96-a5fc-c0298b3a4e0b)

### **5.4. parsseXML.js**
**Reject** - la aplicación esta configurada de tal manera que permite a los archivos su DTD y Load Entities. Ademas de eso el app esta retornando la ruta de almacenamiento, divulgando informacion. 

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/5b4253b6-6563-4d5d-8550-8b092f470e62)

## **6.	Missing Level Acces Control**

Esta vulnerabilidad ocurre cuando se asume o se configura de forma incorrecta las listas de control de acceso. En el priimer paso las aplicaciones comunmente modifican la interfaz de usuario para remover o ocultar elementos a los cuales el usuario no tiene acceso. Sin embarbo esta es usa presuncion peligrosa ya que se asume que el usuario no tendria acceso a los elemento de UI o enlaces o que no podria invocarlos. Sin embargo identificadores predecibles y estandares convencionales pueden hacer la prediccion de y enumeracion de los elementos ocultos mas facil. Si no se realizan las validaciones del lado del sevidor un atacante puede simplemente acceder a las paginas o rutas y potencialmente ganar acceso privilegiado. En el segundo caso las listas de control de acceso pueden ser malconfiguradas y resultar en un desconfiguracion  con el client-side UI restrictions. Esto puede provocar que funcionalidades que estan deshabilitades en e UI puedan ser invocadas en el server.

### **6.1. RouterPost**
**Reject** - la aplicación no refuerza la validacion de autorizacion para algunas rutas. Las cuales debe ser unicamente disponibles para los admin users. Dejando expuesto a vulnerabilidades de control de accesos. Como resultado de esta vulnerability un atacante  puede simplemente manipular el request

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/07fdb635-53d5-4f19-80e2-d31c809927b4)

**Correccion**
#### **6.1.1 Router.post.js**
![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/22895af2-d513-4561-ac7f-ce24a4cbef08)

### **6.2. Exports.delete.js**
**Reject** - La aplicación puede ser vulnerable si no se utiliza logica de autorizacion configurada a nivel de la fucion, donde se asegura que el usuario puede abrir un archivo que esta asigando exclusivamente a el. En este caso  un atacante que tiene autorizacion. Puede facilmente acceder a los archivos de otros usuarios reemplazando la URL.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/46599c6e-10d5-4ac5-8dd5-df185b80778c)

**Correccion**

#### **6.2.1. Exports.del.js**
Debe haber una logico apara configurar la autorizacion ppara acceder a los archivos basados en el nivel de permiso, el cual debe ser almacenado en la base de datos. Esto previene que atacantes pueden acceder a los archivos de otros usuarios.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/0c9504f2-0346-4978-9d2f-f42d3d801860)

### **6.3. Router.js**

**Reject** - Un atacante pude facilmente cambiar el precio del producto  debido a que no se esta validando para verificar  que usuario esta permitido que actualice los precios del producto. Solo administradores deberian ser capaces de cambiar los precio de los productos.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/e795703e-85eb-437c-98f8-0dc91accefad)

** Correccion**
#### **6.3.1. Route.js**

**Accept** – validar el usuario para el rol requerido de forma que solo usuarios autorizados tengan acceso a esta caracteristica. La autorizacion valida que se desarrolle vasado ene l rol qu el usuario presenta en la sesion. Haciendo casi imposible que se tamperee por un atacante.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/d7a25846-ea53-4d66-b623-1993031a3c02)


## **7.	Insecure Direct Object Reference (IDOR)**

### **7.1. updateCustomerName.js**

**Reject** - usando esta caracteristica un usuario puede ganar acceso a datos sensibles. Los detalle son accesibles badados en el email id almacenado en el request del body, un atacante puede facilmente modificar el parametro de  email ID para enviar otro email ID y ser capaz de ver/modificar datos de otros usuarios sin la autorizacion necesarioa lo que deja la app vulnerable a un IDOR.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/c7fbb6c9-22b5-42e8-9319-ea8ae617900b)


**Correccion**

#### **7.1.1. updateCustomer_Name.js**
El ID se toma de la sesion valida en este caso del token y no del ID en el body.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/43cd237b-c033-4122-b630-cba9f88b03f5)

### **7.2. getCustomerDetails.js**
**Reject** – Los detalles se acceden basao en el e-mail ID almacenado en el request del body, un atacante puede simplemente modificar el ID y enviar otro.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/c29832c4-ffbf-46c5-9d82-0f2ac238f6f9)

**Correccion**

#### **7.2.1. getCustomerDetail.js**
Para evitar el IDOR el identificador del usuario es tomado de la sesion del usuario autenticado. Esta solucion no expone informacin sensible del lado del cliete.
El id se toma del token de sesion y no del id en el body.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/24675860-2ac5-4dbd-835f-4e23ce88a3d6)


### **7.3. Routes.js**
**Reject** – Cuando se agrega o se elimina una leave application, la aplicación topa un user ID mapeado en un form oculto (leaveController.JavaScript: linea 41 y 57 del codigo), el cual puede ser facilmente tampereado por un atacante. 

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/f556a076-05a6-45d9-8376-8af7d0ed49e9)

**Correccion**

#### **7.3.1. Routess.js**
para prevenir IDORs la autorizacion debe validar que el peticion venga de un usuario valido que tenga permiso de enviar requests. Debe buscarse en la fuente el ID en la base de datos en lugar de el nombre de usuario en la solicitud.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/7fafa633-3075-4a9e-aa50-efed745a5d00)

### **7.4. userInfo.js**

**Reject** - Ocurre debido a que la aplicación provee acceso directo a objetos badasdo en una entrada proveida por el usuario.

![image](https://github.com/estrategiayseguridad/Secure-Coding-101/assets/84199034/5f927d14-9317-407f-9548-aa4609d13db0)











