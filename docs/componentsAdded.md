# LILA MVP Components Walkthrough
# 1
I have successfully implemented your suggested components in the `/frontend` directory, strictly adhering to the requirements set by the `Team_LILA_DossierFinal.md` document for the MVP phase. 

Below is a summary of the changes made and how you can use these new components in your HTML pages.

## Changes Made

### 1. Reusable HTML Components
I created the structural HTML for your components in `frontend/components/`:
- **`header.html`**: Contains the LILA logo, a dynamic role indicator, the `✓ Verificado` badge (hidden by default, shown conditionally via JS), and the notifications bell icon.
- **`footer.html`**: A clean, minimalist footer with links to Terms & Conditions, Privacy Policy, and a highlighted link to report problems.
- **`nav.html`**: The bottom app shell navigation wrapper. The links inside this nav are injected dynamically based on whether the user is a `trabajador` or `empleador`.

### 2. Component Logic (`components.js`)
I created **`frontend/assets/js/components.js`**. This script handles fetching the HTML partials and injecting them into your pages so you don't have to copy-paste the header/footer code everywhere.

It exports four main functions:
- `initHeader(role, isVerified)`: Fetches the header and updates the UI based on role and verification status.
- `initFooter()`: Fetches and injects the footer.
- `initNav(role)`: Fetches the bottom navigation shell and injects the correct links for the given role.
- `createJobCard(jobData)`: A function that takes a job object and returns a fully constructed Job Card DOM element, complete with the "Ver Detalles" button instead of a direct "Aplicar" button, as you brilliantly suggested.

### 3. Component Styling
I created dedicated CSS files for each component in **`frontend/assets/css/components/`**:
- `header.css`
- `footer.css`
- `nav.css`
- `job-card.css`

## How to use them in your pages

To use these in a page like `buscar.html`, follow this simple setup:

**1. Include the placeholders in your HTML body:**
```html
<body>
    <div id="header-placeholder"></div>
    
    <main>
        <!-- Your page content goes here, e.g., the job list container -->
        <div id="job-list"></div>
    </main>

    <div id="footer-placeholder"></div>
    <div id="nav-placeholder"></div>
</body>
```

**2. Include the CSS in your `<head>`:**
```html
<link rel="stylesheet" href="../assets/css/components/header.css">
<link rel="stylesheet" href="../assets/css/components/footer.css">
<link rel="stylesheet" href="../assets/css/components/nav.css">
<link rel="stylesheet" href="../assets/css/components/job-card.css">
```

**3. Initialize them with JavaScript:**
At the bottom of your page (or in your `app.js`), import and call the initialization functions:
```javascript
<script type="module">
    import { initHeader, initFooter, initNav, createJobCard } from '../assets/js/components.js';

    // Example user state (this would normally come from your auth/session logic)
    const userRole = 'trabajador'; 
    const isVerified = true;

    // Initialize layout
    initHeader(userRole, isVerified);
    initFooter();
    initNav(userRole);

    // Example job card rendering
    const sampleJob = {
        id: 1,
        title: "Ayudante de Cocina para Fin de Semana",
        employerVerified: true,
        location: "Cochabamba Centro",
        date: "Sábado 15 de Octubre",
        category: "Gastronomía",
        payment: "Bs. 150/día",
        descriptionSnippet: "Se necesita ayudante de cocina con experiencia básica para un evento de fin de semana..."
    };

    const jobListContainer = document.getElementById('job-list');
    const jobCardElement = createJobCard(sampleJob);
    jobListContainer.appendChild(jobCardElement);
</script>
```

## Validation Results
All components align with the MVP requirements. The codebase is now set up to be highly modular without requiring a heavy frontend framework. The Job Card specifically ensures the two-step application flow is enforced to protect the user's daily postulation limits.



# 2


# Top Navbar Refactoring Implementation Plan

This plan outlines the steps to elevate your navigation into a unified Bootstrap Top Navbar within `header.html`, while ensuring all static pages receive the necessary Bootstrap dependencies.

## Proposed Changes

### 1. Consolidate into `header.html`
We will rewrite `frontend/components/header.html` to be the sole navigation component, formatted as a Bootstrap Navbar. It will house the LILA brand, the Role badge, the Verified badge alongside the Notification icon (all outside the hamburger toggler), and the collapsible navigation menu:

