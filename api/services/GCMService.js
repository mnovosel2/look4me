var pushNotify = require('push-notify');

module.exports = {
    registerClient: function(apiKey, numberOfRetries) {
        this.gcm = {};
        this.error = null;
        if (!apiKey) {
            this.error = new Error();
            return this;
        } else {
            this.gcm = pushNotify.gcm({
                apiKey: apiKey,
                retries: numberOfRetries || 1
            });
            return this;
        }
    },
    sendNotification: function(opts) {
        if (this.error) {
            return false;
        } else {
            this.gcm.send({
                registrationId: opts.registrationId,
                delayWhileIdle: opts.delayWhileIdle || true,
                timeToLive: 3,
                data:opts.data
            });
            return true;
        }
    }
};
