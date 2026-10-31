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

// Target all HTML files in website/ directory (excludes auth/ folder like login/register)
const htmlFiles = walkSync('d:/UPB D/UPB 6th Semester/Intern Practice/LILA/frontend/website/');

const navbarTemplate = `
        <nav class="navbar navbar-expand-custom navbar-light bg-light lila-top-nav">
          <a class="navbar-brand lila-brand" href="#">LILA</a>
          
          <span class="navbar-verified-badge" id="lila-verified-badge">VERIFIED</span>
          
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav ml-auto" id="lila-nav-links">
                <li class="nav-item"><a class="nav-link" href="inicio.html"><span aria-hidden="true">⌂</span> Inicio</a></li>
                <li class="nav-item"><a class="nav-link" href="buscar.html"><span aria-hidden="true">⌕</span> Buscar</a></li>
                <li class="nav-item"><a class="nav-link" href="perfil.html"><span aria-hidden="true">♙</span> Perfil</a></li>
                <li class="nav-item"><a class="nav-link" href="../../auth/login.html"><span aria-hidden="true">⍈</span> Salir</a></li>
            </ul>
          </div>
        </nav>
`;

const bootstrapCss = `
    <!-- Bootstrap CSS for Navbar -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../assets/css/components/header.css">
`;

const bootstrapJs = `
    <!-- Bootstrap JS for Navbar -->
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove old bottom footer navigation
    content = content.replace(/<footer class="navegacin">[\s\S]*?<\/footer>/, '');

    // 2. Replace old static <header> with the new Bootstrap navbar
    // Use regex that carefully targets <header>...</header> tags. 
    // If <header> doesn't exist, we might need to inject it right after <main class="..."> or <body>
    if (content.match(/<header>[\s\S]*?<\/header>/)) {
        content = content.replace(/<header>[\s\S]*?<\/header>/, navbarTemplate.trim());
    } else {
        // Fallback: inject after <body>
        content = content.replace('<body>', '<body>\n' + navbarTemplate.trim());
    }

    // 3. Inject Bootstrap CSS
    if (!content.includes('bootstrap.min.css')) {
        content = content.replace('</head>', bootstrapCss + '\n</head>');
    }

    // 4. Inject Bootstrap JS
    if (!content.includes('bootstrap.bundle.min.js')) {
        content = content.replace('</body>', bootstrapJs + '\n</body>');
    }

    fs.writeFileSync(file, content);
    console.log('Updated:', file);
});