```html
<nav class="navbar navbar-expand-custom navbar-light bg-light lila-top-nav">
  <a class="navbar-brand lila-brand" href="#">LILA</a>
  
  <!-- Badges & Notifications outside toggler -->
  <div class="d-flex align-items-center me-auto ml-auto ms-3" style="margin-right: auto; margin-left: 1rem; gap: 0.5rem;">
    <span class="navbar-badge" id="lila-role-badge">TRABAJADOR</span>
    <span class="navbar-badge" id="lila-verified-badge" style="display: none;">VERIFIED</span>
    <button class="lila-notifications-btn" aria-label="Notificaciones">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
    </button>
  </div>
  
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  
  <div class="collapse navbar-collapse" id="navbarNavDropdown">
    <ul class="navbar-nav ml-auto ms-auto" id="lila-nav-links">
      <!-- Links injected dynamically -->
    </ul>
  </div>
</nav>
```

### 2. Update `components.js`
We will modify `frontend/assets/js/components.js`:
- Update `initHeader(role, isVerified)` to inject the exact requested navigation links (`⌂ Inicio`, `⌕ Buscar`, `♙ Perfil`, `⍈ Salir`) directly into the `#lila-nav-links` list.
- Update `initHeader` to dynamically change the text of `#lila-role-badge` to either "TRABAJADOR" or "EMPLEADOR" based on the passed `role`.
- Remove the obsolete `initNav` function, as the bottom navigation menu is no longer used.

### 3. Apply Styling (`header.css`)
We will rewrite `frontend/assets/css/components/header.css` to fulfill the core requirements:
- **Badge Styling:** Both the role and verified badges will share the `.navbar-badge` class with `border-radius: 20px`, text color `#6b46c1` (lavender), and background color `#e9d8fd` (light purple palette).
- **Notification Icon:** Styled to match the header seamlessly.
- **Breakpoint Overrides:** A custom `@media` query that forces the navbar to display horizontally (hiding the hamburger) on screens `426px` and wider, while collapsing into the hamburger menu strictly on screens `425px` or smaller.

### 4. Inject Bootstrap Dependencies into Static Pages
To ensure the hamburger toggler works across your application, I will run a fast Node.js script that automatically injects the **Bootstrap CSS** into the `<head>` and the **Bootstrap JS** (with jQuery) before the `</body>` tag of every HTML file in your `frontend/website/` directory.
- *Note: `login.html` and `register.html` will be strictly excluded from this injection.*

## User Review Required

> [!IMPORTANT]
> **Automation Script for Dependencies**
> To fulfill the requirement of ensuring all HTML pages have Bootstrap included, my final step will be to run a script (`inject_bootstrap.js`) that performs a safe find-and-replace to add the CDN links to your static pages.
> 
> If you approve this updated plan, click "Proceed" and I will update the components and automatically inject the Bootstrap dependencies for you!


# 2
# LILA MVP Bug Fix Implementation Plan

Based on the deep analysis of the bug report provided against the current `LILA` working directory, I have found that **most of these bugs have already been resolved** through our recent refactors (like the dynamic Bootstrap top header and the detailed job pages). 

Here is my analysis of the reported bugs and the proposed plan to address the remaining ones:

## Deep Analysis of Reported Bugs vs Current Codebase

### 1. Critical User Flow Blockers
- **A. Broken Registration Routing**: The routing logic exists in `shell.js`, which correctly routes users based on their selected role. I will perform a final verification to ensure no race conditions prevent the redirect.
- **B. Role Bleeding in Navigation**: **[ALREADY FIXED]** We recently refactored the hardcoded bottom navigations into a single, unified dynamic top header (`header.html`) powered by `components.js`, which strictly separates Worker and Employer links.

### 2. Missing MVP Features (Logic Gaps)
- **A. Missing Job Detail View for Workers**: **[ALREADY FIXED]** We implemented `oferta_detalle.html` and linked it from `buscar.html`.
- **B. Missing "Report Suspicious Offer" Button**: **[ALREADY FIXED]** This was recently added to the `oferta_detalle.html` page.
- **C. Incomplete Bidirectional Rating**: **[ALREADY FIXED]** The employer-side rating screen (`empleador/resenas.html`) exists and functions as the counterpart to the worker-side rating screen.
- **D. No Edit/Delete for Published Jobs**: **[ALREADY FIXED]** Edit (✏️) and Delete (🗑️) action buttons are present in `empleador/ofertas.html`.

