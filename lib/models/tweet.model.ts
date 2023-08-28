import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true, 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
    },
    parentId:{ // en caso que sea un comentario.
        type: String,
    },
    children: [ // Porque cada Tweet puede tener multiples Tweets de children.
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet"
        }
    ]

});

const Tweet = mongoose.models.Tweet || mongoose.model("Tweet", tweetSchema);

export default Tweet;