/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        username: {
            type: 'string'
        },
        deviceId:{
            type:'string',
            required:true,
            unique:true
        },
        deviceOS:{
            type:'string',
            required:true,
        },
        email:{
            type:'string'
        },
        connectedUsers:{
            type:'array',
            defaultsTo:[]
        },
        longitude:{
            type:'string',
            defaultsTo:''
        },
        latitude:{
            type:'string',
            defaultsTo:''
        }
    }
};
