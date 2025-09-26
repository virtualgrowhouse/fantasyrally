class App {
    constructor() {
        this.currentView = 'gallery';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupGallery();
        this.waitForDependencies();
    }

    waitForDependencies() {
        // Wait for all components to be ready
        const checkDependencies = () => {
            if (window.fileManager && window.thumbnailGenerator && window.viewer && window.openWorld) {
                this.onAllReady();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
    }

    onAllReady() {
        console.log('All components ready');
        this.loadGallery();
    }

    setupNavigation() {
        const galleryBtn = document.getElementById('galleryBtn');
        const viewerBtn = document.getElementById('viewerBtn');
        const worldBtn = document.getElementById('worldBtn');

        if (galleryBtn) {
            galleryBtn.addEventListener('click', () => this.switchView('gallery'));
        }

        if (viewerBtn) {
            viewerBtn.addEventListener('click', () => this.switchView('viewer'));
        }

        if (worldBtn) {
            worldBtn.addEventListener('click', () => this.switchView('world'));
        }
    }

    switchView(view) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(`${view}Btn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Switch view sections
        document.querySelectorAll('.view').forEach(section => {
            section.classList.remove('active');
        });

        const activeView = document.getElementById(view);
        if (activeView) {
            activeView.classList.add('active');
        }

        this.currentView = view;

        // Trigger resize for Three.js renderers
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    setupGallery() {
        this.setupSearch();
        this.setupFilters();
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        const performSearch = () => {
            const query = searchInput ? searchInput.value : '';
            this.filterGallery(query);
        };

        if (searchInput) {
            searchInput.addEventListener('input', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
    }

    setupFilters() {
        const sortSelect = document.getElementById('sortSelect');

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortGallery(sortSelect.value);
            });
        }
    }

    async loadGallery() {
        const grid = document.getElementById('thumbnailGrid');
        if (!grid || !window.fileManager || !window.thumbnailGenerator) return;

        // Show loading state
        grid.innerHTML = '<div class="loading">Loading gallery...</div>';

        try {
            const files = window.fileManager.getFiles();
            grid.innerHTML = '';

            // Load thumbnails in batches to prevent overwhelming
            const batchSize = 6;
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);

                await Promise.all(batch.map(async (file) => {
                    try {
                        const thumbnailElement = await window.thumbnailGenerator.generateThumbnailElement(file);
                        grid.appendChild(thumbnailElement);
                    } catch (error) {
                        console.error(`Error generating thumbnail for ${file.name}:`, error);
                    }
                }));

                // Small delay between batches to keep UI responsive
                if (i + batchSize < files.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

        } catch (error) {
            console.error('Error loading gallery:', error);
            grid.innerHTML = '<div class="error">Error loading gallery. Please refresh the page.</div>';
        }
    }

    filterGallery(query) {
        if (!window.fileManager) return;

        const filteredFiles = window.fileManager.searchFiles(query);
        this.updateGalleryDisplay(filteredFiles);
    }

    sortGallery(criteria) {
        if (!window.fileManager) return;

        const sortedFiles = window.fileManager.sortFiles(criteria);
        this.updateGalleryDisplay(sortedFiles);
    }

    async updateGalleryDisplay(files) {
        const grid = document.getElementById('thumbnailGrid');
        if (!grid || !window.thumbnailGenerator) return;

        grid.innerHTML = '';

        for (const file of files) {
            try {
                const thumbnailElement = await window.thumbnailGenerator.generateThumbnailElement(file);
                grid.appendChild(thumbnailElement);
            } catch (error) {
                console.error(`Error generating thumbnail for ${file.name}:`, error);
            }
        }
    }

    // Utility methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#4a90e2'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getPerformanceStats() {
        const stats = {
            totalModels: window.fileManager ? window.fileManager.files.length : 0,
            loadedThumbnails: window.thumbnailGenerator ? window.thumbnailGenerator.thumbnails.size : 0,
            currentView: this.currentView,
            modelsInWorld: window.openWorld ? window.openWorld.models.length : 0
        };

        return stats;
    }

    // Debug methods
    debugInfo() {
        console.group('3D Cars Gallery Debug Info');
        console.log('Performance Stats:', this.getPerformanceStats());
        console.log('File Manager:', window.fileManager);
        console.log('Thumbnail Generator:', window.thumbnailGenerator);
        console.log('Viewer:', window.viewer);
        console.log('Open World:', window.openWorld);
        console.groupEnd();
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app) {
        window.app.showNotification('An error occurred. Check the console for details.', 'error');
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.showNotification('An error occurred loading content.', 'error');
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();

    // Add debug command to console
    window.debug = () => window.app.debugInfo();

    console.log('3D Cars Gallery initialized. Type debug() for debug info.');
});