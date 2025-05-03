// this launches api test using jest framework with supertest to test the apis
require('dotenv').config()
const request = require('supertest');
const app = require('../../app');
const { mongoConnect , mongoDisconnect } = require('../../services/mongo')
const { loadPlanetData } = require('../../models/planets.model');
const { loadLaunchesData } = require('../../models/launch.model');

describe('Launches API', () => {

    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetData();
        await loadLaunchesData();
    })

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test GET/launches', () => {
        test('It should response with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    describe('Test POST/launches', () => {
        const completeLaunchData = {
            mission: 'USS Enterprice',
            rocket: 'Kepler-296 f',
            target: 'Kepler-296 f',
            launchDate: 'January 4, 2028',
        }

        const launchDataWithoutDate = {
            mission: 'USS Enterprice',
            rocket: 'Kepler-296 f',
            target: 'Kepler-296 f',
        }

        const launcDataWithInCorrectDate = {
            mission: 'USS Enterprice',
            rocket: 'Kepler-296 f',
            target: 'Kepler-296 f',
            launchDate: 'Jasdfasdfasdfasd',
        }


        test('It should catch missing required properties', async () => {

            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400)

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property',
            })
        });
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launcDataWithInCorrectDate)
                .expect(400)

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        });

        test('it should response with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate)
        })
    })
})
