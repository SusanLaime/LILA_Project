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

// Target all HTML files in website/ directory
const htmlFiles = walkSync('d:/UPB D/UPB 6th Semester/Intern Practice/LILA/frontend/website/');

const bootstrapCss = `
    <!-- Bootstrap CSS for Navbar -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
`;

const bootstrapJs = `
    <!-- Bootstrap JS for Navbar -->
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
`;

let changed = 0;
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Inject Bootstrap CSS before </head> if not exists
    if (!content.includes('bootstrap.min.css')) {
        content = content.replace('</head>', bootstrapCss + '\n</head>');
        modified = true;
    }

    // Inject Bootstrap JS before </body> if not exists
    if (!content.includes('bootstrap.bundle.min.js')) {
        content = content.replace('</body>', bootstrapJs + '\n</body>');
        modified = true;
    }
    
    // Inject header.css if not exists
    if (!content.includes('header.css')) {
        content = content.replace('</head>', '    <link rel="stylesheet" href="../../assets/css/components/header.css">\n</head>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        changed++;
    }
});

console.log(`Successfully injected Bootstrap dependencies into ${changed} static HTML files.`);
