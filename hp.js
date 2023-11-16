var stompit = require('stompit');
var prompt = require('prompt-sync')();
var specialist = prompt("Inquired doctor's specialist? ");

if (specialist.toLowerCase() === "ophthalmologist" || specialist.toLowerCase() === "physician" || specialist.toLowerCase() === "pediatrician") {
    var servers = [
        { 
            host: 'localhost',
            port: 61613,
            connectHeaders:{
                'host': 'localhost',
                'login': 'admin',
                'passcode': 'admin',
            }
        }
    ];

    var connections = new stompit.ConnectFailover(servers);

    connections.on('connecting', function(connector) {
        var address = connector.serverProperties.remoteAddress.transportPath;
        
        console.log('Connecting to ' + address);
    });

    connections.on('error', function(error) {
    
        var connectArgs = error.connectArgs;
        var address = connectArgs.host + ':' + connectArgs.port;
        
        console.log('Connection error to ' + address + ': ' + error.message);
    });

    var channelFactory = new stompit.ChannelFactory(connections);

    var doctorsListGrandOak = new Set();
    var doctorsListPineValley = new Set();

    var GrandOakOnce = false;
    var PineValleyOnce = false;

    channelFactory.channel(function(error, channel) {
    
        if (error) {
            console.log('channel factory error: ' + error.message);
            return;
        }
        
        var headersGrandOak = {
            destination: `/queue/grandOak-${specialist}`,
            'ack': 'client',
            // 'selector': `key = '${specialist.toLowerCase()}'`
        };

        if (GrandOakOnce === false) {
            channel.subscribe(headersGrandOak, function(error, message, subscription){
                console.log()
                if (error) {
                    console.log('subscribe error: ' + error.message);
                    return;
                }
                
                message.readString('utf8', function(error, string) {
                    if (error) {
                        console.log('read message error: ' + error.message);
                        return;
                    }
                    doctorsListGrandOak.add(JSON.parse(string));
                });
    
                message.on('end', function(){
                    console.log(doctorsListGrandOak.values());
    
                    GrandOakOnce = true;
                });
            });
        }
        
        // Pine Valley
        var headersPineValley = {
            'destination': `/queue/pineValley-${specialist}`,
            'ack': 'client',
            // 'selector': `key = '${specialist.toLowerCase()}'`
        };

        if (PineValleyOnce === false) {
            channel.subscribe(headersPineValley, function(error, message, subscription){
            
                if (error) {
                    console.log('subscribe error: ' + error.message);
                    return;
                }
                
                message.readString('utf8', function(error, string) {
                    if (error) {
                        console.log('read message error: ' + error.message);
                        return;
                    }
                    doctorsListPineValley.add(JSON.parse(string));
                });
                
                message.on('end', function(){
                    console.log(doctorsListPineValley.values());
    
                    PineValleyOnce = true;
                });
            });
        }
    });
};