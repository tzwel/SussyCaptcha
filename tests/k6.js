import http from 'k6/http';

import { check, sleep } from 'k6';


export const options = {

  stages: [

    { duration: '30s', target: 200 },


  ],

};


export default function () {

  const res = http.get('http://localhost:8000/');

  check(res, { 'status was 200': (r) => r.status == 200 });

  sleep(1);

}