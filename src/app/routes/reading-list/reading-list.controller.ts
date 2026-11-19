import { NextFunction, Request, Response, Router } from 'express';
import auth from '../auth/auth';
import * as service from './reading-list.service';

const router = Router();

router.get('/user/reading-lists', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    const lists = await service.listUserLists(userId);
    res.json({ readingLists: lists });
  } catch (error) {
    next(error);
  }
});

router.post('/user/reading-lists', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    const { name } = req.body || {};
    const list = await service.createList(userId, name);
    res.status(201).json({ readingList: list });
  } catch (error) {
    next(error);
  }
});

router.put('/user/reading-lists/:id', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    const { id } = req.params;
    const { name } = req.body || {};
    const updated = await service.renameList(userId, Number(id), name);
    res.json({ readingList: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/user/reading-lists/:id', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    const { id } = req.params;
    await service.deleteList(userId, Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/user/reading-lists/:id/articles', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    const { id } = req.params;
    const { articleId, slug } = req.body || {};
    const item = await service.addArticleToList(userId, Number(id), { id: articleId, slug });
    res.status(201).json({ readingListItem: item });
  } catch (error) {
    next(error);
  }
});

router.delete('/user/reading-lists/:id/articles/:articleId', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    const { id, articleId } = req.params;
    await service.removeArticleFromList(userId, Number(id), Number(articleId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
