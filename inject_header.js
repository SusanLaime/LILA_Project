// inject_header.js
const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.html')) filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const htmlFiles = walkSync('d:/UPB D/UPB 6th Semester/Intern Practice/LILA/frontend/website/');

let changed = 0;
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Remove old header
    if (content.match(/<header>[\s\S]*?<\/header>/)) {
        content = content.replace(/<header>[\s\S]*?<\/header>/, '');
        modified = true;
    }

    // 2. Remove old footer
    if (content.match(/<footer class="navegacin">[\s\S]*?<\/footer>/)) {
        content = content.replace(/<footer class="navegacin">[\s\S]*?<\/footer>/, '');
        modified = true;
    }

    // 3. Inject header-placeholder right after <body>
    if (!content.includes('id="header-placeholder"')) {
        content = content.replace(/<body>/i, '<body>\n    <div id="header-placeholder"></div>');
        modified = true;
    }

    // 4. Inject module script to call initHeader
    if (!content.includes('initHeader')) {
        const scriptHtml = `
    <!-- Initialize Dynamic Header -->
    <script type="module">
        import { initHeader } from '../../assets/js/components.js';
        const role = window.location.pathname.includes('empleador') ? 'empleador' : 'trabajador';
        initHeader(role, true);
    </script>
`;
        content = content.replace(/<\/body>/i, scriptHtml + '</body>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        changed++;
    }
});
console.log(`Successfully updated ${changed} HTML files to use the dynamic header component.`);
