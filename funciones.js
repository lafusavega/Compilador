

export default function eqSet(as, bs) {
    let bandera =  true;
        as.forEach(e=>{
            if(!bs.has(e)){
                bandera = false;
                return bandera;
            }   
        })
        bs.forEach(e=>{
            if(!as.has(e)){
                bandera = false;
                return bandera;
            }        
        })
        return bandera;
    }