class WebSocketEngine {

    constructor() {

        this.connectedClients = [];
    }

    initialize(io) {

        io.on('connection', socket => {

            console.log(
                `Client connected : ${socket.id}`
            );

            this.connectedClients.push(socket.id);

            socket.emit(
                'system-message',
                {
                    type: 'SYSTEM',
                    message:
                        'Connected to Maritime AI Intelligence Stream',
                    timestamp:
                        new Date().toISOString()
                }
            );

            socket.on('disconnect', () => {

                console.log(
                    `Client disconnected : ${socket.id}`
                );

                this.connectedClients =
                    this.connectedClients.filter(
                        client => client !== socket.id
                    );
            });
        });

        this.startLiveBroadcast(io);
    }

    startLiveBroadcast(io) {

        setInterval(() => {

            const livePayload = {

                timestamp:
                    new Date().toISOString(),

                marketSentiment:
                    Math.random() > 0.5
                        ? 'BULLISH'
                        : 'STABLE',

                congestionLevel:
                    Math.random() > 0.7
                        ? 'HIGH'
                        : 'MEDIUM',

                weatherRisk:
                    Math.random() > 0.8
                        ? 'HIGH'
                        : 'LOW',

                operationalEfficiency:
                    `${88 + Math.floor(Math.random() * 10)}%`,

                activeVessels:
                    3 + Math.floor(Math.random() * 5),

                alerts: [

                    'Bay of Bengal weather monitoring active',

                    'Singapore congestion under observation',

                    'Bunker market volatility detected'
                ]
            };

            io.emit(
                'live-intelligence',
                livePayload
            );

        }, 10000);
    }
}

module.exports = new WebSocketEngine();