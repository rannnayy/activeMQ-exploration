var stompit = require('stompit');

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

const specialists = [
    'ophthalmologist',
    'physician',
    'pediatrician',
]

channelFactory.channel(function(error, channel) {
  
    if (error) {
        console.log('channel factory error: ' + error.message);
        return;
    }
    
    fetch(`http://localhost:9091/pineValley/doctors/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "doctorType": 'ophthalmologist',
        })
    })
    .then(res => res.json())
    .then(data => {
        for (let i = 0; i < data['doctors']['doctor'].length; i++) {
            var body = JSON.stringify({
                name: data['doctors']['doctor'][i].name,
                time: data['doctors']['doctor'][i].time,
                hospital: data['doctors']['doctor'][i].hospital
            });

            channel.send({
                'destination': `/queue/pineValley-ophthalmologist`,
                'persistent': 'true',
            }, body, function(error){
                if (error) {
                    console.log('send error: ' + error.message);
                    return;
                } else {
                    console.log(`Sent message ophthalmologist to /queue/pineValley-ophthalmologist`);
                }
            })
        };
    })
    .catch(err => { console.log(err) });
    
    fetch(`http://localhost:9091/pineValley/doctors/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "doctorType": 'physician',
        })
    })
    .then(res => res.json())
    .then(data => {
        for (let i = 0; i < data['doctors']['doctor'].length; i++) {
            var body = JSON.stringify({
                name: data['doctors']['doctor'][i].name,
                time: data['doctors']['doctor'][i].time,
                hospital: data['doctors']['doctor'][i].hospital
            });

            channel.send({
                'destination': `/queue/pineValley-physician`,
                'persistent': 'true',
            }, body, function(error){
                if (error) {
                    console.log('send error: ' + error.message);
                    return;
                } else {
                    console.log(`Sent message physician to /queue/pineValley-physician`);
                }
            })
        };
    })
    .catch(err => { console.log(err) });

    fetch(`http://localhost:9091/pineValley/doctors/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "doctorType": 'pediatrician',
        })
    })
    .then(res => res.json())
    .then(data => {
        for (let i = 0; i < data['doctors']['doctor'].length; i++) {
            var body = JSON.stringify({
                name: data['doctors']['doctor'][i].name,
                time: data['doctors']['doctor'][i].time,
                hospital: data['doctors']['doctor'][i].hospital
            });

            channel.send({
                'destination': `/queue/pineValley-pediatrician`,
                'persistent': 'true',
            }, body, function(error){
                if (error) {
                    console.log('send error: ' + error.message);
                    return;
                } else {
                    console.log(`Sent message pediatrician to /queue/pineValley-pediatrician`);
                }
            })
        };
    })
    .catch(err => { console.log(err) });
});