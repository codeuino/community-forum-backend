const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true,
    },
    topicIds: {
        type: [{
           type: Schema.Types.ObjectId,
           ref: 'Topic' 
        }],
    }
});

module.exports = mongoose.model('Category',categorySchema);