// ===== BLOG UTILITIES =====

// Parse markdown file name to extract date and title
function parseMarkdownFilename(filename) {
  // Format: YYYY-MM-DD — Title.md or YYYY-MM-DD-title.md
  // First try with em dash format
  let match = filename.match(/^(\d{4}-\d{2}-\d{2})\s*—\s*(.+)\.md$/);
  let title = '';
  
  if (match) {
    title = match[2];
  } else {
    // Try hyphen format: YYYY-MM-DD-title.md
    match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      // Extract title from content file (first line after date)
      title = match[2].replace(/-/g, ' '); // Temporary, will be read from file
    }
  }
  
  if (match) {
    // Create slug from filename (remove .md, convert to lowercase)
    const baseSlug = filename.replace('.md', '').toLowerCase();
    
    return {
      date: match[1],
      title: title, // Will be updated when content is loaded
      slug: baseSlug,
      filename: filename
    };
  }
  return null;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Extract excerpt from markdown content
function extractExcerpt(content, maxLength = 150) {
  // Remove the date/title header line (first line) and markdown formatting
  const lines = content.split('\n');
  const contentWithoutHeader = lines.slice(1).join('\n');
  
  const text = contentWithoutHeader
    .replace(/^#+\s+.+\n/gm, '') // Remove headers
    .replace(/\*\*|__|\*|_/g, '') // Remove bold/italic markers
    .trim();
  
  const firstParagraph = text.split('\n\n')[0] || text;
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

// Load markdown file
async function loadMarkdownFile(filename) {
  try {
    const response = await fetch(`content/blog/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading markdown file:', error);
    return null;
  }
}

// Get list of blog posts
async function getBlogPosts() {
  try {
    // Load posts list from JSON file
    let postsList = [];
    try {
      const response = await fetch('content/blog/posts.json');
      if (response.ok) {
        postsList = await response.json();
      } else {
        // Fallback to hardcoded list
        postsList = ['2025-11-10 — Fuck it. Here it is.md'];
      }
    } catch (e) {
      // Fallback to hardcoded list
      postsList = ['2025-11-10 — Fuck it. Here it is.md'];
    }
    
    const posts = [];
    
    for (const filename of postsList) {
      const parsed = parseMarkdownFilename(filename);
      if (parsed) {
        const content = await loadMarkdownFile(filename);
        if (content) {
          // Extract title from first line of content if filename doesn't have em dash
          let title = parsed.title;
          const firstLine = content.split('\n')[0];
          const titleMatch = firstLine.match(/^\d{4}-\d{2}-\d{2}\s*—\s*(.+)$/);
          if (titleMatch) {
            title = titleMatch[1];
          }
          
          posts.push({
            ...parsed,
            title: title,
            filename,
            content,
            excerpt: extractExcerpt(content)
          });
        }
      }
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return posts;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
}

// Render markdown to HTML (using marked.js)
function renderMarkdown(markdown) {
  // Remove the date/title header line (first line)
  const lines = markdown.split('\n');
  const contentWithoutHeader = lines.slice(1).join('\n').trim();
  
  // Replace em dashes with regular hyphens
  const contentWithoutEmDashes = contentWithoutHeader.replace(/—/g, '-');
  
  if (typeof marked !== 'undefined') {
    return marked.parse(contentWithoutEmDashes);
  }
  // Fallback: simple markdown parsing
  return contentWithoutEmDashes
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*)$/gm, '<p>$1</p>');
}

// Initialize blog listing page
async function initBlogList() {
  const blogList = document.getElementById('blog-list');
  const loadingEl = document.getElementById('blog-loading');
  
  if (!blogList) return;
  
  const posts = await getBlogPosts();
  
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
  
  if (posts.length === 0) {
    blogList.innerHTML = '<div class="blog-empty"><p>No blog posts yet. Check back soon!</p></div>';
    return;
  }
  
  blogList.innerHTML = posts.map(post => `
    <li class="blog-list-item">
      <a href="blog-post.html?slug=${post.slug}" class="blog-post-link">
        <span class="blog-post-date">${formatDate(post.date)}</span>
        <h2 class="blog-post-title">${post.title}</h2>
        <p class="blog-post-excerpt">${post.excerpt}</p>
      </a>
    </li>
  `).join('');
}

// Initialize blog post page
async function initBlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  if (!slug) {
    window.location.href = 'blog.html';
    return;
  }
  
  const posts = await getBlogPosts();
  // Try to find post by slug, or by filename if slug doesn't match
  let post = posts.find(p => p.slug === slug);
  if (!post) {
    // Try matching by filename without extension
    const filenameSlug = slug.replace(/-/g, ' ');
    post = posts.find(p => p.filename.toLowerCase().replace('.md', '').replace(/\s+/g, '-') === slug);
  }
  
  if (!post) {
    document.getElementById('blog-post-content').innerHTML = '<p>Post not found.</p>';
    return;
  }
  
  // Set page title
  document.title = `${post.title} — Blog | Nereo`;
  
  // Render post header
  const postHeader = document.getElementById('blog-post-header');
  if (postHeader) {
    postHeader.innerHTML = `
      <div class="blog-post-meta">
        <span class="blog-post-date-large">${formatDate(post.date)}</span>
      </div>
      <h1 class="blog-post-title">${post.title}</h1>
    `;
  }
  
  // Render post content
  const postContent = document.getElementById('blog-post-content');
  if (postContent) {
    // Load marked.js if not already loaded
    if (typeof marked === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.onload = () => {
        postContent.innerHTML = renderMarkdown(post.content);
      };
      document.head.appendChild(script);
    } else {
      postContent.innerHTML = renderMarkdown(post.content);
    }
  }
}

// Force light mode on blog pages
function forceLightMode() {
  if (document.body.classList.contains('blog-page')) {
    document.documentElement.setAttribute('data-theme', 'light');
    // Prevent theme toggle from changing it
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = 'none';
    }
  }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  forceLightMode();
  
  if (window.location.pathname.includes('blog-post.html')) {
    initBlogPost();
  } else if (window.location.pathname.includes('blog.html')) {
    initBlogList();
  }
});

