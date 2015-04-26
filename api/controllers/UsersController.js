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
                status: 0,
                message: 'You have been GCMed'
            });
        } else {
            res.badRequest({
                status: 1,
                message: 'Bad REQ'
            });
        }
    },
    testMpns: function(req, res) {
        MPNSService.createMessage('http://s.notify.live.net/u/1/db3/H2QAAAATec3sHtx9Z9bdsuKs6ceVZzKvyCSszXoPe8knetSxSx6hrtqKi0wiu1om9XBoTO6MPjtUVqM4MYeD607FrWuLZk0w-VLyElE7oGHOJ7DkEaFRx-2RAV2aug0wYUBif3U/d2luZG93c3Bob25lZGVmYXVsdA/jLvz1oEkmE6QBO_SlATpzA/8TSa1OL1fmFQ9f7Pa8FJh1uz_5I', 'poruka1', 'poruka2').sendMessage();
        res.ok();
    },
    create: function(req, res) {
        var user = req.body;
        if (!user.deviceId || !user.deviceOS) {
            res.badRequest({
                status: 1,
                message: 'Device ID or Device OS is missing'
            });
        }
        Users.create({
            username: user.username || '',
            email: user.email || '',
            deviceId: user.deviceId,
            deviceOS: user.deviceOS,
            registeredDevice: user.registerId,
            avatar: req.baseUrl + '/images/profile.png'
        }).exec(function(err, inserted) {
            if (err) {
                console.log(err);
                res.serverError('Error saving user');
            } else {
                console.log(inserted);
                res.ok({
                    status: 0,
                    message: 'User created succesffuly'
                });
            }
        });
    },
    profile: function(req, res) {
        var model = req.body;
        if (model.deviceId && model.avatar && model.username) {
            Users.update({
                deviceId: model.deviceId
            }, {
                avatar: model.avatar,
                username: model.username
            }).exec(function(err, saved) {
                if (err) {
                    console.log('Error while saving user profile');
                    req.serverError();
                } else {
                    res.ok({
                        status: 0,
                        message: 'Profile updated succesffuly'
                    });
                }
            });
        } else {
            res.badRequest({
                status: 1,
                message: 'Required data not present'
            });
        }
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
                            res.badRequest({
                                status: 1,
                                message: 'User not found!'
                            });
                        } else {
                            res.ok({
                                status: 0,
                                user: result,
                                friends: model
                            });
                        }
                    });
                }
            ], function(err) {
                console.log(err);
                res.badRequest({
                    status: 1,
                    message: 'User not found!'
                });
            });
        } else {
            res.badRequest({
                status: 1,
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
                            callback(null, wantedUser, result);
                        } else {
                            console.log('Friend not found by deviceId!');
                        }
                    });
                },
                function(friend, user, callback) {
                    if (!ArrayService.itemExists(user.connectedUsers, friend.deviceId)) {
                        user.connectedUsers.push(friend.deviceId);
                        user.save(function(err, model) {
                            if (err) {
                                console.log('Error while trying to add connectedUsers');
                                callback(err);
                            } else {
                                /*res.ok({
                                    status: 0,
                                    message: 'Friends added succesffuly'
                                });*/
                            }
                        });
                    }
                    if (!ArrayService.itemExists(friend.connectedUsers, user.deviceId)) {
                        friend.connectedUsers.push(user.deviceId);
                        friend.save(function(err, model) {
                            if (err) {
                                console.log('Error while trying to add connectedUsers');
                                callback(err);
                            } else {
                                /*res.ok({
                                    status: 0,
                                    message: 'Friends added succesffuly'
                                });*/
                            }
                        });
                    }
                    res.ok({
                        status: 0,
                        message: 'Friends added succesffuly'
                    });
                }
            ], function(err) {
                res.serverError(err);
            });
        } else {
            res.badRequest({
                status: 1,
                message: 'Friend id or your deviceId not present!'
            });
        }
    },
    updateTicket: function(req, res) {
        var model = req.body;
        if (!model.deviceId || !model.ticket) {
            res.badRequest({
                message: 'Required data is missing!'
            });
        } else {
            Users.update({
                    deviceId: model.deviceId
                }, {
                    ticket: model.ticket
                })
                .exec(function(err, updated) {
                    if (err) {
                        console.log('Error while updating invite ticket!');
                        res.serverError(err);
                    } else {
                        res.ok({
                            status: 0,
                            message: 'Ticket updated succesffuly'
                        });
                    }
                });
        }
    },
    location: function(req, res) {
        var user = req.body;
        if (!user.longitude || !user.latitude || !user.deviceId) {
            res.badRequest({
                status: 1,
                message: 'Required data is missing'
            });
            return;
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
                        } else if (inserted) {
                            console.log('*****RESULT*****');
                            console.log(inserted);
                            console.log('*****RESULT*****');
                            callback(null, inserted);
                        } else {
                            callback('User not found!');
                        }
                    });
                },
                function(result, callback) {
                    var minimalDistance = null,
                        itemWithMinDistance = null;
                    if(!result.length){
                        callback('Error while updating user');
                    }
                    Users.find({
                        deviceId: result[0].connectedUsers
                    }).exec(function(err, usersFound) {
                        if (err) {
                            callback(err);
                        }
                        if (!usersFound.length) {
                            res.ok({
                                status: 0,
                                refreshDistance: -1
                            });
                        } else {
                            for (var i = usersFound.length - 1; i >= 0; i--) {
                                if (usersFound[i].latitude && usersFound[i].longitude) {
                                    minimalDistance = geolib.getDistance({
                                        latitude: result[0].latitude,
                                        longitude: result[0].longitude
                                    }, {
                                        latitude: usersFound[i].latitude,
                                        longitude: usersFound[i].longitude
                                    });
                                    itemWithMinDistance = usersFound[i];
                                    break;
                                }
                            }
                        }
                        if (!minimalDistance || !itemWithMinDistance) {
                            res.ok({
                                status: 0,
                                refreshDistance: -1
                            });
                        } else {
                            usersFound.forEach(function(item) {
                                if (item.latitude && item.longitude) {
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
                                }
                            });

                            console.log(minimalDistance);
                            console.log(itemWithMinDistance);
                            if (getDistance <= 10) {
                                res.ok({
                                    status: 0,
                                    refreshDistance: 2
                                });
                            } else if (getDistance > 10 && getDistance <= 100) {
                                res.ok({
                                    status: 0,
                                    refreshDistance: 40
                                });
                            } else if (getDistance > 100 && getDistance <= 500) {
                                res.ok({
                                    status: 0,
                                    refreshDistance: 200
                                });
                            } else if (getDistance > 500 && getDistance <= 1000) {
                                res.ok({
                                    status: 0,
                                    refreshDistance: 800
                                });
                            } else if (getDistance > 1000 && getDistance <= 5000) {
                                res.ok({
                                    status: 0,
                                    refreshDistance: 3000
                                });
                            } else if (getDistance > 5000) {
                                res.ok({
                                    status: 0,
                                    refreshDistance: 9000
                                });
                            }
                        }
                    });
                }
            ],
            function(err) {
                res.badRequest({
                    status: 1,
                    message: 'Error while updating location'
                });
            });
    }
};
