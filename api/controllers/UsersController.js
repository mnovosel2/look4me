/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'create': function(req, res) {
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
                res.ok('User created successfuly');
            }
        });
    },
    get: function(req, res) {
        if (req.params.deviceId) {
            Users.find({
                id: req.params.deviceId
            }).exec(function(err, model) {
                if (err) {
                    console.log(err);
                    res.serverError(err);
                }
                res.ok(model);
            });
        } else {
            res.badRequest({
                message: 'No device id present in request!'
            });
        }
    },
    friends: function(req, res) {
        var friends = req.body;
        res.ok('friends');
    },
    location: function(req, res) {
        var user = req.body;
        if (!user.longitude || !user.latitude) {
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
                res.ok('Location saved succesffuly');
            }
        });
    }
};
