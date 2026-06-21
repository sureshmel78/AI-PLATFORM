const aisCacheService =
require('../services/aisCacheService');

class AISProvider {

    constructor() {

        this.provider =
        'AISSTREAM';

    }

    /*
    ====================================================
    LIVE VESSELS
    ====================================================
    */

    async getLiveVessels() {

        const vessels =
        aisCacheService.getVessels();

        console.log(
            'AIS PROVIDER VESSELS:',
            JSON.stringify(vessels, null, 2)
        );

        if (
            vessels &&
            vessels.length > 0
        ) {

            return vessels;

        }

        console.log(
            'AIS PROVIDER USING FALLBACK'
        );

        return this.getFallbackData();

    }

    /*
    ====================================================
    FALLBACK
    ====================================================
    */

    getFallbackData() {

        return [

            {

                name: 'MSC MARINA',

                vesselType: 'Container',

                speed: 15.2,

                destination: 'Singapore',

                eta:
                new Date(
                    Date.now() + 42 * 60 * 60 * 1000
                ).toISOString(),

                navigationStatus: 'FALLBACK',

                provider: 'LOCAL'

            }

        ];

    }

}

module.exports =
new AISProvider();