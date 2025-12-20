const ex=express();

ex.get('/',(req,res)=>{
    res.send("Welcome to home page 123");

    ex.get("/home",(req,res)=>{
        res.redirect("/user")
    })
});