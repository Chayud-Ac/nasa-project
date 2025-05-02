const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
    console.log('Downloading launch data from SPACEX_API');
    try {
        const response = await fetch(SPACEX_API_URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'query': {},
                'options': {
                    'populate': [
                        {
                            'path': 'rocket',
                            'select': {
                                'name': 1
                            }
                        },
                        {
                            'path': 'payloads',
                            'select': {
                                'customers': 1
                            }
                        },
                    ],
                    'pagination': false
                }
            })
        })
        if (!response.ok) {
            throw new Error(`Bad status ${response.status}`);
        }
        const data = await response.json()
        const launchesData = data.docs

        launchesData.forEach(async (item, index) => {
            const payloads = item.payloads;
            const customers = payloads.flatMap((payload) => {
                return payload['customers'];
            })
            const launch = {
                flightNumber: item.flight_number,
                mission: item.name,
                rocket: item.rocket.name,
                launchDate: item.date_local,
                target: 'Kepler-442 b',
                customers,
                upcoming: item.upcoming,
                success: item.success,
            }
            await saveLaunch(launch);
        })

    } catch (err) {
        console.error(err.message);
    }
}


async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })
    if (firstLaunch) {
        console.log('Launch Data from the spacex already exist in database');
    } else {
        await populateLaunches();
    }
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne({})
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    })
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}


async function existsLaunchWIthId(launchId) {
    const existLaunch = await findLaunch({
        flightNumber: launchId
    })
    return existLaunch;
}

async function getAllLaunches(skip, limit) {
    return await launches
        .find({}, {
            '__v': 0,
            '_id': 0
        })
        .sort({
            flightNumber : 1
        })
        .limit(limit)
        .skip(skip)
}

async function scheduleNewLaunch(launch) {

    const planet = await planets.findOne({
        keplerName: launch.target,
    })

    if (!planet) {
        throw new Error('No matching planet founded')
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to mastery', 'NASA'],
        flightNumber: newFlightNumber,
    })

    await saveLaunch(newLaunch)
}

async function abortLaunchById(launchId) {
    const aborted = await launches.findOneAndUpdate({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    })
    console.log(aborted)
    return aborted
}

module.exports = {
    getAllLaunches,
    existsLaunchWIthId,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchesData
}