/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    new: function(req, res) {
        Users.create({
            username: 'Pavlo',
            password: 'micek'
        }).exec(function(err, inserted) {
            if (err) {
                console.log(err);
                res.serverError();
            }
            console.log(inserted);
            res.ok('Everything ok');
        });
    },
    get: function(req, res){
        if(req.params.deviceId){
            Users.find({ id: req.params.deviceId }).exec(function(err, model){
                if(err){
                    console.log(err);
                    res.serverError('kifla');
                }
                res.ok(model);
            });
        } else {
            res.badRequest({ message: 'No device id present in request!' });
        }
        
    }
};
