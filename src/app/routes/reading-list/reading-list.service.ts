import prisma from '../../../prisma/prisma-client';
import HttpException from '../../models/http-exception.model';

export const createList = async (userId: number, name: string) => {
  if (!name || !name.trim()) {
    throw new HttpException(422, { errors: { name: ["can't be blank"] } });
  }

  const existing = await prisma.readingList.findFirst({ where: { userId, name } });
  if (existing) {
    throw new HttpException(422, { errors: { name: ['has already been taken'] } });
  }

  const list = await prisma.readingList.create({
    data: {
      name,
      user: { connect: { id: userId } },
    },
  });

  return list;
};

export const renameList = async (userId: number, listId: number, newName: string) => {
  if (!newName || !newName.trim()) {
    throw new HttpException(422, { errors: { name: ["can't be blank"] } });
  }

  const existing = await prisma.readingList.findUnique({ where: { id: listId }, include: { user: true } });
  if (!existing) {
    throw new HttpException(404, { errors: { readingList: ['not found'] } });
  }

  if (existing.userId !== userId) {
    throw new HttpException(403, { message: 'You are not authorized to rename this list' });
  }

  // check duplicate name for user
  const duplicate = await prisma.readingList.findFirst({ where: { userId, name: newName } });
  if (duplicate && duplicate.id !== listId) {
    throw new HttpException(422, { errors: { name: ['has already been taken'] } });
  }

  const updated = await prisma.readingList.update({ where: { id: listId }, data: { name: newName, updatedAt: new Date() } });
  return updated;
};

export const deleteList = async (userId: number, listId: number) => {
  const existing = await prisma.readingList.findUnique({ where: { id: listId } });
  if (!existing) {
    throw new HttpException(404, { errors: { readingList: ['not found'] } });
  }
  if (existing.userId !== userId) {
    throw new HttpException(403, { message: 'You are not authorized to delete this list' });
  }

  await prisma.readingList.delete({ where: { id: listId } });
};

export const addArticleToList = async (userId: number, listId: number, articleIdentifier: { id?: number; slug?: string }) => {
  const list = await prisma.readingList.findUnique({ where: { id: listId } });
  if (!list) {
    throw new HttpException(404, { errors: { readingList: ['not found'] } });
  }
  if (list.userId !== userId) {
    throw new HttpException(403, { message: 'You are not authorized to modify this list' });
  }

  let articleId: number | undefined = articleIdentifier.id;
  if (!articleId && articleIdentifier.slug) {
    const article = await prisma.article.findUnique({ where: { slug: articleIdentifier.slug } });
    if (!article) {
      throw new HttpException(404, { errors: { article: ['not found'] } });
    }
    articleId = article.id;
  }

  if (!articleId) {
    throw new HttpException(422, { errors: { article: ["can't be blank"] } });
  }

  // check if already present
  const existingItem = await prisma.readingListItem.findFirst({ where: { readingListId: listId, articleId } });
  if (existingItem) {
    return existingItem;
  }

  const item = await prisma.readingListItem.create({
    data: {
      readingList: { connect: { id: listId } },
      article: { connect: { id: articleId } },
    },
  });

  return item;
};

export const removeArticleFromList = async (userId: number, listId: number, articleId: number) => {
  const list = await prisma.readingList.findUnique({ where: { id: listId } });
  if (!list) {
    throw new HttpException(404, { errors: { readingList: ['not found'] } });
  }
  if (list.userId !== userId) {
    throw new HttpException(403, { message: 'You are not authorized to modify this list' });
  }

  const item = await prisma.readingListItem.findFirst({ where: { readingListId: listId, articleId } });
  if (!item) {
    throw new HttpException(404, { errors: { readingListItem: ['not found'] } });
  }

  await prisma.readingListItem.delete({ where: { id: item.id } });
};

export const listUserLists = async (userId: number) => {
  const lists = await prisma.readingList.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  return lists.map((l: any) => ({ id: l.id, name: l.name, createdAt: l.createdAt, updatedAt: l.updatedAt, articleCount: l._count?.items || 0 }));
};
