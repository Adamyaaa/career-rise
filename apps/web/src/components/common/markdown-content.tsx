"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div className={cn("w-full text-sm leading-relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground mt-4 mb-2 pb-1 border-b border-border/40 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-heading text-base font-semibold text-foreground mt-3 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-heading text-sm font-semibold text-foreground mt-2 mb-1 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-2 text-sm leading-relaxed text-foreground/90 first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 list-disc list-outside pl-5 space-y-1.5 text-sm text-foreground/90 first:mt-0 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal list-outside pl-5 space-y-1.5 text-sm text-foreground/90 first:mt-0 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-primary/70 bg-primary/5 px-3.5 py-2.5 rounded-r-lg italic text-sm text-foreground/85 first:mt-0 last:mb-0">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-border/70 first:mt-0 last:mb-0">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/70 border-b border-border/70 text-foreground font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border/40">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 font-semibold text-foreground">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-foreground/90">{children}</td>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            return isInline ? (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="overflow-x-auto rounded-xl bg-muted/80 p-3.5 font-mono text-xs leading-relaxed text-foreground my-3 ring-1 ring-border/50 first:mt-0 last:mb-0">
                <code>{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-border/50" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
