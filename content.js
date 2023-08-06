const TICK_RATE = 1000;

var jobs = [
    {
        domainPattern: 'twitter\.com', // DOM scanning will be triggered only if the pattern matched
        selectors: ['div[data-testid="placementTracking"]'],
        maxTicks: 7, // limit how many times DOM is being scanned per job while attempting to execute
        skipTicks: 2,
        lastTriggeredURL: '', // need to track URLs for reactive websites to reset the job and execute again
        isExecuted: false,
        counter: 0,
        intervalId: 0, // possible to call clearInterval() on this and shutdown the work
    },
];

function resetJob(job) {
    job.isExecuted = false;
    job.counter = 0;
}

function executeJobs() {
    jobs.forEach(function(job) {
        let url = document.URL;
        job.lastTriggeredURL = url;
        let match = url.match(job.domainPattern);
        if (match !== null && match.length > 0) {
            var manipulateDOM = function() {
                if (job.lastTriggeredURL != document.URL) { // the last time the job has been processed on a different URL
                    job.lastTriggeredURL = document.URL;
                    resetJob(job); // reset the job and work again
                }

                if (job.skipTicks > job.counter) { // delay execution
                    job.counter++;
                    return;
                }

                if (job.isExecuted || job.counter > job.maxTicks) { // job has been executed or given up after max retries
                    return;
                }

                // query on every selector and execute the manipulation
                job.selectors.forEach(function(selector) {
                    var elements = document.querySelectorAll(selector);
                    elements.forEach(function(element) {
                        element.remove();
                        if (!job.isExecuted) {
                            job.isExecuted = true;
                        }
                    });
                });
                job.counter++;
            }
            job.intervalId = setInterval(manipulateDOM, TICK_RATE);
        }
    });
}

executeJobs();
