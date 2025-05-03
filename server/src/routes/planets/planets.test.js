require('dotenv').config()
const request = require('supertest');
const app = require('../../app');
const { mongoConnect , mongoDisconnect } = require('../../services/mongo');
const { loadPlanetData } = require('../../models/planets.model');
const { loadLaunchesData } = require('../../models/launch.model');

describe('TEST API planets' , () => {
    
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
                .get('/v1/planets')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });    
})
