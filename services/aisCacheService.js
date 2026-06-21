const WebSocket = require('ws');

class AISCacheService {

    constructor() {
        this.vessels = [];
        this.connected = false;
        this.socket = null;
    }

    start() {

        if (this.connected) {
            return;
        }

        console.log('Starting AIS Cache Service...');

        this.socket = new WebSocket(
            'wss://stream.aisstream.io/v0/stream'
        );

        this.socket.on('open', () => {

            this.connected = true;

            console.log('AIS Cache Connected');

            this.socket.send(
                JSON.stringify({
                    APIKey: process.env.AIS_API_KEY,
                    BoundingBoxes: [
                        [
                            [5.0, 60.0],
                            [35.0, 100.0]
                        ]
                    ]
                })
            );

        });

        this.socket.on('message', (data) => {
	console.log('AIS MESSAGE ARRIVED');
            console.log(
                'RAW AIS MESSAGE:',
                data.toString().substring(0, 2000)
            );

            try {

                const message =
                    JSON.parse(data.toString());

                console.log(
                    'RECEIVED AIS MESSAGE'
                );

                if (message.MetaData) {

                    console.log(
                        'AIS CACHE UPDATED:',
                        message.MetaData.ShipName || 'UNKNOWN'
                    );

                    this.vessels = [
                        {
                            name: message.MetaData.ShipName
                                ? message.MetaData.ShipName.trim()
                                : 'UNKNOWN',

                            mmsi:
                                message.MetaData.MMSI,

                            latitude:
                                message.MetaData.latitude,

                            longitude:
                                message.MetaData.longitude,

                            provider:
                                'AISSTREAM',

                            navigationStatus:
                                'LIVE'
                        }
                    ];

                }

            } catch (error) {

                console.log(
                    'AIS Cache Parse Error:',
                    error.message
                );

            }

        });

        this.socket.on('error', (error) => {

            console.log(
                'AIS Cache Error:',
                error.message
            );

        });

        this.socket.on('close', () => {

            console.log(
                'AIS Cache Disconnected'
            );

            this.connected = false;

        });

    }

   getVessels() {

    console.log(
        'CACHE CONTENT:',
        JSON.stringify(this.vessels, null, 2)
    );

    return this.vessels;

}

}

module.exports =
new AISCacheService();