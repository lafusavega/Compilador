import analizador_lexico from "./analizador_lexico.js";
import Queue from "./cola.js";
import ItemLR0 from "./ItemLR0.js"
import Item_Consj from "./Item_Consj.js"
import DescRecGramGram from "./DescRecGramGram.js";
import Inf_IrA from "./Inf_IrA.js";
import eqSet from "./funciones.js";
import ClaseNodo from "./ClaseNodo.js";

export default class AnalizadorLR0{
        ResultIr_A = new Array(100);
        idAutGram;
        DescRecG;
        NumRenglonesIrA;
        LexGram;
        Gram;
        Sigma;
        TablaLR0;
        Vt;//tokens
        Vt2;
        Vt3;//tokens
        Vn;
        V;
        ArchAFDLexiGramGram;

        constructor(CadGramatica,ArchAFDLexic){
                this.Gram = CadGramatica;
                this.DescRecG = new DescRecGramGram(CadGramatica,ArchAFDLexic);
                //this.LexGram = new analizador_lexico(CadGramatica,ArchAFDLexic);
        }
        // SetLexico(ArchAFDLexic){
                // this.LexGram = new analizador_lexico (ArchAFDLexic,5000);
        // }

        CrearTablaLR0(){
                let j;
                let existe;
                let ResultFirst = new Set();
                let ResultFollow = new Set();
                let C = new Set();//Conjuntos Sj LR0
                let ConjSj = new Item_Consj();//Conjuntos Sj
                let ConjAux = new Set();
                let ConjItems = new Set();//Conjunto temporal de Items
                let SjAux = new Set();
                let Q = new Queue();
                this.DescRecG.Analizar_Gramatica();
                this.V = new Set();
                this.V.clear();
                this.DescRecG.Vt.forEach(s => {
                        this.V.add(s);
                });
                this.DescRecG.Vn.forEach(s => {
                        this.V.add(s);
                })
                let arreglovalor = new Array;
                this.V.forEach(v=>{
                        arreglovalor.push(v)
                })
                this.ResultIr_A = new Array(100);
                ConjItems.clear();
                ConjItems.add(new ItemLR0(0,0));
                j = 0;
                ConjSj.Sj =  this.Cerradura_LR0(ConjItems);
                console.log(ConjSj.Sj)
                ConjSj.j = j;
                C.add(ConjSj)
                Q.enqueue(ConjSj);
                this.NumRenglonesIrA = 0;
                this.ResultIr_A[this.NumRenglonesIrA] = new Inf_IrA();
                this.ResultIr_A[this.NumRenglonesIrA].Si = 0;
                this.ResultIr_A[this.NumRenglonesIrA].IrA_Sj = -1;
                this.ResultIr_A[this.NumRenglonesIrA].IrA_Simbolo = "";
                this.ResultIr_A[this.NumRenglonesIrA].ConjuntoItems = this.ObtenerCadenaItems(ConjSj.Sj);
                this.NumRenglonesIrA++;

                j++;
                let b = true;
                let bandera = true;
                while(!(Q.isempty()) && b){
                        ConjSj = Q.dequeue();
                        for (let index = 0; index < arreglovalor.length; index++) {
                                const s = arreglovalor[index];
                                SjAux = this.IrA_LR0(ConjSj.Sj,s);
                                if(SjAux.size == 0)
                                        continue;
                                existe = false;
                                //while(bandera)
                                C.forEach(ElemSj =>{
                                        if(ElemSj.Sj.size == SjAux.size){
                                                console.log(ElemSj.Sj,SjAux)
                                                if(this.setEquals(ElemSj.Sj,SjAux)){
                                                        console.log(ElemSj.Sj,SjAux)
                                                        console.log("si son iguales")
                                                        existe = true;
                                                        this.ResultIr_A[this.NumRenglonesIrA] = new Inf_IrA();
                                                        this.ResultIr_A[this.NumRenglonesIrA].Si = ElemSj.Sj;
                                                        this.ResultIr_A[this.NumRenglonesIrA].IrA_Sj = ConjSj.j;
                                                        this.ResultIr_A[this.NumRenglonesIrA].IrA_Simbolo = s;
                                                        this.ResultIr_A[this.NumRenglonesIrA].ConjuntoItems = this.ObtenerCadenaItems(ConjSj.Sj);
                                                        this.NumRenglonesIrA++;
                                                        j++;
                                                        b= false;
                                                }
                                        }
                                })
                                if(!existe){
                                        console.log("No existe")
                                        let ConjSjAux = new Item_Consj();
                                        ConjSjAux.Sj = SjAux;
                                        ConjSjAux.j = j;
                                        this.ResultIr_A[this.NumRenglonesIrA] = new Inf_IrA();
                                        this.ResultIr_A[this.NumRenglonesIrA].Si = j;
                                        this.ResultIr_A[this.NumRenglonesIrA].IrA_Sj = ConjSj.j;
                                        this.ResultIr_A[this.NumRenglonesIrA].IrA_Simbolo = s;
                                        this.ResultIr_A[this.NumRenglonesIrA].ConjuntoItems = this.ObtenerCadenaItems(SjAux);
                                        this.NumRenglonesIrA++;
                                        j++;
                                        C.add(ConjSjAux);
                                        Q.enqueue(ConjSjAux);
                                }
                        }
                }
                console.log(C);

        }
        setEquals(a,b){
                
        }
        Mover_LR0(C,S){
                let R = new Set();
                let Aux = new ItemLR0();
                let Lista = new Array();
                let N;
                R.clear();
                C.forEach(I=>{
                        Lista = this.DescRecG.ArrReglas[I.NumRegla].ListaLadoDerecho;
                        if(I.Pospunto < Lista.length){
                                N = Lista[I.Pospunto];
                                if(N.Simbolo == S)
                                        R.add(new ItemLR0(I.NumRegla, I.Pospunto + 1));
                        }
                })
                return R;
        }

