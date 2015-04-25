/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
            deviceOS: user.deviceOS
        }).exec(function(err, inserted) {
            if (err) {
                console.log(err);
                res.serverError('Error saving user');
            } else {
                console.log(inserted);
                res.ok({ message: 'User created succesffuly' });
            }
        });
    },
    get: function(req, res){
        if(req.params.deviceId){
            Users.findOne({ deviceId: req.params.deviceId }).exec(function(err, model){
                if(err){
                    console.log(err);
                    res.serverError(err);
                } else{
                    res.ok(model);
                }
            });
        } else {
            res.badRequest({
                message: 'No device id present in request!'
            });
        }
    },
    friends: function(req, res){
        var request = req.body;
        if(request.friends && request.deviceId){
            async.waterfall([
                function(callback){
                    Users.findOne({ deviceId: request.deviceId }).exec(function(err, model){
                        if(err){
                            console.log('Error while finding user!');
                            res.serverError(err);
                        } else {
                            callback(null, model);
                        }
                    });
                },
                function(result, callback){
                    request.friends.forEach(function(devId){
                        Users.findOne({ deviceId: devId }).exec(function(err, wantedUser){
                            if(err){
                                console.log('Error trying to find friends of a user!');
                                callback(err);
                            } else if(wantedUser) {
                                callback(null, devId, result);
                            } else {
                                //callback('Friend not found by deviceId!');
                                console.log('Friend not found by deviceId!');
                            }
                        });
                    });
                },
                function(friend, user, callback){
                    if(!ArrayService.itemExists(user.connectedUsers, friend)){
                        user.connectedUsers.push(friend);
                        user.save(function(err, model){
                            if(err){
                                console.log('Error while trying to add connectedUsers');
                                callback(err);
                            } else {
                                res.ok({ message: 'Friends added succesffuly' });
                            }
                        });
                    } else {
                        res.ok({ message: 'Friends added succesffuly' });
                    }
                }
            ], function(err){
                res.serverError(err);
            });
        } else {    
            res.badRequest({ message: 'Array of ids or your deviceId not present!' });
        }
    },
    location: function(req, res) {
        var user = req.body;
        if (!user.longitude || !user.latitude || !user.deviceId) {
            res.badRequest({
                message: 'Required data is missing'
            });
        }
        Users.update({
            deviceId: user.deviceId
        }, {
            longitude: user.longitude,
            latitude: user.latitude
        }).exec(function(err, inserted) {
            if (err) {
                console.log(err);
                res.serverError('Error saving location');
            } else {
                console.log(inserted);
                res.ok({ message: 'Location saved succesffuly' });
            }
        });
    }
};
