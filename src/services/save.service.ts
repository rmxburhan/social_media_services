import dayjs from "dayjs";
import Save, { SaveDocument, SaveQuery } from "../models/save.model";

export const getSaves = async (query: SaveQuery): Promise<SaveDocument[]> => {
  const saves = await Save.find(query).sort({ createdAt: -1 });

  return saves;
};

export const getSaveById = async (id: string): Promise<SaveDocument> => {
  const save = await Save.findById(id);

  if (!save) {
    throw (new Error("Save not found").name = "NotFound");
  }
  return save;
};

export const deleteMySaved = async (id: string, userId: string) => {
  const saveData = await getSaveById(id);
  if (saveData.userId.toString() !== userId) {
    throw (new Error("You cannot delete another user saved post").name =
      "Forbidden");
  }
  await Save.deleteOne({ _id: saveData._id });
};

export const createSave = async ({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) => {
  return Save.create({
    postId,
    userId,
    createdAt: dayjs().toDate(),
  });
};

export const getSaveBy = async (query: SaveQuery) => await Save.findOne(query);

export default {
  getSaves,
  getSaveById,
  deleteMySaved,
  getSaveBy,
  createSave,
};
