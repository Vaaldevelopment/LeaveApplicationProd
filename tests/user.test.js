const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const today = new Date()
const currentYear = today.getFullYear()


const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    employeeCode: 'VT_001',
    firstName: 'firstName',
    lastName: 'Lastname',
    password: 'Pass123',
    email: 'pass@gmail.com',
    managerEmployeeCode: 'VT100',
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}

const newUser = {
    employeeCode: 'VT_002',
    firstName: 'Sonali',
    lastName: 'Konge',
    password: 'Sonali123',
    email: 'sonali@gmail.com',
    managerEmployeeCode: 'VT10',
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
}

const anotherUserId = new mongoose.Types.ObjectId()
const anotherUser = {
    _id: anotherUserId,
    employeeCode: 'VT_003',
    firstName: 'firstName',
    lastName: 'Lastname',
    password: 'Pass123',
    email: 'another@gmail.com',
    managerEmployeeCode: 'VT100',
    isHR: false,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: anotherUserId }, process.env.JWT_SECRETKEY)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(user).save()
    await new User(anotherUser).save()
})


test('Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password
    }).expect(200)
    const existingUser = await User.findById(userId)
    expect(response.body.token).toBe(existingUser.tokens[1].token)
})

test('Login as user, HR', async () => {
    const response = await request(app).post(`/users/login?requestedBy=${userId}`).send({
        email: user.email,
    }).expect(200)
    const existingUser = await User.findById(userId)
    expect(response.body.token).toBe(existingUser.tokens[1].token)
})

test('Login as user, not HR', async () => {
    const response = await request(app).post(`/users/login?requestedBy=${anotherUserId}`).send({
        email: user.email,
    }).expect(401)
    // const existingUser = await User.findById(userId)
    // expect(response.body.token).toBe(existingUser.tokens[1].token)
})

test('Login as user throught HR', async () => {
    const response = await request(app).post(`/users/login?requestedBy=${userId}`).send({
        email: user.email,
    }).expect(200)
    const existingUser = await User.findById(userId)
    expect(response.body.token).toBe(existingUser.tokens[1].token)
})


test('Should not login while incorrect password', async () => {
    const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password + 'k'
    }).expect(401)
    const existingUser = await User.findOne({ email: user.email, password: user.password + 'k' })
    expect(existingUser).toBeNull()
})

test('Logout user', async () => {

    const token = user.tokens[0].token
    const response = await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200)

    const logoutUser = await User.findById(userId)
    expect(logoutUser.tokens.length).toEqual(0)
})

// test('Get user profile', async () => {
//     const response = await request(app)
//         .get('/users/me')
//         .set('Authorization', `Bearer ${user.tokens[0].token}`)
//         .send()
//         .expect(200)
// })

// test('Should not get profile for unauthenticated user', async() => {
//     const response = await request(app)
//         .get('/users/me')
//         .send()
//         .expect(401)
// })
