import type { Category } from "@/lib/categories";

/// Gives a whole page the identity of one category: the body backdrop plus
/// accent variables (--theme-accent / --theme-soft) that themed sections read.
/// The backdrop is set on `body` because an opaque body background would paint
/// over any fixed element behind it.
export function CategoryTheme({ category }: { category: Category }) {
  const css = [
    `:root{--theme-accent:${category.accent};--theme-soft:${category.accentSoft};}`,
    `body{background-image:${category.pageBackground};background-attachment:fixed;background-repeat:no-repeat;background-size:cover;}`,
  ].join("");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