### 3. UI / UX & Code Quality Issues
- **A. Heavy Reliance on Inline Styles**: **[NEEDS FIX]** Files like `perfil.html`, `resenas.html`, and `oferta.html` still contain heavy inline styles (e.g., `style="text-align: center; max-width: 400px; margin: 0 auto;"`). I will extract these into a dedicated CSS file (e.g., `assets/css/pages/profile.css`) and replace them with standard classes.
- **B. Dead Links ("#")**: **[ALREADY FIXED]** The legacy bottom navigation has been fully deprecated and removed. All current top header links are properly routed.
- **C. Javascript is Too Basic**: **[ALREADY FIXED]** `shell.js` and `components.js` have been upgraded. The job detail linking now relies on standard `<a>` tag routing rather than strict `.aplicar-vendedor` Javascript overrides.

---

## User Review Required
> [!IMPORTANT]
> The vast majority of the bugs you reported from the previous build (`LILA_v1`) have **already been fixed** in our current `LILA` directory!
> The only major remaining task is to clean up the inline CSS styles in the profile and review pages. 

## Proposed Changes
I will focus execution on addressing **Issue 3A (Inline Styles)** to ensure the codebase remains maintainable.

### `assets/css/pages/profile.css`
#### [NEW] `assets/css/pages/profile.css`
- I will create this new stylesheet containing the classes required to style the profile, reviews, and offer pages, extracting the inline properties.

### Component Updates
#### [MODIFY] `frontend/website/trabajador/perfil.html`
- Remove inline `style="..."` attributes and assign appropriate classes.
- Link the new `profile.css` stylesheet.

#### [MODIFY] `frontend/website/empleador/resenas.html`
- Remove inline `style="..."` attributes and assign appropriate classes.
- Link the new `profile.css` stylesheet.

#### [MODIFY] `frontend/website/empleador/oferta.html`
- Remove inline `style="..."` attributes and assign appropriate classes.
- Link the new `profile.css` stylesheet.

## Verification Plan
1. **Visual Regression Testing**: Ensure that `perfil.html`, `resenas.html`, and `oferta.html` look exactly the same after migrating from inline styles to CSS classes.
2. **Routing Verification**: Manually verify the form submission in `auth/register.html` to guarantee JS intercepts and routes correctly.


# 3


# LILA Navbar & Footer Implementation Plan

As requested, I have reviewed the `Team_LILA_DossierFinal.md` (specifically Section 7: Definición final del MVP and Section 8: Historias de usuario priorizadas). Based on these requirements, here is the proposed structure for the two distinct navbars and the plan to implement a consistent footer across the entire application.

## Navbar Options Recommendation

According to the MVP requirements, the core value proposition revolves around **connecting workers and employers safely**. The navbars should reflect the distinct user journeys outlined in the dossier.

### Trabajador (Worker) Navbar
The worker's MVP flow is centered around finding jobs and getting verified.
1. **Buscar (Search):** Addresses *HU-02* (viewing and filtering offers).
2. **Mis Postulaciones (My Applications):** Addresses *HU-03a* and *HU-03b* (managing applications and seeing the 3-postulation daily limit).
3. **Mi Perfil (Profile):** Addresses *HU-01* (Identity verification and uploading ID).

*Proposed Structure:* `[ Buscar ]` | `[ Mis Postulaciones ]` | `[ Mi Perfil ]` | `[ Salir ]`

### Empleador (Employer) Navbar
The employer's MVP flow is centered around publishing jobs and reviewing applicants.
1. **Crear Oferta (Create Offer):** Addresses *HU-04* (Publishing an offer with title, description, payment, etc.). Currently missing from the UI.
2. **Mis Ofertas (My Offers):** Addresses *HU-05* (Viewing published offers, managing candidates, seeing verified badges).
3. **Mi Perfil (Profile):** Addresses *HU-01* (Employer registration and verification).

*Proposed Structure:* `[ Crear Oferta ]` | `[ Mis Ofertas ]` | `[ Mi Perfil ]` | `[ Salir ]`

---

## Proposed Changes (Footer & Navbar Updates)

