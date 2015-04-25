/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var geolib = require('geolib');
module.exports = {
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
        if (request.friends && request.deviceId) {
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
                    request.friends.forEach(function(devId) {
                        Users.findOne({
                            deviceId: devId
                        }).exec(function(err, wantedUser) {
                            if (err) {
                                console.log('Error trying to find friends of a user!');
                                callback(err);
                            } else if (wantedUser) {
                                callback(null, devId, result);
                            } else {
                                //callback('Friend not found by deviceId!');
                                console.log('Friend not found by deviceId!');
                            }
                        });
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
                    });

                    console.log(minimalDistance);
                    console.log(itemWithMinDistance);
                    // if (getDistance <= 10) {

                    // } else if (getDistance > 10 && getDistance <= 100) {

                    // } else if (getDistance > 100 && getDistance <= 500) {

                    // } else if (getDistance > 500 && getDistance <= 1000) {

                    // } else if (getDistance > 1000 && getDistance <= 5000) {

                    // } else if (getDistance > 5000) {

                    // }
                });
            }
        ], function(err) {

        });
        Users.update({
            deviceId: user.deviceId
        }, {
            longitude: user.longitude,
            latitude: user.latitude
        }).exec(function(err, inserted) {
            Users.find({
                deviceId: inserted.connectedUsers
            }).exec(function(err, usersFound) {
                var getDistance = geolib.getDistance({
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude)
                }, {
                    latitude: parseFloat(inserted[0].latitude),
                    longitude: parseFloat(inserted[0].longitude)
                });
                console.log(getDistance);
                if (getDistance <= 10) {

                } else if (getDistance > 10 && getDistance <= 100) {

                } else if (getDistance > 100 && getDistance <= 500) {

                } else if (getDistance > 500 && getDistance <= 1000) {

                } else if (getDistance > 1000 && getDistance <= 5000) {

                } else if (getDistance > 5000) {

                }
            });
            var gcmResponse =
                GCMService.registerClient('AIzaSyAv11GIIUUlsD9Exv9VpzMFWawd0skO574', 1)
                .sendNotification({
                    registrationId: '234445',
                    data: {
                        message1: 'msg1',
                        message2: 'msg2'
                    }
                });
            if (err) {
                console.log(err);
                res.serverError('Error saving location');
            } else {
                res.ok({
                    message: 'Location saved succesffuly'
                });
            }
        });
    }
};
