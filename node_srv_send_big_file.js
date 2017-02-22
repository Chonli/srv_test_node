var net = require('net');
const fs = require('fs');
var timestamp = require('console-timestamp');

const file_send = 'file_to_send';

var server = net.createServer();
server.on('connection', handleConnection);

server.listen(5000, "0.0.0.0", function() {
  console.log('DD-MM-YY hh:mm:ss : '.timestamp + 'server listening to %j', server.address());
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('DD-MM-YY hh:mm:ss : '.timestamp + 'new client connection from %s', remoteAddress);

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    console.log('Connection data from %s: %j', remoteAddress, d);
  }

  function onConnClose() {
    console.log('DD-MM-YY hh:mm:ss : '.timestamp + 'Connection from %s closed', remoteAddress);
  }

  function onConnError(err) {
    console.log('DD-MM-YY hh:mm:ss : '.timestamp + 'Connection %s error: %s', remoteAddress, err.message);
  }

  //send file to client
  var total_length = fs.statSync(file_send).size;
  var read_length = 0;
  var read_index = 0;
  var fileStream = fs.createReadStream(file_send);
  fileStream.on('error', function(err) {
    console.log('DD-MM-YY hh:mm:ss'.timestamp + err);
    conn.end();
  });

  fileStream.on('data', (chunk) => {
    read_length += chunk.length;

    console.log(`${++read_index} - ` + 'DD-MM-YY hh:mm:ss : '.timestamp + ` - read ${read_length} bytes of ${total_length}.`);
  });

  fileStream.on('open', function() {
	console.time('Send time');
    fileStream.pipe(conn);
  });

  fileStream.on('end', function() {
	console.timeEnd('Send time');
    console.log('DD-MM-YY hh:mm:ss : '.timestamp + `End to send file ${file_send}`);
  });
}