        Cerradura_LR0(C){
                let R = new Set();
                let Temporal = new Set();
                let Aux = new ItemLR0();
                let Lista = new Array();
                let N;
                R.clear();

                if(C.size == 0){
                        return R;
                }
                C.forEach(element => {
                        R.add(element);
                });
                Temporal.clear();
                C.forEach(I=>{
                        Lista = this.DescRecG.ArrReglas[I.NumRegla].ListaLadoDerecho;
                        if(I.Pospunto < Lista.length){
                                N = Lista[I.Pospunto];
                                if(!(N.es_terminal))
                                        for(let k = 0; k< this.DescRecG.NumReglas; k++){
                                                if(this.DescRecG.ArrReglas[k].InfSimbolo.Simbolo == N.Simbolo){
                                                        Aux = new ItemLR0(k,0);
                                                        if(!(this.C_contiene(C,Aux))){
                                                                Temporal.add(Aux);
                                                        }
                                                                
                                                }
                                                
                             
                                        }
                                
                        }
                })
                this.Cerradura_LR0(Temporal).forEach(e=>{
                        R.add(e);
                })
                return R;

        }
        C_contiene(C,Aux){
                let bandera = false;
                C.forEach(I=>{
                        if((I.NumRegla == Aux.NumRegla)) 
                                if((I.Pospunto == Aux.Pospunto)){
                                        bandera = true;
                                        return bandera;
                                }
                })
                return bandera;
        }

        IrA_LR0(C,Simbolo){
                let R = new Set();
                R = this.Cerradura_LR0(this.Mover_LR0(C,Simbolo));
                return R;
        }
        ObtenerCadenaItems(C){
                let R = "";
                let Item_string;
                let Lista = new Array();
                if(C.size == 0)
                        return R;
                
                C.forEach(I=>{
                        Item_string = this.DescRecG.ArrReglas[I.NumRegla].InfSimbolo.Simbolo + "->";
                        Lista = this.DescRecG.ArrReglas[I.NumRegla].ListaLadoDerecho;
                        for(let i=0;i<Lista.length;i++){

                        }
                })
                return "nada"

        }
}