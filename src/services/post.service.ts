import dayjs from "dayjs";
import { SchemaTypes } from "mongoose";
import Post, { PostDocument, PostQuery } from "../models/post.model";
import LikePost from "../models/likepost.model";
import likepostService, { getLikePost } from "./likepost.service";
import { existsSync, unlinkSync } from "fs";
import path from "path";

export const getPosts = async (
  query: PostQuery = {}
): Promise<PostDocument[]> => {
  query.deletedAt = undefined;
  const posts = await Post.find(query).sort({ createdAt: -1 });
  return posts;
};

export const getPostBy = async (query: PostQuery): Promise<PostDocument> => {
  query.deletedAt = undefined;
  const post = await Post.findOne(query);
  if (!post) {
    const error = new Error("Post not found");
    error.name = "NotFound";
    throw error;
  }
  return post;
};

export const getPostById = async (id: string): Promise<PostDocument> => {
  const post = await Post.findOne({ _id: id, deletedAt: undefined });
  if (!post) {
    const error = new Error("Post not found.");
    error.name = "NotFound";
    throw error;
  }
  return post;
};

export const updatePost = async (
  query: {
    caption?: string;
    tags?: (typeof SchemaTypes.ObjectId)[];
  },
  post: PostDocument
): Promise<PostDocument | null> => await Post.findByIdAndUpdate(post.id, query);

export const savePost = async (post: PostDocument) => await post.save();

export const createPost = ({
  caption,
  tags,
  userId,
}: {
  caption: string;
  tags?: string[];
  userId: string;
}) =>
  new Post({
    caption,
    tags,
    userId,
  });
getPostById;

export const deletePost = async (id: string) => {
  const post = await Post.findOne({ _id: id, deletedAt: undefined });

  if (!post) {
    const error = new Error("Post not found. Delete failed");
    error.name = "NotFound";
    throw error;
  }
  post.image?.forEach((item) => {
    const pathFile = path.join(process.cwd(), item);
    if (existsSync(pathFile)) {
      unlinkSync(path.join(process.cwd(), item));
    }
  });
  post.deletedAt = dayjs().toDate();
  await post.save();
};

export const deleteMyPost = async (id: string, userId: string) => {
  const post = await Post.findOne({ _id: id, deletedAt: undefined });

  if (!post) {
    const error = new Error("Post not found. Delete failed");
    error.name = "NotFound";
    throw error;
  }

  if (post.userId.toString() !== userId) {
    const error = new Error("You cannot delete another person post");
    error.name = "Forbidden";
    throw error;
  }
  post.image?.forEach((item) => {
    const pathFile = path.join(process.cwd(), item);
    if (existsSync(pathFile)) {
      unlinkSync(path.join(process.cwd(), item));
    }
  });
  post.deletedAt = dayjs().toDate();
  await post.save();
};

export const likePost = async (postId: string, userId: string) => {
  const post = await getPostById(postId);

  const like = await getLikePost(userId, postId);
  if (like) {
    const error = new Error("You had like the post");
    error.name = "BadRequest";
    throw error;
  }

  const newLike = new LikePost({
    postId: post.id,
    userId: userId,
    createdAt: dayjs().toDate(),
  });

  await newLike.save();
  return newLike;
};

export const unlikePost = async (postId: string, userId: string) => {
  const like = await likepostService.getLikePost(userId, postId);

  if (!like) {
    const error = new Error("You were had not like this post");
    error.name = "BadRequest";
    throw error;
  }

  await likepostService.deleteLikePost(like.id);
};

export default {
  createPost,
  deletePost,
  savePost,
  getPostBy,
  getPostById,
  getPosts,
  updatePost,
  deleteMyPost,
  likePost,
  unlikePost,
};
