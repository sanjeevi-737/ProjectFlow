import Notification from '../models/Notification.js';
import { emitToUser } from '../socket/index.js';

class NotificationService {
  async create(data) {
    const notification = await Notification.create(data);

    if (data.recipient) {
      const populated = await notification.populate('sender', 'name email avatar');
      emitToUser(data.recipient.toString(), 'notification:received', populated.toObject());
    }

    return notification;
  }

  async bulkCreate(notifications) {
    if (notifications.length === 0) return [];

    const created = await Notification.insertMany(notifications);

    for (const notif of created) {
      if (notif.recipient) {
        emitToUser(notif.recipient.toString(), 'notification:received', notif.toObject());
      }
    }

    return created;
  }
}

export default new NotificationService();
