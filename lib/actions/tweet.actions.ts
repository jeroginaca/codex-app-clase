"use server"

import { revalidatePath } from "next/cache";
import Tweet from "../models/tweet.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
    connectToDB();

    const skipAmount = (pageNumber -1) * pageSize;

    const postsQuery = Tweet.find({ parentId: { $in: [null, undefined]} })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User}) // Carga automáticamente referencias a otros documentos relacionados con los autores de los tweets en una colección de MongoDB.
    .populate({ 
        path: "children", 
        populate: {
            path: "author",
            model: User,
            select: "_id name parentId image"
        }
    })

    const totalPostsCount = await Tweet.countDocuments({ parentId: { $in: [null, undefined]} })

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext }
}

interface Params {
    text: string,
    author: string,
   path: string,
}

export const createTweet = async ({ text, author, path }: Params) => {

    try {
        
        connectToDB();
        
        const createdTweet = await Tweet.create({
            text,
            author,
        });
        
        // Actualizar model de user
        await User.findByIdAndUpdate(author, {
            $push: { tweets: createdTweet._id }
        })
        
        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error creating tweet: ${error.message}`)

    }
}


async function fetchAllChildTweets(tweetId: string): Promise<any[]> {
    const childTweets = await Tweet.find({ parentId: tweetId });
  
    const descendantTweets = [];
    for (const childTweet of childTweets) {
      const descendants = await fetchAllChildTweets(childTweet._id);
      descendantTweets.push(childTweet, ...descendants);
    }
  
    return descendantTweets;
  }
  


export async function deleteTweet(id: string, path: string): Promise<void> {
    try {
      connectToDB();
  
      // Find the tweet to be deleted (the main tweet)
      const mainTweet = await Tweet.findById(id).populate("author community");
  
      if (!mainTweet) {
        throw new Error("Tweet not found");
      }
  
      // Fetch all child tweets and their descendants recursively
      const descendantTweets = await fetchAllChildTweets(id);
  
      // Get all descendant tweet IDs including the main tweet ID and child tweet IDs
      const descendantTweetIds = [
          id,
          ...descendantTweets.map((tweet) => tweet._id ),
        ];
    
  
      // Extract the authorIds to update User model 
      const uniqueAuthorIds = new Set(
        [
          ...descendantTweets.map((tweet) => tweet.author?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainTweet.author?._id?.toString(),
        ].filter((id) => id !== undefined)
      );
  
      // Recursively delete child tweets and their descendants
      await Tweet.deleteMany({ _id: { $in: descendantTweetIds } });
  
      // Update User model
      await User.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { tweets: { $in: descendantTweetIds } } }
      );
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to delete tweet: ${error.message}`);
    }
  }

export const fetchTweetById = async (id: string) => {
    connectToDB();

    try {
        const tweet = await Tweet.findById(id)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image"
            })
            .populate({
                path:"children",
                populate: [
                    {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image"
                    },
                    {
                        path: "children",
                        model: Tweet,
                        populate: {
                            path: "author",
                            model: User,
                            select: "_id id name parentId image"
                        }
                    }
                ]
            }).exec();

            return tweet;
        
    } catch (error: any) {
        throw new Error(`Error fetching tweet: ${error.message}`)
    }
}

export const addCommentToTweet = async (
    tweetId: string,
    commentText: string,
    userId: string,
    path:string,
) => {
    connectToDB();
    
    try {
        // Encontrar el Tweet original por su Id
        const originalTweet = await Tweet.findById(tweetId);

        if(!originalTweet){
            throw new Error ("Tweet not found")
        }

        // Crear nuevo Tweet con el comentario
        const commentTweet = new Tweet({
            text: commentText,
            author: userId,
            parentId: tweetId,
        })

        // Guardando el comentario en la base de datos
        const savedCommentTweet = await commentTweet.save();

        // Luego queremos actualizar el Tweet original con el comentario nuevo
        originalTweet.children.push(savedCommentTweet._id);

        // Guardar el Tweet original 
        await originalTweet.save();

        // Revalidar el path para que se muestre instantaneamente.
        revalidatePath(path);

    } catch (error: any) {
        throw new Error(`Error fetching tweet: ${error.message}`)
    }
}
