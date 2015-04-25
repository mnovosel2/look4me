/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var geolib = require('geolib');
module.exports = {
    test: function(req, res) {
        var gcmResponse =
            GCMService.registerClient('AIzaSyAv11GIIUUlsD9Exv9VpzMFWawd0skO574', 1)
            .sendNotification({
                registrationId: 'APA91bF3NDAqlu_QWsdbhdNjWB_mSsGqDUDDwcPYenVubpwMUK2DPW-s0GNLNjgDBs8YtgC9dq8d8YBfj8fnqRZrPwTGEuJu5DEJY2ryRYKNCOEG5Qr-cbXX1_LOeTyi6rfuzWGJ8AmVAWRZyA0zwglxwmyBbi7vmg',
                data: {
                    longitude: '45.66134',
                    latitude: '20.32345'
                }
            });
        if (gcmResponse) {
            res.ok({
                message: 'You have been GCMed'
            });
        } else {
            res.badRequest({
                message: 'Bad REQ'
            });
        }
    },
    create: function(req, res) {
        var user = req.body;
        if (!user.deviceId || !user.deviceOS) {
            res.badRequest('Device ID or Device OS is missing');
        }
        Users.create({
            username: user.username || '',
            email: user.email || '',
            deviceId: user.deviceId,
            deviceOS: user.deviceOS,
            registeredDevice: user.registerId
        }).exec(function(err, inserted) {
            if (err) {
                console.log(err);
                res.serverError('Error saving user');
            } else {
                console.log(inserted);
                res.ok({
                    message: 'User created succesffuly'
                });
            }
        });
    },
    get: function(req, res) {
        if (req.params.deviceId) {
            async.waterfall([
                function(callback) {
                    Users.findOne({
                        deviceId: req.params.deviceId
                    }).exec(function(err, model) {
                        if (err) {
                            console.log(err);
                            res.serverError(err);
                        } else if (model) {
                            callback(null, model);
                        } else {
                            callback('User not found!');
                        }
                    });
                },
                function(result, callback) {
                    Users.find({
                        deviceId: result.connectedUsers
                    }).exec(function(err, model) {
                        if (err) {
                            console.log(err);
                            res.serverError(err);
                        } else {
                            res.ok({
                                user: result,
                                friends: model
                            });
                        }
                    });
                }
            ], function(err) {
                console.log(err);
                res.serverError();
            });
        } else {
            res.badRequest({
                message: 'No device id present in request!'
            });
        }
    },
    friends: function(req, res) {
        var request = req.body;
        if (request.friend && request.deviceId && request.ticket) {
            async.waterfall([
                function(callback) {
                    Users.findOne({
                        deviceId: request.deviceId
                    }).exec(function(err, model) {
                        if (err) {
                            console.log('Error while finding user!');
                            res.serverError(err);
                        } else {
                            callback(null, model);
                        }
                    });
                },
                function(result, callback) {
                        Users.findOne({
                            deviceId: request.friend,
                            ticket: request.ticket
                        }).exec(function(err, wantedUser) {
                            if (err) {
                                console.log('Error trying to find friends of a user!');
                                callback(err);
                            } else if (wantedUser) {
                                callback(null, request.friend, result);
                            } else {
                                //callback('Friend not found by deviceId!');
                                console.log('Friend not found by deviceId!');
                            }
                        });
                },
                function(friend, user, callback) {
                    if (!ArrayService.itemExists(user.connectedUsers, friend)) {
                        user.connectedUsers.push(friend);
                        user.save(function(err, model) {
                            if (err) {
                                console.log('Error while trying to add connectedUsers');
                                callback(err);
                            } else {
                                res.ok({
                                    message: 'Friends added succesffuly'
                                });
                            }
                        });
                    } else {
                        res.ok({
                            message: 'Friends added succesffuly'
                        });
                    }
                }
            ], function(err) {
                res.serverError(err);
            });
        } else {
            res.badRequest({
                message: 'Array of ids or your deviceId not present!'
            });
        }
    },
    updateTicket: function(req, res){
        var model = req.body;
        if(!model.deviceId || !model.ticket){
            res.badRequest({ message: 'Required data is missing!' });
        } else {
            Users.update({ deviceId: model.deviceId }, { ticket: model.ticket })
                .exec(function(err, updated){
                    if(err){
                        console.log('Error while updating invite ticket!');
                        res.serverError(err);
                    } else {
                        res.ok({ message: 'Ticket updated succesffuly' });
                    }
                });
        }
    },
    location: function(req, res) {
        var user = req.body;
        if (!user.longitude || !user.latitude || !user.deviceId) {
            res.badRequest({
                message: 'Required data is missing'
            });
        }
        async.waterfall([
            function(callback) {
                Users.update({
                    deviceId: user.deviceId
                }, {
                    longitude: user.longitude,
                    latitude: user.latitude
                }).exec(function(err, inserted) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, inserted);
                    }
                });
            },
            function(result, callback) {
                Users.find({
                    deviceId: result[0].connectedUsers
                }).exec(function(err, usersFound) {
                    if (err) {
                        callback(err);
                    }
                    var minimalDistance = geolib.getDistance({
                            latitude: result[0].latitude,
                            longitude: result[0].longitude
                        }, {
                            latitude: usersFound[0].latitude,
                            longitude: usersFound[0].longitude
                        }),
                        itemWithMinDistance = usersFound[0];
                    usersFound.forEach(function(item) {
                        var getDistance = geolib.getDistance({
                            latitude: result[0].latitude,
                            longitude: result[0].longitude
                        }, {
                            latitude: item.latitude,
                            longitude: item.longitude
                        });
                        if (getDistance < minimalDistance) {
                            minimalDistance = getDistance;
                            itemWithMinDistance = item;
                        }
                        var gcmResponse =
                            GCMService.registerClient('AIzaSyAv11GIIUUlsD9Exv9VpzMFWawd0skO574', 1)
                            .sendNotification({
                                registrationId: item.registeredDevice,
                                data: {
                                    latitude: user.latitude,
                                    longitude: user.longitude
                                }
                            });
                    });

                    console.log(minimalDistance);
                    console.log(itemWithMinDistance);
                    if (getDistance <= 10) {
                        res.ok({
                            minimalDistance: minimalDistance,
                            itemWithMinDistance: itemWithMinDistance,
                            refreshDistance: 2
                        });
                    } else if (getDistance > 10 && getDistance <= 100) {
                        res.ok({
                            minimalDistance: minimalDistance,
                            itemWithMinDistance: itemWithMinDistance,
                            refreshDistance: 40
                        });
                    } else if (getDistance > 100 && getDistance <= 500) {
                        res.ok({
                            minimalDistance: minimalDistance,
                            itemWithMinDistance: itemWithMinDistance,
                            refreshDistance: 200
                        });
                    } else if (getDistance > 500 && getDistance <= 1000) {
                        res.ok({
                            minimalDistance: minimalDistance,
                            itemWithMinDistance: itemWithMinDistance,
                            refreshDistance: 800
                        });
                    } else if (getDistance > 1000 && getDistance <= 5000) {
                        res.ok({
                            minimalDistance: minimalDistance,
                            itemWithMinDistance: itemWithMinDistance,
                            refreshDistance: 3000
                        });
                    } else if (getDistance > 5000) {
                        res.ok({
                            minimalDistance: minimalDistance,
                            itemWithMinDistance: itemWithMinDistance,
                            refreshDistance: 9000
                        });
                    }

                });
            }
        ], function(err) {
            res.badRequest({
                message:'Error while updating location'
            });
        });

    }
};
