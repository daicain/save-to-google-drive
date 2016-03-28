var Socket = function (app, io) {

        io.on('connection', function (client) {
            var remote = client.handshake;
            console.log('A client has been connected IP: ' + remote.address + " On: " + remote.time + " Platform: " + remote.headers['user-agent']);
            clientLists.push(client);
            client.emit('takeYourToken',{token:client.id});

            client.on('disconnect', function () {
                var indexOf = clientLists.indexOf(client);
                clientLists.splice(indexOf, 1);
                console.log('1 Client has been disconnected, ' + clientLists.length + " still connected");
            });
        });

}
module.exports = Socket;