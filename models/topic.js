const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const topicSchema = new Schema({
    topicName: {
        type: String,
        required: true,
    },
    topicDescription: {
        type: String,
        required:true,
    },
    topicTags: {
        type: [String],
        required: true
    },
    idName:{
        type:String,
        required: true
    }

});

module.exports = mongoose.model('Topic',topicSchema);