"use client"

import * as z from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { usePathname, useRouter } from "next/navigation";

import { CommentValidation } from "@/lib/validations/tweet";
import Image from "next/image";
import { addCommentToTweet } from "@/lib/actions/tweet.actions";

interface Props {
    tweetId: string;
    currentUserImg: string;
    currentUserId: string;
}

const Comment = ({ tweetId, currentUserImg, currentUserId }: Props) => {

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            tweet: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToTweet(tweetId, values.tweet, JSON.parse(currentUserId), pathname);

        form.reset();
    }

  return (
    <Form {...form}>
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="comment-form" // cambiamos las clases
      >
          <FormField
        control={form.control}
        name="tweet"
        render={({ field }) => (
           
            <FormItem className="flex items-center gap-3 w-full">  {/* cambiamos las clases de FormItem y FormLabel */}
            <FormLabel>                     
              <Image // agregamos una imagen
                 src={currentUserImg}
                 alt="profile"
                 width={48}
                 height={48}
                 className="rounded-full object-cover"
                /> 
            </FormLabel> 
            {/* cambiamos las clases */}
            <FormControl className="border-none bg-transparent"> 
              <Input 
                  type="text"
                  placeholder="Comment..."
                  className="no-focus text-light-1 outline-none"     
                 {...field}
              />
            </FormControl>
            {/* <FormMessage /> No lo necesitamos así que lo borramos */}
          </FormItem>
        )}
      />   
      {/* Cambiamos las clases */}
      <Button type="submit" className="comment-form_btn">
          Reply
      </Button>
  </form>
  </Form>
  )
}

export default Comment