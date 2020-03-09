'use strict';
global.testMode = true;
const chai = require('chai');
const chatHttp = require('chai-http');
require('chai/register-should');
const {app, sqlConnection} = require('../index');

chai.use(chatHttp);
const {expect} = chai;

describe('API Test', () => {
  before((done) => {
    sqlConnection.query(`
        CREATE TABLE users (
            id serial PRIMARY KEY,
            email_id varchar(50) UNIQUE NOT NULL,
            password varchar(1000) NOT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE access_tokens (
            id serial PRIMARY KEY,
            user_id integer UNIQUE NOT NULL,
            access_token varchar(1000) NOT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT _FK_user_id FOREIGN KEY (user_id) REFERENCES users (id)
        );
        CREATE TABLE user_accounts (
            id serial PRIMARY KEY,
            user_id integer NOT NULL,
            account_name varchar(200) NOT NULL,
            username varchar(50) NOT NULL,
            password varchar(1000) NOT NULL,
            is_active integer NOT NULL DEFAULT 1,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_account_cred UNIQUE(user_id, account_name, username),
            CONSTRAINT _FK_users_id FOREIGN KEY (user_id) REFERENCES users (id)
        );
        `, (result) => {
      done(result.error);
    });
  });

  after((done) => {
    sqlConnection.query(`DROP TABLE users, access_tokens,user_accounts;`, (result) => {
      done(result.error);
    });
  });

  describe('Authorization', () => {
    describe('POST /auth/registerUser', () => {
      it('should create new user', (done) => {
        chai.request(app)
            .post('/auth/registerUser')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send('username=test@gmail.com')
            .send('password=test')
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Registration was successful');
              done();
            });
      });
      it('should not create duplicate user', (done) => {
        chai.request(app)
            .post('/auth/registerUser')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send('username=test@gmail.com')
            .send('password=test')
            .end((err, res) => {
              expect(res.status).to.equal(400);
              expect(res.body.error).to.equal('User already exists');
              expect(res.body.message).to.equal('User already exists');
              done();
            });
      });
    });
    describe('POST /auth/login', () => {
      it('should be able to login', (done) => {
        chai.request(app)
            .post('/auth/login')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send('username=test@gmail.com')
            .send('password=test')
            .send('grant_type=password')
            .send('client_id=null')
            .send('client_secret=null')
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.token_type).to.equal('bearer');
              expect(res.body).to.have.property('access_token');
              expect(res.body).to.have.property('expires_in');
              done();
            });
      });
    });
  });

  describe('APIs', () => {
    let bearerToken;

    beforeEach((done) => {
      chai.request(app)
          .post('/auth/login')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send('username=test@gmail.com')
          .send('password=test')
          .send('grant_type=password')
          .send('client_id=null')
          .send('client_secret=null')
          .end((err, res) => {
            bearerToken = 'Bearer ' + res.body.access_token;
            done();
          });
    });

    describe('POST /api/accounts', () => {
      it('should create new account', (done) => {
        const accountReq = {
          account_name: 'test account',
          username: 'test@gmail.com',
          password: 'test',
        };
        chai.request(app)
            .post('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .send(accountReq)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Password data successful added!');
              done();
            });
      });
      it('should not create duplicate account', (done) => {
        const accountReq = {
          account_name: 'test account',
          username: 'test@gmail.com',
          password: 'test',
        };
        chai.request(app)
            .post('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .send(accountReq)
            .end((err, res) => {
              expect(res.status).to.equal(400);
              expect(res.body.error).to.an('object');
              expect(res.body.message).to.equal('Failed to add data!');
              done();
            });
      });
    });

    describe('PUT /api/accounts', () => {
      it('should update account', (done) => {
        const accountReq = {
          account_name: 'test account',
          username: 'test@gmail.com',
          new_password: 'newPassword',
        };
        chai.request(app)
            .put('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .send(accountReq)
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Password data successful updated!');
              done();
            });
      });
    });

    describe('DELETE /api/accounts', () => {
      it('should delete account', (done) => {
        chai.request(app)
            .delete('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({account_name: 'test account', username: 'test@gmail.com'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Password data successful deleted!');
              done();
            });
      });
    });

    describe('GET /api/accounts', () => {
      before((done) => {
        const accountReq = {
          account_name: 'test account 1',
          username: 'test@gmail.com',
          password: 'test',
        };
        chai.request(app)
            .post('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .send(accountReq)
            .end((err, res) => {
              done();
            });
      });
      it('should get an account', (done) => {
        chai.request(app)
            .get('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({account_name: 'test account 1', username: 'test@gmail.com'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Password data successful obtained!');
              expect(res.body.data).to.not.equal(null);
              done();
            });
      });
      it('should not get an account', (done) => {
        chai.request(app)
            .get('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({account_name: 'random text', username: 'random text'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Failed to get data!');
              expect(res.body.data).to.equal(null);
              done();
            });
      });
    });

    describe('GET /api/accounts/all', () => {
      before((done) => {
        const accountReq = {
          account_name: 'test account 2',
          username: 'test@gmail.com',
          password: 'test',
        };
        chai.request(app)
            .post('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .send(accountReq)
            .end((err, res) => {
              done();
            });
      });
      it('should get an account', (done) => {
        chai.request(app)
            .get('/api/accounts/all')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({page_size: 1, page_number: 1})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Password data successful obtained!');
              expect(res.body.data).to.not.equal(null);
              done();
            });
      });
      it('should not get an account', (done) => {
        chai.request(app)
            .get('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({page_size: 5, page_number: 10})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Failed to get data!');
              expect(res.body.data).to.equal(null);
              done();
            });
      });
    });

    describe('GET /api/accounts/all', () => {
      before((done) => {
        const accountReq = {
          account_name: 'test account 3',
          username: 'test@gmail.com',
          password: 'test',
        };
        chai.request(app)
            .post('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .send(accountReq)
            .end((err, res) => {
              done();
            });
      });
      it('should get an account', (done) => {
        chai.request(app)
            .get('/api/accounts/search')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({key: 'account 3'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Password data successful obtained!');
              expect(res.body.data).to.not.equal(null);
              done();
            });
      });
      it('should not get an account', (done) => {
        chai.request(app)
            .get('/api/accounts')
            .set('Accept', 'application/json')
            .set('Authorization', bearerToken)
            .query({key: 'random text'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.error).to.equal(null);
              expect(res.body.message).to.equal('Failed to get data!');
              expect(res.body.data).to.equal(null);
              done();
            });
      });
    });
  });
});
