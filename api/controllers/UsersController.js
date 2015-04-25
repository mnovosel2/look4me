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
            }
            console.log(inserted);
            res.ok('User created successfuly');
        });
    },
    get: function(req, res){
        if(req.params.deviceId){
            Users.find({ deviceId: req.params.deviceId }).exec(function(err, model){
                if(err){
                    console.log(err);
                    res.serverError(err);
                } else{
                    res.ok(model);
                }
            });
        } else {
            res.badRequest({ message: 'No device id present in request!' });
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
                                res.ok(model);
                            }
                        });
                    } else {
                        res.ok(user);
                    }
                }
            ], function(err){
                res.serverError(err);
            });
        } else {    
            res.badRequest({ message: 'Array of ids or your deviceId not present!' });
        }
    },
    location: function(req, res){
        var location = req.body;
        res.ok('location');
    }
};