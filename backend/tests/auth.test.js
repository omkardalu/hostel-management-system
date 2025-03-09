const chai = await import('chai');
const chaiHttp = await import('chai-http');
const jwt = require('jsonwebtoken');
const { expect } = chai;
const app = require('../server');

chai.use(chaiHttp);

describe('Auth Routes', () => {
  let jwtToken;

  it('should initiate Google OAuth', (done) => {
    chai.request(app)
      .get('/api/auth/google')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should create a valid JWT for a user', () => {
    jwtToken = jwt.sign({ userId: 'testUserId', role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expect(jwtToken).to.be.a('string');
  });

  it('should access protected profile with valid JWT', (done) => {
    chai.request(app)
      .get('/api/user/profile')
      .set('Cookie', `token=${jwtToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('user');
        done();
      });
  });

  it('should reject access without JWT', (done) => {
    chai.request(app)
      .get('/api/user/profile')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('message', 'Unauthorized: No token provided');
        done();
      });
  });
});
