require('dotenv').config();

const commonHeaders = {
    'x-branch': 'encore',
    'x-tid': '$request_id',
    'X-appname': 'rainbow-client',
    'x-ESS-Environment': 'QA',
}

module.exports = {
    'proxy.asia.essilor.group': [
        // 🔹 Eumcollector
        {
            location: '/eumcollector/',
            target: 'http://sin-col.eum-appdynamics.com:7001',
            access_log: '/logs/proxy.asia.essilor.group/eumcollector/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 Crimson
        {
            location: '/crimson/',
            target: `http://${process.env.CRIMSON_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/crimson/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        {
            location: '/crimson-archive/',
            target: `http://${process.env.CRIMSON_ARCHIVE_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/crimson-archive/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 Indigo
        {
            location: '/indigo/',
            target: `http://${process.env.INDIGO_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/indigo/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 Mandrake (uses HTTPS)
        {
            location: '/mandrake/',
            target: `https://${process.env.MANDRAKE_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/mandrake/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            },
            proxyTimeout: 1200, // this is proxy read timeout in seconds 1200s
            maxBodySize: 50 // 50MB
        },
        // 🔹 Orion
        {
            location: '/orion/',
            target: `http://${process.env.ORION_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/orion/access.log',
            request_headers: {
                ...commonHeaders,
                'Host': 'oris-qa-agw-sea-farm01-001.asia.essilor.group'
            }
        },
        // 🔹 Weld
        {
            location: '/weld/',
            target: `http://${process.env.WELD_SERVER}`,
            access_log: '/logs/proxy.asia.essilor.group/weld/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 Hercules
        {
            location: '/hercules/',
            target: `http://${process.env.HERCULES_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/hercules/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            },
            proxyTimeout: 30, // this is proxy read timeout in seconds
            connectTimeout: 30, // this is proxy connect timeout in seconds
            sendTimeout: 30, // this is proxy send timeout in seconds
        },
        // 🔹 Vega
        {
            location: '/vega/',
            target: `https://${process.env.VEGA_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/vega/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 SSO / Auth context
        {
            location: '/api/v2/auth-context',
            target: 'https://iam-server-ig-qa.asia.essilor.group:9032/iam-server-ig/api/v2/auth-context/',
            access_log: 'logs/proxy.asia.essilor.group/auth-context/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Clapton / Butterfly / Encore ERP (IAM-based)
        {
            location: '/clapton/',
            target: `https://${process.env.CLAPTON_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/clapton/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        {
            location: '/butterfly/',
            target: `https://${process.env.BUTTERFLY_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/butterfly/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Encore ERP
        {
            location: '/encore-erp/',
            target: `https://${process.env.ENCOREERP_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/encore-erp/access.log',
            request_headers: {
                ...commonHeaders,
            }

        },
        // 🔹 Gojira
        {
            location: '/gojira/',
            target: `http://${process.env.GOJIRA_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/gojira/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Encore Arcade (IAM-based)
        {
            location: '/encore-arcade/',
            target: `https://${process.env.ENCORE_ARCADE_SERVER}/iam-server-ig`,
            access_log: '/logs/proxy.asia.essilor.group/encore-arcade/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Encore Order Flow
        {
            location: '/encore-order-flow/',
            target: `https://${process.env.ENCORE_ORDER_FLOW_SERVER}/iam-server-ig`,
            access_log: '/logs/proxy.asia.essilor.group/encore-order-flow/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Camelot (cached)
        {
            location: '/camelot/',
            target: `https://${process.env.CAMELOT_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/camelot/access.log',
            cache: true,
            cache_ttl: 129600, // this is in seconds (36 hour)
            request_headers: {
                ...commonHeaders,
                'X-Cache-Bypass': 1,
            },
            response_headers: {
                'X-Camelot-Cache-Status': '$upstream_cache_status',
                'X-Camelot-Server': '$host'
            }
        },
        // 🔹 Camelot (purge cached)
        {
            location: '/purge/camelot/',
            target: `https://${process.env.CAMELOT_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/camelot/access.log',
            auth_basic: "Administrator Login",
            auth_basic_user_file: '/etc/nginx/.refine',
            proxy_cache_key: '$purge_key',
            rewrite: '^/purge(/.*) $1 break',
            proxy_cache_purge: '$purge_method',
            proxy_cache: 'camelot_rainbow_cache',
        },
        // 🔹 Genesis
        {
            location: '/genesis/',
            target: `https://${process.env.GENESIS_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/genesis/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Falcon modules
        {
            location: '/multipair/',
            target: `https://${process.env.MULTIPAIR_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/falcon-multipair/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        {
            location: '/falcon-authoring/',
            target: `https://${process.env.FALCON_AUTHORING_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/falcon-authoring/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        {
            location: '/falcon-nplusm-engine/',
            target: `https://${process.env.FALCON_NPLUSM_ENGINE_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/falcon-nplusm-engine/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 PECOS
        {
            location: '/pecos-orchestrator/',
            target: `http://${process.env.PECOS_ORCHESTRATOR_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/pecos-orchestrator/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 B2B Rewards
        {
            location: '/b2brewards-server/',
            target: `https://${process.env.B2BREWARDS_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/b2brewards-server/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 Lothar
        {
            location: '/lothar/',
            target: `http://${process.env.LOTHAR_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/lothar/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 Getsinglefileperitem
        {
            location: '/Getsinglefileperitem/',
            target: `https://${process.env.GETSINGLEFILEPERITEM_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/Getsinglefileperitem/access.log',
            request_headers: {
                ...commonHeaders,
            }
        },
        // 🔹 IAM
        {
            location: '/iam-server/',
            target: `http://${process.env.IAM_SERVER}`,
            access_log: 'logs/proxy.asia.essilor.group/iam-server/access.log',
            cache: true,
            cache_ttl: 3600,
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        {
            location: '/first-sight/',
            target: `https://${process.env.FIRST_SIGHT_SERVER}/iam-server-ig`,
            access_log: 'logs/proxy.asia.essilor.group/first-sight/access.log',
            request_headers: {
                ...commonHeaders,
                'X-Forwarded-For': '$remote_addr',
                'Host': '$host'
            }
        },
        // 🔹 Root (SPA client)
        {
            location: '/',
            target: 'file:///data1/nginx/html/rainbow-client/',
            access_log: 'logs/proxy.asia.essilor.group/access.log',
            response_headers: {
                ...commonHeaders,
                'Cache-Control': 'no-cache',
                'X-Powered-By': 'CustomProxy'
            }
        }
    ],
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
            cache_ttl: 129600, // this is in seconds (36 hour)
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
            cache_ttl: 129600, // this is in seconds (36 hour)
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
