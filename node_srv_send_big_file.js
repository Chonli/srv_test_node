var net = require('net');
const fs = require('fs');

const file_send = 'file_to_send';

var server = net.createServer();
server.on('connection', handleConnection);

server.listen(1234, "0.0.0.0", function() {
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    console.log('Connection data from %s: %j', remoteAddress, d);
  }

  function onConnClose() {
    console.log('Connection from %s closed', remoteAddress);
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }

  //send file to client
  var total_length = fs.statSync(file_send).size;
  var read_length = 0;
  var read_index = 0;
  var fileStream = fs.createReadStream(file_send);
  fileStream.on('error', function(err) {
    console.log(err);
    conn.end();
  });

  fileStream.on('data', (chunk) => {
    read_length += chunk.length;
    console.log(`${++read_index} - read ${read_length} bytes of ${total_length}.`);
  });

  fileStream.on('open', function() {
    fileStream.pipe(conn);
  });

  fileStream.on('end', function() {
    console.log(`End to send file ${file_send}`);
  });
}
