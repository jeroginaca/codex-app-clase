"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Tweet from "../models/tweet.model";
import { FilterQuery, SortOrder } from "mongoose";


interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export const fetchUser = async  (userId: string) => {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
        
    }
}


export const fetchUserPosts = async  (userId: string) => {
  try {
      connectToDB();

      // Encontrar todos los tweets de este usuario especifico.
      const tweets = await User.findOne({ id: userId })
          .populate({
              path: "tweets",
              model: Tweet,
              populate: {
                  path: "children",
                  model: Tweet,
                  populate: {
                      path: "author",
                      model: User,
                      select: "name image id"
                  }
              }
          })

      return tweets;

  } catch (error: any) {
      throw new Error(`Failed to fetch post: ${error.message}`)
      
  }
}


export const fetchUsers = async ({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc"
}: {
   userId: string;
   searchString?: string;
   pageNumber?: number; 
   pageSize?: number; 
   sortBy?: SortOrder; 
}) => {

  try {
      connectToDB();

      // calcular el numero de usuarios que saltar
      const skipAmount = (pageNumber - 1) * pageSize;

      // una funcion regular case insensitive para buscar a los usuarios
      const regex = new RegExp(searchString, "i");

      const query: FilterQuery<typeof User> = {
          id: { $ne: userId }
      }

      if(searchString.trim() !==""){
          query.$or = [
              { username: { $regex: regex } },
              { name: { $regex: regex } }
          ]
      }

      const sortOptions = { createdAt: sortBy };

      const usersQuery = User.find(query)
          .sort(sortOptions)
          .skip(skipAmount)
          .limit(pageSize)

      const totalUsersCount = await User.countDocuments(query);

      const users = await usersQuery.exec();

      const isNext = totalUsersCount > skipAmount + users.length;

      return { users, isNext};

  } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error.message}`)
  }
}


export const getActivity = async (userId: string) => {

  try {
      connectToDB();

      // encontrar todos los tweets hechos por el usuario
      const userTweets = await Tweet.find({ author: userId })

      // Recopilar todos los todos los ids de las respuestas al Tweet orignal. Entonces hacemos un map por todos los Tweets con reduce y luego vamos a acumularlos y devolver los comentarios como un array de childrens.

      // Básicamente agarra todos los comentarios que hayan en los Tweets, y hace un nuevo array con todos los comentarios.
      const childTweetIds = userTweets.reduce((acc, userTweet) => {    
          return acc.concat(userTweet.children)
      }, []) // el array vacio es el valor inicial del acumulador.

      // ahora vamos a exlcluir los Tweets del usuario que esta buscando
      const replies = await Tweet.find({
          _id: { $in: childTweetIds },
          author: { $ne: userId }
      }).populate({
          path: "author",
          model: User,
          select: "name image _id"
      })

      return replies

  } catch (error: any) {
      throw new Error(`Failed to fetch activity: ${error.message}`)
  }
}