### Component Injection
#### [MODIFY] `frontend/assets/js/components.js`
- Update the `initHeader(role)` function to inject the exact Navbar structures proposed above based on the role.
- **Routing:** Ensure all injected navbar links have correct and functional `href` attributes pointing to the respective HTML pages.
- **Dynamic Logo Routing:** Update the `href` attribute of the `<a class="navbar-brand">` logo element so that clicking the `L-logo-oficial.png` directs a **Worker** to `../trabajador/buscar.html` and an **Employer** to `../empleador/crear_oferta.html` (or whatever the main creation page is named).
- Ensure `initFooter()` is robust and can be called from any page.

### The Global Footer
#### [MODIFY] `frontend/components/footer.html`
- Update the styles to match the dimensions and background color of `login.html`.
- Apply `background-color: #f2edfa;` (the lavender tone of the logo).
- Apply padding similar to `padding: 60px 0 40px 0;`.
- Center the content and keep the existing links/text intact.

### Page Updates
I will iterate through **ABSOLUTELY ALL** fully-rendered HTML pages across the platform (`frontend/auth/*` and `frontend/website/*`) and inject the `<div id="footer-placeholder"></div>` at the bottom of the page along with the `initFooter()` logic, removing any hardcoded footers.

**EXCLUSION RULE:** The files inside the `frontend/components/` folder (such as `header.html` and `nav.html`) will **NOT** have the footer injected into them, since they are just HTML fragments. The only modification in the `components` folder will be to the actual `footer.html` file to apply the new lavender styling.

This includes every single page in these directories:
#### [MODIFY] `frontend/auth/*`
- `login.html`
- `register.html`
#### [MODIFY] `frontend/website/trabajador/*`
- `inicio.html` (if exists)
- `buscar.html`
- `perfil.html`
- `oferta_detalle.html`
- `verificacion.html`
#### [MODIFY] `frontend/website/empleador/*`
- `inicio.html` (if exists)
- `ofertas.html`
- `oferta.html`
- `resenas.html`

## User Review Required
> [!IMPORTANT]
> Please review the proposed Navbar options for both the Worker and the Employer. Do these align with your vision for the MVP? 
> Once you approve, I will proceed with modifying the code to split the navbars and inject the formatted lavender footer across all pages.


# 4


# LILA Navbar & Footer Implementation Plan

As requested, I have reviewed the `Team_LILA_DossierFinal.md` (specifically Section 7: Definición final del MVP and Section 8: Historias de usuario priorizadas). Based on these requirements, here is the proposed structure for the two distinct navbars and the plan to implement a consistent footer across the entire application.

## Navbar Options Recommendation

According to the MVP requirements, the core value proposition revolves around **connecting workers and employers safely**. The navbars should reflect the distinct user journeys outlined in the dossier.

### Trabajador (Worker) Navbar
The worker's MVP flow is centered around finding jobs and getting verified.
1. **Buscar (Search):** Addresses *HU-02* (viewing and filtering offers).
2. **Mis Postulaciones (My Applications):** Addresses *HU-03a* and *HU-03b* (managing applications and seeing the 3-postulation daily limit).
3. **Mi Perfil (Profile):** Addresses *HU-01* (Identity verification and uploading ID).

*Proposed Structure:* `[ Buscar ]` | `[ Mis Postulaciones ]` | `[ Mi Perfil ]` | `[ Salir ]`

### Empleador (Employer) Navbar
The employer's MVP flow is centered around publishing jobs and reviewing applicants.
1. **Crear Oferta (Create Offer):** Addresses *HU-04* (Publishing an offer with title, description, payment, etc.). Currently missing from the UI.
2. **Mis Ofertas (My Offers):** Addresses *HU-05* (Viewing published offers, managing candidates, seeing verified badges).
3. **Mi Perfil (Profile):** Addresses *HU-01* (Employer registration and verification).

*Proposed Structure:* `[ Crear Oferta ]` | `[ Mis Ofertas ]` | `[ Mi Perfil ]` | `[ Salir ]`

---

## Proposed Changes (Footer & Navbar Updates)

### Component Injection
#### [MODIFY] `frontend/assets/js/components.js`
- Update the `initHeader(role)` function to inject the exact Navbar structures proposed above based on the role.
- **Routing:** Ensure all injected navbar links have correct and functional `href` attributes pointing to the respective HTML pages.
- **Dynamic Logo Routing:** Update the `href` attribute of the `<a class="navbar-brand">` logo element so that clicking the `L-logo-oficial.png` directs a **Worker** to `../trabajador/buscar.html` and an **Employer** to `../empleador/crear_oferta.html` (or whatever the main creation page is named).
- Ensure `initFooter()` is robust and can be called from any page.

