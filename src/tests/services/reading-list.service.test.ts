import prismaMock from '../prisma-mock';
import * as service from '../../app/routes/reading-list/reading-list.service';
import HttpException from '../../app/models/http-exception.model';

describe('ReadingListService', () => {
  const userId = 1;

  test('createList should create a new list', async () => {
    const name = 'Favorites';
    // @ts-ignore
    prismaMock.readingList.findFirst.mockResolvedValue(null);
    // @ts-ignore
    prismaMock.readingList.create.mockResolvedValue({ id: 1, name, userId, createdAt: new Date(), updatedAt: new Date() });

    await expect(service.createList(userId, name)).resolves.toHaveProperty('id');
  });

  test('createList should not allow blank name', async () => {
    await expect(service.createList(userId, ' ')).rejects.toThrow();
  });

  test('renameList should update name', async () => {
    const list = { id: 1, name: 'Old', userId };
    // @ts-ignore
    prismaMock.readingList.findUnique.mockResolvedValue(list);
    // @ts-ignore
    prismaMock.readingList.findFirst.mockResolvedValue(null);
    // @ts-ignore
    prismaMock.readingList.update.mockResolvedValue({ ...list, name: 'New' });

    await expect(service.renameList(userId, 1, 'New')).resolves.toHaveProperty('name', 'New');
  });

  test('renameList non-existent returns 404', async () => {
    // @ts-ignore
    prismaMock.readingList.findUnique.mockResolvedValue(null);
    await expect(service.renameList(userId, 999, 'New')).rejects.toThrow();
  });

  test('deleteList should delete when owner', async () => {
    // @ts-ignore
    prismaMock.readingList.findUnique.mockResolvedValue({ id: 2, userId });
    // @ts-ignore
    prismaMock.readingList.delete.mockResolvedValue({});
    await expect(service.deleteList(userId, 2)).resolves.toBeUndefined();
  });

  test('addArticleToList should add if not present', async () => {
    // list exists
    // @ts-ignore
    prismaMock.readingList.findUnique.mockResolvedValue({ id: 3, userId });
    // article lookup by slug
    // @ts-ignore
    prismaMock.article.findUnique.mockResolvedValue({ id: 5 });
    // item not existing
    // @ts-ignore
    prismaMock.readingListItem.findFirst.mockResolvedValue(null);
    // create item
    // @ts-ignore
    prismaMock.readingListItem.create.mockResolvedValue({ id: 11, readingListId: 3, articleId: 5 });

    await expect(service.addArticleToList(userId, 3, { slug: 'an-article' })).resolves.toHaveProperty('id');
  });

  test('addArticleToList should be idempotent', async () => {
    // list exists
    // @ts-ignore
    prismaMock.readingList.findUnique.mockResolvedValue({ id: 4, userId });
    // article id provided
    // @ts-ignore
    prismaMock.readingListItem.findFirst.mockResolvedValue({ id: 21, readingListId: 4, articleId: 7 });
    await expect(service.addArticleToList(userId, 4, { id: 7 })).resolves.toHaveProperty('id', 21);
  });

  test('removeArticleFromList should remove item', async () => {
    // list exists
    // @ts-ignore
    prismaMock.readingList.findUnique.mockResolvedValue({ id: 6, userId });
    // item exists
    // @ts-ignore
    prismaMock.readingListItem.findFirst.mockResolvedValue({ id: 31, readingListId: 6, articleId: 8 });
    // delete
    // @ts-ignore
    prismaMock.readingListItem.delete.mockResolvedValue({});

    await expect(service.removeArticleFromList(userId, 6, 8)).resolves.toBeUndefined();
  });

  test('listUserLists returns lists with articleCount', async () => {
    // @ts-ignore
    prismaMock.readingList.findMany.mockResolvedValue([
      { id: 1, name: 'L1', createdAt: new Date(), updatedAt: new Date(), _count: { items: 2 } },
    ]);

    await expect(service.listUserLists(userId)).resolves.toEqual([
      expect.objectContaining({ id: 1, name: 'L1', articleCount: 2 }),
    ]);
  });
});
