"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { sendMessage, type ChatState } from "@/app/actions/chat";

export type ChatMessageView = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorId: string;
  department: string | null;
};

const initialState: ChatState = {};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ChatRoomView({
  slug,
  messages,
  currentUserId,
}: {
  slug: string;
  messages: ChatMessageView[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(sendMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const lastMessageId = messages.at(-1)?.id;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 7000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex h-[70vh] min-h-[460px] flex-col overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-7">
        {messages.length === 0 ? (
          <p className="text-sm text-[#6B6B85]">
            Nothing here yet. Start the conversation.
          </p>
        ) : null}

        {messages.map((message) => {
          const mine = message.authorId === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${mine ? "flex-row-reverse text-right" : ""}`}
            >
              <span
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tracking-wide"
                style={{
                  borderColor: "var(--theme-accent, #7C5CFF)",
                  color: "var(--theme-accent, #7C5CFF)",
                  background: "var(--theme-soft, rgba(124,92,255,0.14))",
                }}
              >
                {initials(message.authorName)}
              </span>
              <div className={`max-w-[78%] ${mine ? "items-end" : ""}`}>
                <p className="text-xs text-[#6B6B85]">
                  {mine ? "You" : message.authorName}
                  {message.department ? ` · ${message.department}` : ""}
                  {" · "}
                  {message.createdAt}
                </p>
                <p
                  className={`mt-1 inline-block rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    mine
                      ? "text-[color:var(--color-ink)]"
                      : "border border-white/10 bg-white/8 text-[#E7E6F5]"
                  }`}
                  style={mine ? { background: "var(--theme-accent, #7C5CFF)" } : undefined}
                >
                  {message.body}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        ref={formRef}
        action={(formData) => {
          formAction(formData);
          formRef.current?.reset();
        }}
        className="border-t border-[color:var(--color-line)] bg-black/25 p-4 sm:p-5"
      >
        <input type="hidden" name="slug" value={slug} />
        <div className="flex items-center gap-3">
          <input
            name="body"
            autoComplete="off"
            maxLength={600}
            placeholder="Message the room"
            className="min-w-0 flex-1 rounded-full border border-white/12 bg-black/40 px-5 py-3 text-sm text-[color:var(--color-chalk)] outline-none transition focus:border-white/40"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--color-ink)] transition disabled:opacity-50"
            style={{ background: "var(--theme-accent, #7C5CFF)" }}
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
        {state.error ? (
          <p className="mt-2 text-xs text-[#FF8A8A]">{state.error}</p>
        ) : null}
      </form>
    </div>
  );
}
