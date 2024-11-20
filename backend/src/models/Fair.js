const { default: mongoose } = require('mongoose');
const Event = require('./Event');

const fairSchema = new mongoose.Schema({
    location : {
        type: String,
        required : true
      },
  });

fairSchema.methods.setLocation = function (location) {
    this.location = location
    return this.save()
}


const Fair = Event.discriminator("Fair", fairSchema);
Object.assign(fairSchema.methods, Event.schema.methods);

module.exports = Fair;
