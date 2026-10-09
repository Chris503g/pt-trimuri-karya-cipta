/* TKC local preview server: Node.js built-ins only (no npm install). */
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".pdf":"application/pdf",".ico":"image/x-icon"};
http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const filePath = path.resolve(ROOT,"."+ (pathname==="/"?"/index.html":pathname));
  if (filePath!==ROOT && !filePath.startsWith(ROOT+path.sep)) {res.writeHead(403);res.end("Forbidden");return;}
  fs.stat(filePath,(err,stats)=>{
    if (err||!stats.isFile()){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end("Not Found");return;}
    res.writeHead(200,{"content-type":mime[path.extname(filePath).toLowerCase()]||"application/octet-stream","X-Content-Type-Options":"nosniff"});
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT,"127.0.0.1",()=>console.log("TKC Coding Alpha 1 preview: http://localhost:"+PORT));
