module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
}

// yaha isme ek function dusra function return krta h