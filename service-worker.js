/* 
=== OFFLINE FALLBACK ===
self.addEventListener('install', event => {
    event.waitUntil(caches.open('offline-fallbacks')
        .then(cache => cache.add('offline.html'))
    );
});

self.addEventListener('fetch', event => {
    if ( event.request.mode === 'navigate' ) {
        event.respondWith(
            fetch(event.request)
                .catch(error => {
                    return caches.open('offline-fallbacks')
                        .then(cache => cache.match('offline.html'))
                })
        );
    }
});
*/

/*
=== PRE-CACHING APPLICATION SHELL RESOURCES ===
*/
const appShellURLs = [
    "https://fonts.googleapis.com/css?family=Anton",
    "https://fonts.googleapis.com/icon?family=Material+Icons"
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open('static-assets')
        .then(cache => cache.addAll(appShellURLs))
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (appShellURLs.indexOf(url.pathname) !== -1) {
        //url.pathname is a a string relative to the sites root
        event.respondWith(caches.match(event.reques)
            .then(response => {
                if (!response) {    //No match in caches
                    throw new Error(`${event.request} not found in cache`);
                }
                return response;    //Return the response if its okay
            })
            .catch(error => fetch(event.request))   //fetch from network if not in cache
        );
    }
});


/*
=== Read Through Caching ===

function addToCache(request, response) {
    if (response.ok) {
        const copy = response.clone();
        caches.open('content')
            .then(cache => cache.put(request, copy));
    }
    return response;
}

function findInCache(request) {
    return caches.match(request)
        .then(response => {
            if(!response) {
                throw new Error(`${response} not found in cache`);
            }
            return response;
        });
}

self.addEventListener('install', event => {
    event.waitUntil(caches.open('offline-fallbacks')
        .then(cache => cache.add('offline.html'))
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)                                          //1. Network First
                .then(res => addToCache(req, res))              //2. Read-through
                .catch(error => findInCache(req))               //3. cache fallback
                .catch(error => findInCache('offline.html'))    //4. offline fallback
        );
    }
});
*/

/* 
=== Maintaining and Versioning Service Workers ===

const appShellURLs = [];

//Using Versioning Strings
const SWVerion = 'sw-justin';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(`${SWVerion}-static-assets`)
            .then(cache => cache.addAll(appShellURLs))
            .then(() => self.skipWaiting())             //Go onto activiation phase
    )
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheKeys => {
                const oldKeys = cacheKeys.filter( key => key.indexOf(SWVerion) !== 0);

                const deletePromises = oldKeys.map(oldKey => caches.delete(oldKey));

                //Don't proceed until ALL delete operations are complete
                return Promise.all(deletePromises);
            })
        .then( () => self.clients.claim() )     //Cause activated SW to take control of clients immediately   
    );
})
*/

/* 
=== Listing Application Shell Assets in a JSON File ===

const SWVerion = 'sw-justin';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(`${SWVerion}-static-assets`)
            .then(cache => {
                return fetch('cache-files.json')
                    .then(response => response.json())
                    .then(paths => cache.addAll(paths))
            })
            .then(() => self.skipWaiting())
    )
});
*/