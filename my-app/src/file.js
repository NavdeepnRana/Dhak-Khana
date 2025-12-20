const http=require('http');
const fs=require('fs');

http.createServer((req,res)=>{

    if(req.url=='/'){
        fs.readFile("form.html",'utf-8',(err,data)=>{//this line brings the html in '/'
            if(err){
                res.end("File not Found");
            }
            else{
                res.writeHead(200,{"Content-Type":"text/html"})
                res.write(data);
                res.end();
            }
        })
    }
    else if(req.url=='/submit'){
        res.end("Data added successfully");
    }
    else
    {
        res.end("Invalid Route");
    }


}).listen(3000,()=>{console.log("Listening on PORT: 3001")});