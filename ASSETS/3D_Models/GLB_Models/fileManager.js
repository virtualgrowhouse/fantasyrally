class FileManager {
    constructor() {
        this.files = [];
        this.filteredFiles = [];
        this.init();
    }

    async init() {
        await this.scanFiles();
        this.populateModelSelect();
    }

    async scanFiles() {
        // In a real environment, this would scan the directory
        // For now, we'll manually list the GLB files we found
        const glbFiles = [
            '0.glb', '0 (1).glb', '0 (2).glb', '0 (3).glb', '0 (4).glb',
            '0 (5).glb', '0 (6).glb', '0 (7).glb', '0 (8).glb', '0 (9).glb',
            '0 (10).glb', '0 (11).glb', '0 (12).glb', '0 (13).glb', '0 (14).glb',
            '0 (15).glb', '0 (16).glb', '0 (17).glb', '0 (19).glb', '0 (20).glb',
            '0 (21).glb', '0 (22).glb', '0 (23).glb', '0 (24).glb', '0 (25).glb',
            '0 (26).glb', '0 (27).glb', '0 (28).glb', '0 (29).glb', '0 (30).glb',
            '0 (31).glb', '0 (32).glb', '0 (33).glb', '0 (34).glb', '0 (35).glb',
            '0 (36).glb', '4_bedroom_3bath_luxur_0714181403_texture.glb',
            '5029ad7b-75b9-46f3-be5c-ae3a214f9e73.glb',
            'cf2a1f36-a3d3-4a68-8656-ca5ab3b9c919_white_mesh.glb',
            'detailgen3d_eotuj6xd.glb', 'detailgen3d_s0jahzf5.glb',
            'Fantasy_Rally_Showdow_0714171004_texture.glb',
            'High_Octane_Drag_Rac_0204054716_texture.glb',
            'model.glb', 'model (1).glb', 'model (2).glb', 'model (3).glb',
            'model (4).glb', 'model (5).glb', 'Modern_Serenity_0714171027_texture.glb',
            'number `1.glb', 'number cincio.glb', 'number dos.glb', 'number quatro.glb',
            'number sevenalelflef.glb', 'number seys.glb', 'number tres.glb',
            'numero ocho.glb', 'object.glb', 'Orange_Racer_on_the_R_0714171017_texture.glb',
            'partpacker_20250617_225653.glb', 'Racecar_stanced_car__0204061642_texture.glb',
            'Red_Elegance_on_the_B_0603082717_texture.glb',
            'sample.glb', 'sample (1).glb', 'sample (2).glb', 'sample (3).glb',
            'sample (4).glb', 'sample (5).glb', 'Speed_Aesthetic_0714170948_texture.glb',
            'tmp4os222s0.glb', 'tmpfamy0kyl.glb', 'tmpmex6xq0f.glb',
            'tmpn3vm28wz.glb', 'tmpn3vm28wz (1).glb', 'tmpppuu47gt.glb',
            'white_mesh.glb'
        ];

        this.files = glbFiles.map(filename => ({
            name: filename,
            displayName: this.getDisplayName(filename),
            path: `./${filename}`,
            size: this.getRandomSize(), // Simulated file size
            type: 'glb',
            lastModified: this.getRandomDate()
        }));

        this.filteredFiles = [...this.files];
    }

    getDisplayName(filename) {
        // Convert filename to a more readable display name
        return filename
            .replace(/\.glb$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\(\d+\)/g, (match) => ` ${match}`)
            .trim();
    }

    getRandomSize() {
        // Simulate file sizes between 1MB and 50MB
        return Math.floor(Math.random() * 49 + 1);
    }

    getRandomDate() {
        // Simulate recent modification dates
        const start = new Date(2024, 0, 1);
        const end = new Date();
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    populateModelSelect() {
        const select = document.getElementById('modelSelect');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select a model...</option>';

        this.files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.path;
            option.textContent = file.displayName;
            select.appendChild(option);
        });
    }

    searchFiles(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredFiles = this.files.filter(file =>
            file.displayName.toLowerCase().includes(lowerQuery) ||
            file.name.toLowerCase().includes(lowerQuery)
        );
        return this.filteredFiles;
    }

    sortFiles(criteria) {
        this.filteredFiles.sort((a, b) => {
            switch (criteria) {
                case 'name':
                    return a.displayName.localeCompare(b.displayName);
                case 'size':
                    return b.size - a.size;
                case 'date':
                    return b.lastModified - a.lastModified;
                default:
                    return 0;
            }
        });
        return this.filteredFiles;
    }

    getFiles() {
        return this.filteredFiles;
    }

    getRandomFiles(count) {
        const shuffled = [...this.files].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, this.files.length));
    }

    getFileByPath(path) {
        return this.files.find(file => file.path === path);
    }

    formatFileSize(sizeInMB) {
        if (sizeInMB < 1) {
            return `${Math.round(sizeInMB * 1024)} KB`;
        }
        return `${sizeInMB.toFixed(1)} MB`;
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Global instance
window.fileManager = new FileManager();