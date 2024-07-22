import Comment, { CommentDocument } from "../models/comment.model";
import dayjs from "dayjs";
import PostService from "./post.service";

export const getComments = async (postId: string) =>
  await Comment.find({ postId: postId });

export const createComment = ({
  body,
  userId,
  postId,
  replyTo,
}: {
  body: string;
  userId: string;
  postId: string;
  replyTo?: string;
}) =>
  new Comment({
    body,
    userId,
    postId,
    replyTo,
  });

export const saveComment = async (data: CommentDocument) => await data.save();

export const deleteComment = async (id: string, userId: string) => {
  const comment = await getCommentById(id);
  if (!comment) {
    throw (new Error("Comment not found.").name = "NotFound");
  }
  if (comment.userId.toString() !== userId) {
    throw (new Error("You cannot delete another person comment").name =
      "Forbidden");
  }

  comment.deletedAt = dayjs().toDate();
  await comment.save();
};

export const getCommentById = async (id: string) =>
  await Comment.findOne({ _id: id, deletedAt: undefined });

export const updateComment = async (
  commentId: string,
  userId: string,
  body: string
): Promise<CommentDocument> => {
  const comment = await getCommentById(commentId);

  if (!comment) {
    throw (new Error("Comment is not found").name = "NotFound");
  }

  if (comment.userId.toString() !== userId) {
    throw (new Error("You cannot edit another user comment").name =
      "Forbidden");
  }

  comment.body = body;
  await comment.save();
  return comment;
};

export const getCommentBy = async (prop: string, value: string) =>
  await Comment.find({ [prop]: value, deletedAt: undefined });

export const replyComment = async ({
  body,
  userId,
  replyTo,
}: {
  body: string;
  userId: string;
  replyTo: string;
}) => {
  const comment = await getCommentById(replyTo);
  if (!comment) {
    throw (new Error("Comment not found").name = "NotFound");
  }

  const newComment = createComment({
    body,
    userId,
    postId: comment.postId.toString(),
    replyTo: comment.id,
  });

  return await saveComment(newComment);
};

export default {
  getComments,
  createComment,
  saveComment,
  deleteComment,
  updateComment,
  getCommentById,
  replyComment,
  getCommentBy,
};