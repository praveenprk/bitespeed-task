const http = require('http');
const url = require('url');
const { identifyHandler } = require('./identify');

const PORT = 3000;

const server = http.createServer((req, res) => {

  if (req.url === '/') {
    res.write(JSON.stringify({
        company: 'BiteSpeed',
        task_type: 'Backend',
        desc: 'Identity Reconcilation Project'
    }));
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/identify') {
    let details = '';
    req.on('data', chunk => {
      details += chunk.toString();
    });

    req.on('end', () => {
      const data = JSON.parse(details);
      console.log(`data from index:`, data);
      return;
    });
    
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Not Found' }));
    return;
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
