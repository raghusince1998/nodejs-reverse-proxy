require('dotenv').config();

module.exports = {
    'app.example.com': [
        {
            location: '/api',
            target: 'http://localhost:3002',
            access_log: 'logs/app.example.com/api/access.log',
            cache: true,
            cache_ttl: 129600, // this is in seconds (36 hour)
        },
        {
            location: '/',
            target: 'http://localhost:3002',
            access_log: 'logs/app.example.com/access.log',
            request_headers: {  // this headers are similar to nginx set_headers
                'X-Forwarded-Host': '$host',
                'X-Real-IP': '$remote_addr'
            },
            response_headers: {  // this headers are similar to nginx add_headers
                'X-Powered-By': 'CustomProxy',
                'Cache-Control': 'no-store'
            },
            cache: true,
            cache_ttl: 129600, // this is in seconds (36 hour)
        }
    ],
    'api.example.com': [  // this is host
        {
            location: '/api',   // this is location / path / context
            target: 'http://localhost:3001', // this is same as proxy_pass in nginx
            access_log: 'logs/api.example.com/api/access.log', // custom log path
            request_headers: {  // this headers are similar to nginx set_headers
                'X-Forwarded-Host': '$host',  // $ indicates this value is replaced by actual host in code.
                'X-Real-IP': '$remote_addr',
                'Test_add_header': 'test_add_header'
            },
            response_headers: {  // this headers are similar to nginx add_headers
                'X-Powered-By': 'CustomProxy',  // without $ it indicates it takes key value pair as it is.
                'Cache-Control': 'no-store',
                'Test': 'check',
                'Test_set_header': 'test_set_header'
            },
            cache: true,
            cache_ttl: 300, // this is in seconds (36 hour = 129600 )
        },
        {
            location: '/',
            target: 'http://localhost:3000', // fallback
            access_log: 'logs/api.example.com/access.log',
            request_headers: {  // this headers are similar to nginx set_headers
                'X-Forwarded-Host': '$host',
                'X-Real-IP': '$remote_addr'
            },
            response_headers: {  // this headers are similar to nginx add_headers
                'X-Powered-By': 'CustomProxy',
                'Cache-Control': 'no-store'
            },
            cache: true,
            cache_ttl: 300, // this is in seconds (36 hour = 129600)
               }
    ],
    'default': [
        {
            location: '/_logs',
            target: 'self', // handled internally
            access_log: 'logs/default/access.log'
        },
        {
            location: '/',
            target: 'http://localhost:3000',
            access_log: 'logs/default/access.log'
        }
    ]
};
