'use strict';

/**
 * Module dependencies.
 */
var findOrCreate = require('mongoose-findorcreate')
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slack: {
        id: {
            type: String,
            trim: true
        },
        name: {
            type: String,
            trim: true
        },
        accessToken: {
            type: String,
            trim: true
        },
        refreshToken: {
            type: String,
            trim: true
        }
    },
    sfdc: {
        type: Schema.Types.Mixed
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    }
});



/**
 * Validations
 */

/**
 * Statics
 */
UserSchema.plugin(findOrCreate);


module.exports = mongoose.model('User', UserSchema);
