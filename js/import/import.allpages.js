/*
 * All Pages Navigation Handler
 */
/* global WebImporter */

const LAST_PAGE_KEY = 'importer-last-page-index';
let allImportedPages = [];
let currentPageIndex = 0;

/**
 * Store imported page result
 */
export function addImportedPage(result) {
  const pageData = {
    path: result.path,
    filename: result.filename,
    report: result.report,
    md: result.md,
    html: result.html,
    docx: result.docx,
    jcr: result.jcr,
    from: result.from,
  };
  
  allImportedPages.push(pageData);
  updateNavigationUI();
}

/**
 * Clear all imported pages
 */
export function clearImportedPages() {
  allImportedPages = [];
  currentPageIndex = 0;
  updateNavigationUI();
}

/**
 * Setup navigation buttons
 */
export function setupPageNavigation() {
  const prevBtn = document.getElementById('import-prev-page');
  const nextBtn = document.getElementById('import-next-page');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPageIndex > 0) {
        currentPageIndex--;
        showCurrentPage();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPageIndex < allImportedPages.length - 1) {
        currentPageIndex++;
        showCurrentPage();
      }
    });
  }
}

/**
 * Show the current page based on currentPageIndex
 */
function showCurrentPage() {
  if (allImportedPages.length === 0) return;

  const page = allImportedPages[currentPageIndex];
  
  // Save current page index to localStorage
  try {
    localStorage.setItem(LAST_PAGE_KEY, currentPageIndex.toString());
  } catch (e) {
    // localStorage not available
  }
  
  // Update preview with proper markdown to HTML conversion
  const previewContainer = document.getElementById('import-markdown-preview');
  if (previewContainer && page.md) {
    // XSS review: we need interpreted HTML here - <script> tags are removed by importer anyway
    previewContainer.innerHTML = WebImporter.md2html(page.md);
    
    // remove existing classes and styles (same as loadPreview)
    Array.from(previewContainer.querySelectorAll('[class], [style]')).forEach((t) => {
      t.removeAttribute('class');
      t.removeAttribute('style');
    });
  }

  // Update markdown source
  const markdownSource = document.getElementById('import-markdown-source');
  if (markdownSource && markdownSource.CodeMirror && page.md) {
    markdownSource.CodeMirror.setValue(page.md);
  }

  // Update HTML source
  const htmlSource = document.getElementById('import-transformed-html');
  if (htmlSource && htmlSource.CodeMirror && page.html) {
    htmlSource.CodeMirror.setValue(page.html);
  }

  // Update JCR source
  const jcrSource = document.getElementById('import-jcr');
  if (jcrSource && jcrSource.CodeMirror && page.jcr) {
    jcrSource.CodeMirror.setValue(page.jcr);
  }

  updateNavigationUI();
}

/**
 * Update the navigation UI
 */
function updateNavigationUI() {
  const navContainer = document.getElementById('import-pages-navigation');
  const prevBtn = document.getElementById('import-prev-page');
  const nextBtn = document.getElementById('import-next-page');
  const currentPageNumber = document.getElementById('import-current-page-number');
  const totalPages = document.getElementById('import-total-pages');
  const pageTitle = document.getElementById('import-current-page-title');

  if (!navContainer) return;

  if (allImportedPages.length === 0) {
    navContainer.classList.add('hidden');
    return;
  }

  navContainer.classList.remove('hidden');

  // Update page numbers
  if (currentPageNumber) {
    currentPageNumber.textContent = currentPageIndex + 1;
  }
  if (totalPages) {
    totalPages.textContent = allImportedPages.length;
  }

  // Update page title
  if (pageTitle && allImportedPages[currentPageIndex]) {
    const page = allImportedPages[currentPageIndex];
    const reportType = page.report?.type || 'unknown';
    const tabId = page.report?.tabId ? ` - ${page.report.tabId}` : '';
    pageTitle.textContent = `${page.path || page.filename}${tabId} (${reportType})`;
  }

  // Update button states
  if (prevBtn) {
    prevBtn.disabled = currentPageIndex === 0;
  }
  if (nextBtn) {
    nextBtn.disabled = currentPageIndex >= allImportedPages.length - 1;
  }
}

/**
 * Get all imported pages
 */
export function getAllImportedPages() {
  return allImportedPages;
}

/**
 * Navigate to first page after import
 */
export function showFirstPage() {
  if (allImportedPages.length === 0) return;
  
  // Try to restore last viewed page
  let targetIndex = 0;
  try {
    const savedIndex = localStorage.getItem(LAST_PAGE_KEY);
    if (savedIndex !== null) {
      const parsedIndex = parseInt(savedIndex, 10);
      // Validate that the saved index is within bounds
      if (parsedIndex >= 0 && parsedIndex < allImportedPages.length) {
        targetIndex = parsedIndex;
      }
    }
  } catch (e) {
    // localStorage not available, use default
  }
  
  currentPageIndex = targetIndex;
  showCurrentPage();
}
