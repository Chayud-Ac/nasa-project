const request = require('supertest');
const app = require('../../app');
const { mongoConnect } = require('../../services/mongo')

describe('TEST API planets' , () => {
    
    beforeAll(async () => {
        await mongoConnect();
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
