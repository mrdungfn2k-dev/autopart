"use client";
import MessagesInbox from "@/components/MessagesInbox";
import { useLang } from "@/lib/i18n";

export default function AdminMessagesPage() {
  const { lang } = useLang();
  const title = lang === "en" ? "Customer Messages" : lang === "zh" ? "客户消息" : "Tin nhắn khách hàng";
  return <MessagesInbox title={title} />;
}
