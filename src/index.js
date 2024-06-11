const http = require('http');

const server = http.createServer((req, res) => {
    
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            data: 'Bite Speed - Backend Task Identity Reconciliation!',
        }));
        return;
    }

    if (req.url === '/identify') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({data: 'identify api'}));
        res.end();
        return;
    }
  });
  
  server.listen(8000);