### The Global Footer
#### [MODIFY] `frontend/components/footer.html` & Layouts
- **Preserve Legal Text:** I will ensure the original message *"Al registrarte, aceptas nuestros Términos y Condiciones"* (or *"Al continuar..."*) is kept directly inside the `register.html` and `login.html` pages just above the global footer.
- **Attachment & Width:** The footer will have a strict `max-width: 2560px; width: 100%;`. To guarantee it is ALWAYS attached to the bottom of the screen regardless of content height, I will use CSS Flexbox (`min-height: 100vh`, `display: flex`, `flex-direction: column` on the `body` or `main`) and apply `margin-top: auto;` to the footer placeholder, or use fixed positioning if necessary.
- **Image Description & Layout Match:** Based on the uploaded image, the new footer layout is centered and structured as follows:
  1. A bold title: **LILA – Librería Laboral**
  2. Subtitle: Cochabamba
  3. A copyright notice: © 2026 LILA. All Rights Reserved
  4. A 2-column grid of underlined links:
     - *Column 1:* `Términos y Condiciones` and `Reportar un Problema`
     - *Column 2:* `Política de Privacidad` and `Ley del Trabajo`
- **Official Link:** I will add the "Ley del Trabajo" link directing to the official Bolivian Ministry of Labor website (`https://www.mintrabajo.gob.bo/` or the official PDF).
- **Styling:** Apply `background-color: #f2edfa;` (the lavender tone), ensure the text is dark, and the links are underlined as shown in the image.

### Page Updates
I will iterate through **ABSOLUTELY ALL** fully-rendered HTML pages across the platform (`frontend/auth/*` and `frontend/website/*`) and inject the `<div id="footer-placeholder"></div>` at the bottom of the page along with the `initFooter()` logic, removing any hardcoded footers.

**EXCLUSION RULE:** The files inside the `frontend/components/` folder (such as `header.html` and `nav.html`) will **NOT** have the footer injected into them, since they are just HTML fragments. The only modification in the `components` folder will be to the actual `footer.html` file to apply the new lavender styling.

This includes every single page in these directories:
#### [MODIFY] `frontend/auth/*`
- `login.html`
- `register.html`
#### [MODIFY] `frontend/website/trabajador/*`
- `inicio.html` (if exists)
- `buscar.html`
- `perfil.html`
- `oferta_detalle.html`
- `verificacion.html`
#### [MODIFY] `frontend/website/empleador/*`
- `inicio.html` (if exists)
- `ofertas.html`
- `oferta.html`
- `resenas.html`

## User Review Required
> [!IMPORTANT]
> Please review the proposed Navbar options for both the Worker and the Employer. Do these align with your vision for the MVP? 
> Once you approve, I will proceed with modifying the code to split the navbars and inject the formatted lavender footer across all pages.


# 5


# 3-State Verification Badge Implementation

I have successfully updated the header verification badge to dynamically display its status based on a 3-state system, defaulting to the English vocabulary as requested ("PENDING"). 

Here is exactly what I modified in the codebase to make this happen:

## 1. Updated `components.js` Logic
I modified the `initHeader(role, verificationStatus)` function to accept a `verificationStatus` string. The badge now dynamically renders based on this value:
- **`'verified'`**: Renders **"VERIFIED"** in the classic LILA lavender background (`#F2EDFA`) with dark text.
- **`'pending'`**: Renders **"PENDING"** with a warning yellow background (`#FFF3CD`) and dark yellow text (`#856404`).
- **`'unverified'`**: Renders **"NOT VERIFIED"** with a gray background (`#E2E3E5`) and dark gray text (`#383D41`).

*Note: For safety, I also added backward compatibility so that if any older script passes a boolean `true`, it automatically maps to `'verified'`.*

## 2. Updated Static HTML Calls
To ensure everything looks correct right now, I ran a global replacement across all **10** dashboard HTML files in both the `trabajador` and `empleador` directories. 
- I explicitly updated `initHeader(role, true)` to `initHeader(role, 'verified')`. 

Everything is now properly configured! If a user's verification progress increases but they haven't finished the video call, you simply pass `'pending'` to `initHeader()` and the UI will automatically update.
