import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_COLORS = {
  "Side Effects": "bg-red-100 text-red-700",
  "Nutrition": "bg-green-100 text-green-700",
  "Medication Guide": "bg-blue-100 text-blue-700",
  "Tracking Tips": "bg-purple-100 text-purple-700",
  "FAQ": "bg-amber-100 text-amber-700",
};

// Lightweight markdown renderer (no external deps)
function renderMarkdown(md = "") {
  const lines = md.split("\n");
  const html = [];
  let inList = false;
  let inBlockquote = false;

  const inline = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#2ECC71] underline" target="_blank">$1</a>');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Close open blocks on blank line
    if (line.trim() === "") {
      if (inList) { html.push("</ul>"); inList = false; }
      if (inBlockquote) { html.push("</blockquote>"); inBlockquote = false; }
      html.push('<div class="h-3"></div>');
      continue;
    }

    // Headings
    if (/^### /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h3 class="text-lg font-bold text-gray-900 font-heading mt-6 mb-2">${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (/^## /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h2 class="text-xl font-bold text-gray-900 font-heading mt-8 mb-3">${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (/^# /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h1 class="text-2xl font-bold text-gray-900 font-heading mt-8 mb-3">${inline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (/^> /.test(line)) {
      if (inList) { html.push("</ul>"); inList = false; }
      if (!inBlockquote) { html.push('<blockquote class="border-l-4 border-[#2ECC71] pl-4 my-4 text-gray-600 italic">'); inBlockquote = true; }
      html.push(`<p>${inline(line.slice(2))}</p>`);
      continue;
    } else if (inBlockquote) {
      html.push("</blockquote>"); inBlockquote = false;
    }

    // List item
    if (/^[-*] /.test(line)) {
      if (!inList) { html.push('<ul class="list-none space-y-1.5 my-3">'); inList = true; }
      html.push(`<li class="flex items-start gap-2 text-gray-700"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2ECC71] flex-shrink-0"></span><span>${inline(line.slice(2))}</span></li>`);
      continue;
    } else if (inList) {
      html.push("</ul>"); inList = false;
    }

    // Horizontal rule
    if (/^---/.test(line)) {
      html.push('<hr class="my-6 border-gray-200" />');
      continue;
    }

    // Table (simple: | col | col |)
    if (/^\|/.test(line)) {
      if (/^[\|\s\-:]+$/.test(line)) continue; // separator row
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      const isHeader = i > 0 && /^[\|\s\-:]+$/.test(lines[i + 1] || "");
      const tag = isHeader ? "th" : "td";
      const cellClass = isHeader
        ? "px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50"
        : "px-4 py-3 text-sm text-gray-700 border-t border-gray-100";
      html.push(`<div class="overflow-x-auto my-4"><table class="w-full border border-gray-100 rounded-xl overflow-hidden"><tr>${cells.map(c => `<${tag} class="${cellClass}">${inline(c)}</${tag}>`).join("")}</tr></table></div>`);
      continue;
    }

    // Paragraph
    html.push(`<p class="text-gray-700 leading-relaxed">${inline(line)}</p>`);
  }

  if (inList) html.push("</ul>");
  if (inBlockquote) html.push("</blockquote>");

  return html.join("\n");
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    base44.entities.BlogPost.filter({ slug, published: true }, "-created_date", 1)
      .then(results => {
        if (results.length === 0) setNotFound(true);
        else setPost(results[0]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="space-y-2 mt-8">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Post not found</h1>
        <p className="text-gray-500 mb-6">This article may have been moved or unpublished.</p>
        <Link to="/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover image */}
      {post.cover_image_url && (
        <div className="w-full h-56 md:h-80 overflow-hidden bg-gray-100">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="mb-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading leading-tight mt-3 mb-4">
          {post.title}
        </h1>

        {post.meta_description && (
          <p className="text-lg text-gray-500 leading-relaxed mb-6">{post.meta_description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {post.author}
            </span>
          )}
          {post.read_time && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {post.read_time} min read
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className="prose-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content || "") }}
        />

        {/* CTA */}
        <div className="mt-14 bg-gradient-to-br from-[#2ECC71]/10 to-emerald-50 border border-[#2ECC71]/20 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-[#2ECC71]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-[#2ECC71]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-heading mb-2">
            Track your GLP-1 journey with ThinShot
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Log doses, monitor weight loss, track side effects — all in one private app.
          </p>
          <Link to="/upgrade">
            <Button className="bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}