// Revo Browser - Renderer Process
// Built with 20 years of browser development expertise

class RevoBrowser {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabCounter = 0;
    this.bookmarks = this.loadFromStorage('revo_bookmarks') || [];
    this.history = this.loadFromStorage('revo_history') || [];
    this.settings = this.loadFromStorage('revo_settings') || {
      theme: 'dark',
      showBookmarksBar: true,
      searchEngine: 'google',
      blockPopups: true,
      doNotTrack: false,
    };

    this.init();
  }

  init() {
    this.applySettings();
    this.bindEvents();
    this.renderBookmarksBar();
    this.createTab();
    this.updateStatus('Ready');
    this.updateStats();
    this.initTipsRotation();
  }

  // Storage Helpers
  loadFromStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Settings
  applySettings() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    
    const bookmarksBar = document.getElementById('bookmarksBar');
    if (!this.settings.showBookmarksBar) {
      bookmarksBar.classList.add('hidden');
    }

    // Update UI controls
    document.getElementById('themeSelect').value = this.settings.theme;
    document.getElementById('bookmarksBarToggle').checked = this.settings.showBookmarksBar;
    document.getElementById('searchEngineSelect').value = this.settings.searchEngine;
    document.getElementById('popupBlockToggle').checked = this.settings.blockPopups;
    document.getElementById('dntToggle').checked = this.settings.doNotTrack;
  }

  saveSettings() {
    this.saveToStorage('revo_settings', this.settings);
  }

  // Tab Management
  createTab(url = null) {
    const tabId = ++this.tabCounter;
    const tab = {
      id: tabId,
      title: 'New Tab',
      url: url || 'about:newtab',
      history: [],
      historyIndex: -1,
      isLoading: false,
    };

    this.tabs.push(tab);
    this.renderTabs();
    
    // Only create webview if a URL is provided
    if (url) {
      this.createWebView(tab);
      this.navigate(tabId, url);
    }
    
    this.switchToTab(tabId);
    this.updateStats();

    return tab;
  }

  closeTab(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    // Remove webview
    const webView = document.getElementById(`webview-${tabId}`);
    if (webView) webView.remove();

    // Remove tab
    this.tabs.splice(index, 1);

    // If closed tab was active, switch to another
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        this.switchToTab(this.tabs[Math.max(0, index - 1)].id);
      } else {
        this.createTab();
      }
    }

    this.renderTabs();
    this.updateStats();
  }

  switchToTab(tabId) {
    // Hide all webviews and new tab pages
    document.querySelectorAll('.webview-container').forEach(el => {
      el.classList.remove('active');
    });
    
    const newTabPage = document.getElementById('newTabPage');
    newTabPage.classList.remove('active');

    // Show selected tab's content
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    this.activeTabId = tabId;

    if (tab.url === 'about:newtab') {
      newTabPage.classList.add('active');
    } else {
      const webView = document.getElementById(`webview-${tabId}`);
      if (webView) webView.classList.add('active');
    }

    // Update URL bar
    this.updateUrlBar(tab.url);
    this.renderTabs();
    this.updateNavigationButtons();
  }

  renderTabs() {
    const container = document.getElementById('tabsContainer');
    container.innerHTML = '';

    this.tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tab.id === this.activeTabId ? 'active' : ''}`;
      tabEl.dataset.tabId = tab.id;
      tabEl.innerHTML = `
        <span class="tab-icon">
          <i class="fas fa-globe"></i>
        </span>
        <span class="tab-title">${this.escapeHtml(tab.title)}</span>
        <button class="tab-close" data-tab-id="${tab.id}">
          <i class="fas fa-times"></i>
        </button>
      `;

      tabEl.addEventListener('click', (e) => {
        if (!e.target.closest('.tab-close')) {
          this.switchToTab(tab.id);
        }
      });

      tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      });

      // Middle click to close
      tabEl.addEventListener('auxclick', (e) => {
        if (e.button === 1) {
          this.closeTab(tab.id);
        }
      });

      container.appendChild(tabEl);
    });
  }

  createWebView(tab) {
    const container = document.getElementById('viewsContainer');
    const webView = document.createElement('div');
    webView.className = 'webview-container';
    webView.id = `webview-${tab.id}`;
    webView.innerHTML = `<webview allowpopups="${!this.settings.blockPopups}" webpreferences="javascript=yes,webSecurity=yes"></webview>`;
    container.appendChild(webView);

    const webview = webView.querySelector('webview');
    let isDomReady = false;

    // Wait for DOM ready before any operations
    webview.addEventListener('dom-ready', () => {
      isDomReady = true;
    });

    webview.addEventListener('did-start-loading', () => {
      tab.isLoading = true;
      this.updateStatus('Loading...');
      this.renderTabs();
      this.updateNavigationButtons();
    });

    webview.addEventListener('did-stop-loading', () => {
      tab.isLoading = false;
      const title = isDomReady ? webview.getTitle() : tab.title;
      if (title && title !== 'about:blank') {
        tab.title = title;
      }
      this.updateStatus('Ready');
      this.renderTabs();
      this.updateNavigationButtons();
    });

    webview.addEventListener('did-navigate', (e) => {
      tab.url = e.url;
      const title = isDomReady ? webview.getTitle() : e.url;
      if (title !== 'about:blank' && title !== e.url) {
        tab.title = title;
      }
      this.addToHistory(tab.title, e.url);
      this.updateUrlBar(e.url);
      this.updateBookmarkButton(e.url);
      this.updateNavigationButtons();
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
      tab.url = e.url;
      this.updateUrlBar(e.url);
      this.updateNavigationButtons();
    });

    webview.addEventListener('page-favicon-updated', (e) => {
      // Could update tab icon here
    });

    webview.addEventListener('new-window', (e) => {
      e.preventDefault();
      this.createTab(e.url);
    });

    // Update URL bar on navigation entries change
    webview.addEventListener('load-commit', (e) => {
      if (e.isMainFrame) {
        tab.url = e.url;
        this.updateUrlBar(e.url);
        this.updateNavigationButtons();
      }
    });

    // Store webview reference on tab
    tab.webview = webview;
  }

  // Navigation
  navigate(tabId, url) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Handle special URLs
    if (url === 'about:newtab') {
      tab.url = url;
      this.switchToTab(tabId);
      return;
    }

    // Convert to full URL if needed
    url = this.normalizeUrl(url);

    // Update history
    if (tab.historyIndex < tab.history.length - 1) {
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
    }
    tab.history.push(url);
    tab.historyIndex++;

    tab.url = url;

    // Create webview if it doesn't exist
    let webView = document.getElementById(`webview-${tabId}`);
    if (!webView) {
      this.createWebView(tab);
      webView = document.getElementById(`webview-${tabId}`);
    }

    if (webView) {
      const webview = webView.querySelector('webview');
      // Use loadURL instead of setting src to avoid about:blank issues
      webview.loadURL(url);
      webView.classList.add('active');
      document.getElementById('newTabPage').classList.remove('active');
    }

    this.updateUrlBar(url);
    this.updateNavigationButtons();
    this.addToHistory(tab.title, url);
  }

  goBack() {
    const tab = this.getActiveTab();
    if (!tab || tab.url === 'about:newtab') {
      return;
    }

    const webView = document.getElementById(`webview-${tab.id}`);
    if (!webView) return;

    const webview = webView.querySelector('webview');
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  }

  goForward() {
    const tab = this.getActiveTab();
    if (!tab || tab.url === 'about:newtab') {
      return;
    }

    const webView = document.getElementById(`webview-${tab.id}`);
    if (!webView) return;

    const webview = webView.querySelector('webview');
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  }

  refresh() {
    const tab = this.getActiveTab();
    if (!tab || tab.url === 'about:newtab') {
      return;
    }

    const webView = document.getElementById(`webview-${tab.id}`);
    if (webView) {
      const webview = webView.querySelector('webview');
      if (webview) {
        webview.reload();
      }
    }
  }

  goHome() {
    const tab = this.getActiveTab();
    if (tab) {
      tab.url = 'about:newtab';
      tab.title = 'New Tab';
      this.switchToTab(tab.id);
    }
  }

  // URL Bar
  updateUrlBar(url) {
    const urlInput = document.getElementById('urlInput');
    const urlIcon = document.getElementById('urlIcon');

    if (url === 'about:newtab') {
      urlInput.value = '';
      urlIcon.innerHTML = '<i class="fas fa-search"></i>';
    } else {
      urlInput.value = url;
      const isSecure = url.startsWith('https');
      urlIcon.innerHTML = isSecure 
        ? '<i class="fas fa-lock" style="color: var(--success)"></i>'
        : '<i class="fas fa-globe"></i>';
    }
  }

  normalizeUrl(input) {
    let url = input.trim();

    if (!url) return 'about:newtab';

    // Check if it's already a full URL
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Check if it looks like a domain (has TLD and no spaces)
    if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(url) && !/\s/.test(url) && !/ /.test(url)) {
      return 'https://' + url;
    }

    // Otherwise, treat as search query
    const engines = {
      google: 'https://www.google.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      bing: 'https://www.bing.com/search?q=',
    };

    return engines[this.settings.searchEngine] + encodeURIComponent(url);
  }

  handleUrlInput(value) {
    const suggestions = document.getElementById('urlSuggestions');
    
    if (!value.trim()) {
      suggestions.classList.remove('active');
      return;
    }

    // Generate suggestions from history and bookmarks
    const historySuggestions = this.history.slice(-20).reverse();
    const bookmarkSuggestions = this.bookmarks;
    
    const allSuggestions = [...historySuggestions, ...bookmarkSuggestions];
    
    const matches = allSuggestions.filter(item => {
      const url = typeof item === 'string' ? item : item.url;
      const title = typeof item === 'string' ? item : item.title;
      const searchStr = (url + ' ' + title).toLowerCase();
      return searchStr.includes(value.toLowerCase());
    }).slice(0, 6);

    if (matches.length > 0) {
      suggestions.innerHTML = matches.map(item => {
        const url = typeof item === 'string' ? item : item.url;
        const title = typeof item === 'string' ? item : item.title;
        return `
          <div class="suggestion-item" data-url="${this.escapeHtml(url)}">
            <span class="suggestion-icon">
              <i class="fas fa-globe"></i>
            </span>
            <div class="suggestion-text">${this.escapeHtml(title)}</div>
            <div class="suggestion-url">${this.escapeHtml(url)}</div>
          </div>
        `;
      }).join('');
      suggestions.classList.add('active');
    } else {
      // Show search suggestion
      suggestions.innerHTML = `
        <div class="suggestion-item" data-search="true" data-query="${this.escapeHtml(value)}">
          <span class="suggestion-icon">
            <i class="fas fa-search"></i>
          </span>
          <div class="suggestion-text">Search for "${this.escapeHtml(value)}"</div>
          <div class="suggestion-url">${this.settings.searchEngine}</div>
        </div>
      `;
      suggestions.classList.add('active');
    }
    
    // Add click handlers
    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.search === 'true') {
          value = item.dataset.query;
        } else {
          value = item.dataset.url;
        }
        const tab = this.getActiveTab();
        if (tab) {
          const normalizedUrl = this.normalizeUrl(value);
          this.navigate(tab.id, normalizedUrl);
          suggestions.classList.remove('active');
          document.getElementById('urlInput').blur();
        }
      });
    });
  }

  // Bookmarks
  addBookmark(url, title) {
    const bookmark = { url, title, id: Date.now() };
    this.bookmarks.push(bookmark);
    this.saveToStorage('revo_bookmarks', this.bookmarks);
    this.renderBookmarksBar();
    this.updateBookmarkButton(url);
    this.updateStats();
  }

  removeBookmark(url) {
    this.bookmarks = this.bookmarks.filter(b => b.url !== url);
    this.saveToStorage('revo_bookmarks', this.bookmarks);
    this.renderBookmarksBar();
    this.updateBookmarkButton(url);
    this.updateStats();
  }

  isBookmarked(url) {
    return this.bookmarks.some(b => b.url === url);
  }

  renderBookmarksBar() {
    const container = document.getElementById('bookmarksContainer');
    container.innerHTML = '';

    this.bookmarks.forEach(bookmark => {
      const bookmarkEl = document.createElement('div');
      bookmarkEl.className = 'bookmark-item';
      bookmarkEl.innerHTML = `
        <span class="bookmark-icon">
          <i class="fas fa-star"></i>
        </span>
        <span class="bookmark-label">${this.escapeHtml(bookmark.title)}</span>
      `;
      bookmarkEl.addEventListener('click', () => {
        const tab = this.getActiveTab();
        if (tab) {
          this.navigate(tab.id, bookmark.url);
        } else {
          this.createTab(bookmark.url);
        }
      });
      container.appendChild(bookmarkEl);
    });
  }

  toggleBookmark() {
    const tab = this.getActiveTab();
    if (!tab || tab.url === 'about:newtab') return;

    if (this.isBookmarked(tab.url)) {
      this.removeBookmark(tab.url);
    } else {
      this.addBookmark(tab.url, tab.title);
    }
  }

  updateBookmarkButton(url) {
    const btn = document.getElementById('bookmarkBtn');
    const icon = btn.querySelector('i');
    
    if (this.isBookmarked(url)) {
      btn.classList.add('active');
      icon.className = 'fas fa-star';
    } else {
      btn.classList.remove('active');
      icon.className = 'far fa-star';
    }
  }

  // History
  addToHistory(title, url) {
    if (url === 'about:newtab') return;
    
    const entry = { title, url, timestamp: Date.now() };
    this.history.push(entry);
    
    // Keep last 1000 entries
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }
    
    this.saveToStorage('revo_history', this.history);
  }

  // Event Bindings
  bindEvents() {
    // Window controls
    document.getElementById('minimizeBtn').addEventListener('click', () => {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('window-minimize');
    });

    document.getElementById('maximizeBtn').addEventListener('click', () => {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('window-maximize');
    });

    document.getElementById('closeBtn').addEventListener('click', () => {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('window-close');
    });

    // Tab controls
    document.getElementById('newTabBtn').addEventListener('click', () => {
      this.createTab();
    });

    // Navigation controls
    document.getElementById('backBtn').addEventListener('click', () => this.goBack());
    document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
    document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
    document.getElementById('homeBtn').addEventListener('click', () => this.goHome());

    // URL bar
    const urlInput = document.getElementById('urlInput');
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const tab = this.getActiveTab();
        if (tab) {
          const normalizedUrl = this.normalizeUrl(urlInput.value);
          this.navigate(tab.id, normalizedUrl);
          urlInput.blur();
        }
      }
    });

    urlInput.addEventListener('input', (e) => {
      this.handleUrlInput(e.target.value);
    });

    // Hide suggestions on blur
    urlInput.addEventListener('blur', () => {
      setTimeout(() => {
        document.getElementById('urlSuggestions').classList.remove('active');
      }, 200);
    });

    // Bookmark button
    document.getElementById('bookmarkBtn').addEventListener('click', () => {
      this.toggleBookmark();
    });

    // Menu controls
    document.getElementById('themeBtn').addEventListener('click', () => {
      this.toggleTheme();
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
      this.toggleMenu();
    });

    // NTP search
    document.getElementById('ntpSearchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const tab = this.getActiveTab();
        if (tab) {
          const normalizedUrl = this.normalizeUrl(e.target.value);
          this.navigate(tab.id, normalizedUrl);
        }
      }
    });

    // Quick links
    document.querySelectorAll('.quick-link[data-url]').forEach(link => {
      link.addEventListener('click', () => {
        const url = link.dataset.url;
        const tab = this.getActiveTab();
        if (tab) {
          this.navigate(tab.id, url);
        }
      });
    });

    // NTP shortcuts
    document.getElementById('showBookmarksBtn').addEventListener('click', () => {
      this.openSidebar('bookmarks');
    });

    document.getElementById('showHistoryBtn').addEventListener('click', () => {
      this.openSidebar('history');
    });

    document.getElementById('showSettingsBtn').addEventListener('click', () => {
      this.openSettings();
    });

    // Sidebar
    document.getElementById('sidebarClose').addEventListener('click', () => {
      this.closeSidebar();
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      this.closeSidebar();
    });

    // Settings modal
    document.getElementById('settingsModalClose').addEventListener('click', () => {
      this.closeSettings();
    });

    // Settings controls
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
      this.applySettings();
      this.saveSettings();
    });

    document.getElementById('bookmarksBarToggle').addEventListener('change', (e) => {
      this.settings.showBookmarksBar = e.target.checked;
      const bar = document.getElementById('bookmarksBar');
      bar.classList.toggle('hidden', !e.target.checked);
      this.saveSettings();
    });

    document.getElementById('searchEngineSelect').addEventListener('change', (e) => {
      this.settings.searchEngine = e.target.value;
      this.saveSettings();
    });

    document.getElementById('popupBlockToggle').addEventListener('change', (e) => {
      this.settings.blockPopups = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('dntToggle').addEventListener('change', (e) => {
      this.settings.doNotTrack = e.target.checked;
      this.saveSettings();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+T - New tab
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        this.createTab();
      }
      
      // Ctrl+W - Close tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (this.activeTabId) {
          this.closeTab(this.activeTabId);
        }
      }
      
      // Ctrl+Tab - Next tab
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + this.tabs.length) % this.tabs.length
          : (currentIndex + 1) % this.tabs.length;
        this.switchToTab(this.tabs[nextIndex].id);
      }
      
      // Ctrl+L - Focus URL bar
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        document.getElementById('urlInput').focus();
        document.getElementById('urlInput').select();
      }
      
      // F5 or Ctrl+R - Refresh
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        this.refresh();
      }
      
      // Alt+Left - Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goBack();
      }
      
      // Alt+Right - Forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        this.goForward();
      }
    });

    // Context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => {
      this.hideContextMenu();
    });

    // Context menu actions
    document.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleContextMenuAction(action);
      });
    });
  }

  // Theme
  toggleTheme() {
    const current = this.settings.theme;
    const themes = ['dark', 'light'];
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    this.settings.theme = next;
    document.documentElement.setAttribute('data-theme', next);
    this.saveSettings();
    
    const btn = document.getElementById('themeBtn');
    btn.querySelector('i').className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }

  // Sidebar
  openSidebar(type) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const title = document.getElementById('sidebarTitle');
    const content = document.getElementById('sidebarContent');

    if (type === 'bookmarks') {
      title.textContent = 'Bookmarks';
      content.innerHTML = this.bookmarks.length > 0
        ? this.bookmarks.map(b => `
            <div class="sidebar-item" data-url="${this.escapeHtml(b.url)}">
              <div class="sidebar-item-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="sidebar-item-info">
                <div class="sidebar-item-title">${this.escapeHtml(b.title)}</div>
                <div class="sidebar-item-url">${this.escapeHtml(b.url)}</div>
              </div>
              <button class="sidebar-item-delete" data-url="${this.escapeHtml(b.url)}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `).join('')
        : '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">No bookmarks yet<br><br>Click the star icon to add pages!</p>';
    } else if (type === 'history') {
      title.textContent = 'History';
      const recentHistory = this.history.slice(-50).reverse();
      content.innerHTML = recentHistory.length > 0
        ? recentHistory.map(h => `
            <div class="sidebar-item" data-url="${this.escapeHtml(h.url)}">
              <div class="sidebar-item-icon">
                <i class="fas fa-history"></i>
              </div>
              <div class="sidebar-item-info">
                <div class="sidebar-item-title">${this.escapeHtml(h.title)}</div>
                <div class="sidebar-item-url">${this.escapeHtml(h.url)}</div>
              </div>
            </div>
          `).join('')
        : '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">No history yet<br><br>Start browsing to see your history!</p>';
    }

    // Add click handlers
    content.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar-item-delete')) {
          const url = item.dataset.url;
          const tab = this.getActiveTab();
          if (tab) {
            this.navigate(tab.id, url);
          }
          this.closeSidebar();
        }
      });
    });

    content.querySelectorAll('.sidebar-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        this.removeBookmark(url);
        this.openSidebar('bookmarks');
      });
    });

    sidebar.classList.add('active');
    overlay.classList.add('active');
  }

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }

  // Settings Modal
  openSettings() {
    document.getElementById('settingsModal').classList.add('active');
  }

  closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
  }

  // Context Menu
  showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('active');
  }

  hideContextMenu() {
    document.getElementById('contextMenu').classList.remove('active');
  }

  handleContextMenuAction(action) {
    switch (action) {
      case 'back':
        this.goBack();
        break;
      case 'forward':
        this.goForward();
        break;
      case 'refresh':
        this.refresh();
        break;
      case 'bookmark':
        this.toggleBookmark();
        break;
      case 'inspect':
        const tab = this.getActiveTab();
        if (tab) {
          const webView = document.getElementById(`webview-${tab.id}`);
          if (webView) {
            const webview = webView.querySelector('webview');
            webview.openDevTools();
          }
        }
        break;
    }
  }

  // Utilities
  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  }

  updateNavigationButtons() {
    const tab = this.getActiveTab();
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');

    if (tab && tab.webview) {
      // Use webview's built-in navigation state
      backBtn.disabled = !tab.webview.canGoBack();
      forwardBtn.disabled = !tab.webview.canGoForward();
    } else {
      backBtn.disabled = true;
      forwardBtn.disabled = true;
    }
  }

  updateStatus(message) {
    document.getElementById('statusText').textContent = message;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  toggleMenu() {
    this.openSettings();
  }

  // Update Stats on New Tab Page
  updateStats() {
    const bookmarkCountEl = document.getElementById('bookmarkCount');
    const historyCountEl = document.getElementById('historyCount');
    const tabsCountEl = document.getElementById('tabsCount');

    if (bookmarkCountEl) {
      bookmarkCountEl.textContent = this.bookmarks.length;
    }

    if (historyCountEl) {
      historyCountEl.textContent = this.history.length;
    }

    if (tabsCountEl) {
      tabsCountEl.textContent = this.tabs.length;
    }
  }

  // Tips Rotation
  initTipsRotation() {
    const tipCards = document.querySelectorAll('.tip-card');
    if (tipCards.length === 0) return;

    let currentTip = 0;

    setInterval(() => {
      tipCards[currentTip].classList.remove('active');
      currentTip = (currentTip + 1) % tipCards.length;
      tipCards[currentTip].classList.add('active');
    }, 4000); // Change tip every 4 seconds
  }
}

// Initialize browser when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.revoBrowser = new RevoBrowser();
});

// Electron IPC handlers
const { ipcRenderer } = require('electron');

ipcRenderer.on('navigate', (event, url) => {
  if (window.revoBrowser) {
    const tab = window.revoBrowser.getActiveTab();
    if (tab) {
      window.revoBrowser.navigate(tab.id, url);
    }
  }
});
