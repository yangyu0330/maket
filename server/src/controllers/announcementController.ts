import { Request, Response } from 'express';
import Announcement from '../models/Announcement';

// 공지사항 목록 조회
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    // 중요 공지 우선, 그 다음 최신순 정렬
    const announcements = await Announcement.find().sort({ important: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
};

// 공지사항 작성 (사장님 전용)
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, important } = req.body;
    
    const author = req.user?.role === 'owner' ? '사장님' : '관리자';

    const newAnnouncement = await Announcement.create({
      title,
      content,
      important: important || false,
      author,
    });

    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(500).json({ message: '공지사항 작성 실패' });
  }
};

// 공지사항 수정 (사장님 전용) - NEW
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, important } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, important },
      { new: true } // 업데이트된 문서 반환
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    res.json(updatedAnnouncement);
  } catch (err) {
    res.status(500).json({ message: '공지사항 수정 실패' });
  }
};

// 공지사항 삭제 (사장님 전용)
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패' });
  }
};

// 조회수 증가
export const increaseView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndUpdate(id, { $inc: { views: 1 } });
    res.json({ message: '조회수 증가' });
  } catch (err) {
    res.status(500).json({ message: '오류 발생' });
  }
};

// 좋아요 토글
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: '로그인 필요' });

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: '공지사항 없음' });

    // likes 배열에 userId가 있는지 확인
    const index = announcement.likes.indexOf(userId);
    
    if (index === -1) {
      // 없으면 추가 (좋아요)
      announcement.likes.push(userId);
    } else {
      // 있으면 제거 (좋아요 취소)
      announcement.likes.splice(index, 1);
    }

    await announcement.save();
    res.json({ likes: announcement.likes });
  } catch (err) {
    res.status(500).json({ message: '오류 발생' });
  }
};
