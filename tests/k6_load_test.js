import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    local:    { executor: 'constant-vus', vus: 200,  duration: '2m' },
    regional: { executor: 'constant-vus', vus: 1000, duration: '2m' },
    global:   { executor: 'constant-vus', vus: 5000, duration: '2m' },
  },
};

export default function () {
  const res = http.post('http://localhost:8000/api/auth/login', {
    correo: 'user0@test.com',
    password: 'password123',
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
