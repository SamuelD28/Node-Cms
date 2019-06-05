import Mongoose, { Document, Model } from 'mongoose';

interface IUrl extends Document {
    Url: string
}

let urlSchema = new Mongoose.Schema({
    Url: {
        type: String,
        required: true
    }
});

let Url: Model<IUrl> = Mongoose.model<IUrl, Model<IUrl>>("url", urlSchema);

export {Url, IUrl};

