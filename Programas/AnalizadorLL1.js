import DescRecGramGram from "./DescRecGramGram.js";
import analizador_lexico from "./analizador_lexico.js";
import Queue from "./cola.js";
import terminales from "./terminales.js"
import Stack from "./pila.js";
export default class AnalizadorLL1{
        arregloterminales;
        Tabla = new Array();//Tabla que muestra las transiciones hacia que numero de regla 
        Tablamuestra_resultados = new Array();// Tabla que muestra los rsultados del analisis de la cadena
        cadena;//Cadena que sera analizada
        idAutGram;//Esta cosa no la uso 
        DescRecG;//Uso el descenso recursivo
        LexGram;//Analizador lexico que obtiene los tokens
        analizador_lexico_aux;//Analizador lexico que se usara para analizar las cadenas
        Gram;//Gramatica que se usara
        Sigma;//No la uso
        TablaLR0;//esta tampoco
        Vtt;//tokens
        Vt = new Set();//conjunto de los terminales
        Vnt;//tokens
        Vn = new Set();//Conjuntos de los no terminales
        V = new Set();//uniones de los terminales y no terminales
        ArchAFDLexiGramGram;//Tampoco la uso
        constructor(CadGramatica,ArchAFDLexic){
                this.Gram = CadGramatica;
                this.DescRecG = new DescRecGramGram(CadGramatica,ArchAFDLexic);
        }
        SetLexico(cadena,afdlexico){
                this.LexGram = new analizador_lexico (cadena,afdlexico);
                this.analizador_lexico_aux = new analizador_lexico(cadena,afdlexico);
        }
        CrearTablaLL1(){//Se crea solo la tabla ll1
                let resultfirst = new Set();
                let resultfollow = new Set();
                resultfirst.clear();
                resultfollow.clear();
                this.arregloterminales = new Array(this.DescRecG.Vt.size);//Declaro un arreglo con los puros terminales
                this.DescRecG.Analizar_Gramatica();//Analizo la gramatica
                this.DescRecG.Vt.forEach(v=>{
                        this.arregloterminales.push(new terminales(v,0));//Se agreagn los terminales con valor inicial 0
                })
                this.arregloterminales.push(new terminales("$","0"));//Al final agrego $ como terminal
                this.DescRecG.Vt.forEach(s => {
                        this.V.add(s);
                        this.Vt.add(s);
                });
                console.log(this.DescRecG.Vt)
                this.DescRecG.Vn.forEach(s => {
                        this.V.add(s);
                        this.Vn.add(s)
                })
                //Aqui por cada calor no terminal se crea una arreglo del tamaño de los terminales 
                // E terminal1 terminal2 terminal3 terminal 4...
                //Ep Terminal1 terminal2 terminal3 terminal 4...
                //T Terminal1 terminal2 terminal3 terminal 4...
                this.DescRecG.Vn.forEach(vtn=>{
                        let fila = new Array(this.DescRecG.Vt.size+2);
                        fila.fill(-1,0,fila.length);//Se inicializa con -1
                        fila[0] = vtn;//en la posicion 0 se escribe el no terminal 
                        this.Tabla.push(fila);//Los voy agreagando a mi tabla LL1
                })
                //Saco los conjuntos al usar fist y follow
                for(let i = 0;i<this.DescRecG.ArrReglas.length;i++){
                        if(this.DescRecG.ArrReglas[i] != undefined){

                                resultfirst = this.DescRecG.First(this.DescRecG.ArrReglas[i].ListaLadoDerecho);//Primero saco el first
                                console.log(this.DescRecG.ArrReglas[i].ListaLadoDerecho)
                                if(resultfirst.has("epsilon")){//Si el First tiene un epsilon entonces le saco el follow
                                        resultfollow = this.DescRecG.Follow(this.DescRecG.ArrReglas[i].InfSimbolo.Simbolo);
                                        console.log(resultfollow);
                                        this.llenaTabla(resultfollow,i,this.DescRecG.ArrReglas[i].InfSimbolo.Simbolo);//Llena la tabla Tabla con el conjunto resultante, el indice dela regla y el simbolo
                                }
                                else{
                                        this.llenaTabla(resultfirst,i,this.DescRecG.ArrReglas[i].InfSimbolo.Simbolo);//Llena la tabla Tabla con el conjunto resultante, el indice dela regla y el simbolo
                                        console.log(resultfirst)
                                }
                        }
                       else{
                                break;
                       }
                }
        }
        llenaTabla(C,NumRegla,Regla){
                C.forEach(result=>{//Analizo cada simbolo del conjunto
                        let j = this.obtenerIndice(result);//Esta funcion obtiene el indice de los terminales es decir las filas
                        for(let i = 0;i<this.Tabla.length;i++){
                                if(Regla == this.Tabla[i][0]){
                                        this.Tabla[i][j+1] = NumRegla + 1;//Se le pone un mas uno ya que la primera posicion la ocupnas lo no terminales y Num regla inicia desde 0 asi que por eso le aumento uno
                                }
                        }
                })
        }
        obtenerIndice(Simbolo){
                for(let i = 0;i<this.arregloterminales.length;i++){
                        if(Simbolo == this.arregloterminales[i].simbolo){
                                return i;
                        }
                }
                return -1;
        }
        Analiza_cadena(){
                let cadenapila;//La cadena del estado de la pila
                let cadenareglas;//Cadena de la regla que se obtuvo la tansicion
                let cadenaresult;//Cadena del estado de la cadena que analizamos
                let colacadena = new Queue();//Cola que tiene cada uno de los lexemas que se esta analizando
                let pila = new Stack();//Pila que contiene las reglas
                let pila_aux = new Stack();//Pila auxiliar para guardar en la pila de forma inversa
                pila.push("$");//Añado el $ y la E para empezar a analizar la cadena
                pila.push("E");
                while(true){//Guardo lexema por lexema en colacadena para ir eliminando cada uno cuando se obtenga un pop
                        let token = this.LexGram.yylex();
                        if(token == 0){
                                colacadena.enqueue("$");//Al final de la cola añado $
                                break;
                        }
                        colacadena.enqueue(this.LexGram.Lexema);  
                }
                let token = this.analizador_lexico_aux.yylex();//Analizador lexico que nos ayudara a recorrer la cadena 
                let bandera = true;//bandera para salir del bucle infinito
                while(bandera){
                        cadenareglas = "";//Se inicializa en blanco por que cada renglon se obtiene una regla nueva
                        cadenapila = this.imprimircontenidopila(pila);//Sirve para obtener en formato string el estado de la pila
                        cadenaresult = this.imprimircontenidocola(colacadena);//Sirve para obtener en formato string el estado de la cola
                        if(token == 20000){
                                alert("La cadena es sintacticamente incorrecta")
                                bandera = false;
                        }
                         //Por medio de la interfaz le guardo los token a cada terminal
                         //Lo recorre y los compara        
                        for(let i = 0; i<this.arregloterminales.length;i++){
                                if(token == this.arregloterminales[i].token){
                                        //Si si encuentra el token asociado se saca el tope de la pila es decir E por ejemplo
                                        let fila = pila.pop();
                                        console.log(fila)
                                        if(this.esterminal(fila)){//Checa si es terminal, si no lo es continua
                                                //Si si es terminal entonces saca de la cola el primer elemento es decir 2.42
                                                colacadena.dequeue();
                                                this.creatablaresult(cadenaresult,cadenapila,"pop");//Esta tabla muestra la fila de los resultados
                                                token = this.analizador_lexico_aux.yylex();//pide otro token para recorrer el lexema
                                                continue;    
                                        }else if(fila == "epsilon"){//Si es epsilon simplemente es como hacer un pop pero no saca nada de la colacadena
                                                this.creatablaresult(cadenaresult,cadenapila,"pop");
                                                continue;
                                        }
                                        else if(fila =="$"){//Si es $ checa si es final 
                                                if(this.esfinal(fila,colacadena)){
                                                        alert("Cadena Aceptada")
                                                        this.creatablaresult(cadenaresult,cadenapila,"Aceptar");
                                                        bandera = false;
                                                }
                                        }else if(fila == undefined){//Si no obtuvo alguna transicion en por que hubo unerror
                                                alert("La cadena es sintacticamente incorrecta")
                                                bandera = false;
                                        }
                                        else{
                                                let renglon = this.obtenerfila(fila);//Le envio como parametro el valor no terminal es decir E y checha en la tabla Tabla que posicion le corresponde
                                                console.log(renglon)
                                                let col = this.obtenerIndice(this.arregloterminales[i].simbolo);//Le envio como parametro el valor terminal para que ver el indice en el que se encutra en arreglo terminales
                                                console.log(col)
                                                let num_regla = this.Tabla[renglon][col+1];//Veo a que regla a punta
                                                console.log(num_regla)
                                                if(num_regla == -1){
                                                        alert("La cadena es sintacticamente incorrecta");
                                                        bandera = false;
                                                }
                                                this.DescRecG.ArrReglas[num_regla-1].ListaLadoDerecho.forEach(n=>{// Obtengo mi regla del lado derecho y cada simbolo lo concateno a la cadena pila
                                                        cadenareglas = cadenareglas + n.Simbolo;
                                                        pila_aux.push(n.Simbolo);
                                                })
                                                this.creatablaresult(cadenaresult,cadenapila,cadenareglas);
                                                while(!pila_aux.isEmpty()){
                                                        pila.push(pila_aux.pop());
                                                }
                                                continue;       
                                        }
                                        
                                }
                        
                        }
                }
                console.log(this.Tablamuestra_resultados);
                
        }
        obtenerfila(NT){
                for(let i = 0;i<this.Tabla.length;i++){
                        if(this.Tabla[i][0] == NT)
                                return i;
                }
        }
        imprimircontenidopila(pila){
                let pilaaux = new Stack()
                let contenidopila = "";
                while(!(pila.isEmpty())){
                        pilaaux.push(pila.pop());
                }
                while(!(pilaaux.isEmpty())){
                        let dato = pilaaux.pop();
                        contenidopila = contenidopila + dato;
                        pila.push(dato);
                }
                return contenidopila;
        }
        imprimircontenidocola(cola){
                let colaaux = new Queue();
                let contenidocola = "";
                while(cola.size() != 0){
                        colaaux.enqueue(cola.dequeue());
                }
                while(!colaaux.isempty()){
                        let dato = colaaux.dequeue();
                        contenidocola = contenidocola + dato;
                        cola.enqueue(dato);
                }
                return contenidocola;
        }
        esterminal(simbolo){
                let bandera = false;
                this.Vt.forEach(v =>{
                        if(v == simbolo){
                                bandera = true;
                        }           
                })
                return bandera;
        }
        creatablaresult(c1,c2,c3){
                let renglontabla = new Array(3);
                renglontabla[0] = c2;
                renglontabla[1] = c1;
                renglontabla[2] = c3;
                this.Tablamuestra_resultados.push(renglontabla);
        }
        esfinal(simbolo,cola){
                let dato = cola.dequeue();
                if(simbolo == dato && cola.empty)
                        return true;
                return false;
        }
}