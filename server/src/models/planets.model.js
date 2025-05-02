const { parse } = require('csv-parse');
const path = require('path')
const fs = require('fs');
const planets = require('./planets.mongo')


function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36
        && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6;
}

function loadPlanetData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', '/data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => { // trigger when the data event occur meaning each row of csv
                if (isHabitablePlanet(data)) {
                    // TODO: Replace the create with upsert to prevernt repeating create the data wehn starting the server insert + update = upsert
                    savePlanet(data)
                }
            })
            .on('error', (err) => { // trigger when err event occur
                console.log(err);
                reject(err);
            })
            .on('end', async () => { // trigger when the end event occur
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`${countPlanetsFound}: habitable plannets are founded!`)
                resolve();
            });
    })
}

async function getAllPlanets() {
    return await planets.find({}, {
        '__v': 0,
        '_id': 0
    });
}

async function savePlanet(data) {
    try {
        await planets.updateOne({
            keplerName: data.kepler_name,
        }, {
            keplerName: data.kepler_name
        }, {
            upsert: true,
        })
    } catch (err) {
        console.error(`Could not save planet ${err}`)
    }
}

module.exports = {
    loadPlanetData,
    getAllPlanets
}