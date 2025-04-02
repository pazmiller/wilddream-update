//
//  NotificationService.m
//  XGExtension
//
//  Created by 雪麒·拉撒路 on 01/02/2023.
//

#import "NotificationService.h"
#import "XGExtension.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    [XGExtension defaultManager].reportDomainName = @"tpns.sh.tencent.com";  /// 上海集群
    [[XGExtension defaultManager] handleNotificationRequest:request accessID: 1680013712 accessKey: @"I7F3CRIMTADF"
          contentHandler:^(NSArray<UNNotificationAttachment *> * _Nullable attachments, NSError * _Nullable error) {
          self.bestAttemptContent.attachments = attachments;
          self.contentHandler(self.bestAttemptContent);  // 如果需要在弹出通知前增加业务逻辑，请在contentHandler调用之前处理。
    }];
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
