import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, LogOut, Users } from "lucide-react";
import { joinRoom, leaveRoom } from "@/app/actions/chat";
import { CategoryTheme } from "@/components/category-theme";
import { ChatRoomView, type ChatMessageView } from "@/components/chat-room";
import { getSessionUser } from "@/lib/auth";
import { getCategory } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = await prisma.chatRoom.findUnique({ where: { slug } });
  if (!room) return { title: "Room not found" };
  return { title: room.name, description: room.topic };
}

export default async function RoomPage({ params }: Props) {
  const { slug } = await params;
  const [room, user] = await Promise.all([
    prisma.chatRoom.findUnique({
      where: { slug },
      include: { _count: { select: { members: true } } },
    }),
    getSessionUser(),
  ]);

  if (!room) notFound();
  if (!user) redirect("/login");

  const category = getCategory(room.category);
  const Icon = category.icon;

  const member = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
  });

  const messages: ChatMessageView[] = member
    ? (
        await prisma.chatMessage.findMany({
          where: { roomId: room.id },
          orderBy: { createdAt: "desc" },
          take: 200,
          include: { user: { select: { id: true, name: true, department: true } } },
        })
      )
        .reverse()
        .map((message) => ({
        id: message.id,
        body: message.body,
        createdAt: formatTime(message.createdAt),
        authorId: message.user.id,
        authorName: message.user.name,
        department: message.user.department,
      }))
    : [];

  return (
    <div className="grain mx-auto max-w-4xl px-5 py-12 sm:px-8 md:py-16">
      <CategoryTheme category={category} />

      <Link
        href="/rooms"
        className="inline-flex items-center gap-2 text-sm text-[#9A99B5] transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All rooms
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p
            className="eyebrow inline-flex items-center gap-2"
            style={{ color: category.accent }}
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </p>
          <h1 className="display mt-3 text-4xl leading-[0.95] text-[color:var(--color-chalk)] md:text-6xl">
            {room.name}
          </h1>
          <p className="mt-3 max-w-xl text-[#9A99B5]">{room.topic}</p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-[#6B6B85]">
          <Users className="h-4 w-4" />
          {room._count.members} in room
        </p>
      </div>

      <div className="mt-8">
        {member ? (
          <>
            <ChatRoomView slug={room.slug} messages={messages} currentUserId={user.id} />
            <form action={leaveRoom} className="mt-4 flex justify-end">
              <input type="hidden" name="slug" value={room.slug} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-[#9A99B5] transition hover:border-white/40 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Leave room
              </button>
            </form>
          </>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: category.gradient }}
            />
            <div className="relative">
              <h2 className="display text-3xl text-[color:var(--color-chalk)]">
                Enter the room
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-[#C9C7E0]">
                Messages stay inside the room. Enter to read along and post.
              </p>
              <form action={joinRoom} className="mt-7">
                <input type="hidden" name="slug" value={room.slug} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:brightness-110"
                  style={{ background: category.accent }}
                >
                  Enter room
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
